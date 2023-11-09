// Initialize mongoose and connect to the models
const mongoose = require("mongoose");

const process = require("process");

module.exports = (executor, mongoose, schema) => async (req, res, next) => {
  let response;
  let headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Expose-Headers": "*",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-XSS-Protection": "1; mode=block",
    "X-Frame-Options": "DENY",
    "Cache-control": "no-store",
    Pragma: "no-cache",
  };
  try{
    // validating payload of body fields by defining schema
    if (schema) {
      const Ajv = require("ajv");
      const ajv = new Ajv({ allErrors: true }); // To throw all the request validation errors at single shot
      const validate = ajv.compile(schema);
      const valid = validate(req.body);
      if (!valid) {
        res.status(400).json("Request validation failed " + JSON.stringify(validate.errors));
        return null;
      }
    }
    
    let event = {
      queryStringParameters: req.query,
      pathParameters: req.params,
      body: JSON.stringify(req.body),
      headers: req.headers,
      files: req?.files,
      requestContext: { stage: "" },
     
    };

    
    //xml validation script
    if (/<[a-zA-Z!\/][\s\S]*>/i.test(event.body)) {
      return res.status(400).set(headers).json({
        code: 2004,
        message: "Bad Request Error",
      });
    }
    // Execute the main function
    response = await executor(event);

    if (!response) {
      return null;
    }


    headers = Object.assign(headers, response.headers);
    if (mongoose && mongoose.connection) {
      // mongoose.connection.close()
    } else {
      console.log("WARNING : Invalid Mongoose Object");
    }
    res.status(response.status).set(headers).json(response.body);
  } catch (error) {
    let message;
    let code;
    switch (error.message) {
      case "1000":
        message = "Unauthorized Request.";
        code = 1000;
        break;
      case "1001":
        message = "You have been forcefully logged out.";
        code = 1001;
        break;
      case "1002":
        message = "You have been logged out.";
        code = 1002;
        break;
      case "2001":
        message = "Access denied. You are not authorized to perform this action.";
        code = 1002;
        break;
      default:
        message = error.message;
        code = 2004;
        break;
    }
    if (error.message === "jwt expired" || error.message === "jwt malformed") {
      message = "Unauthorized Access";
    }
    res.status(401).set(headers).json({
      code,
      message,
    });
  }
};
