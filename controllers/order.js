var { ObjectId } = require("mongoose").mongo
let moment = require("moment");
var ObjectId = require("mongodb").ObjectId;
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const fileUpload = process.env.FILE_UPLOAD_URL;

module.exports.createOrder = ({ OrderModel}) => async (event) => {
  try {
    console.log({service: "order-service", logMessage: "createOrder API initialised", stage: event.requestContext.stage});
    // Extract the details from the event query params 
    
    const payload = JSON.parse(event.body)
    
    order = new OrderModel({
      serial_no: payload.serial_no,
      user_id: uuidv4(),
      qty:payload.qty,
      
  })
  order = await order.save()
    
   // console.log({service: "order-service", requestBody: payload, stage: event.requestContext.stage, logMessage: {message: 'Facility Updated Successfully!', api: 'updateFacility'}});

    return {
      status: 200,
      body: order
    }
  } catch (err) {
    console.log({service: "facility-service", facilityId: event.pathParameters.facilityId, requestBody: JSON.parse(event.body), logMessage: {message:err.message, api: 'updateFacility'}, status: "400", stage: event.requestContext.stage});
    return {
      status: 400,
      body: { message: err.message }
    }
  }
}
