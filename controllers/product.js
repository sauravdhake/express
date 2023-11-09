var { ObjectId } = require("mongoose").mongo
const standardDateFormat = 'YYYY/MM/DD' 
const standardZone_IST='+0530'
const moment = require("moment");
module.exports.createProduct = ({ ProductModel }) => async (event, context) => {
  try {
    console.log({service: "facility-service", logMessage: "createProduct API initialised", stage: event.requestContext.stage});
    const payload = JSON.parse(event.body)
    
    const allProducts = await ProductModel.find()

    allProducts.map((item)=>{
      if(item.serial_no === payload.serial_no){
          throw new Error(`serial_no  ${payload.serial_no} already exist`)
      }
    });
    product = new ProductModel({
      serial_no: payload.serial_no,
      product_name: payload.product_name,
      description: payload.description,
      price: payload.price,
      qty: payload.qty,
      isactive:true
      
  })
  product = await product.save()

    console.log({service: "facility-service", logMessage: {body: {message: " createProduct"}, api: 'createProduct'}, status: "201", stage: event.requestContext.stage});
    return {
      status: 201,
      body:product
    }
  } catch (err) {
    console.log({service: "facility-service", facilityId: event.pathParameters.facilityId, practitionerId: event.pathParameters.practitionerId, logMessage: {message:err.message, api: 'addpractitioner'}, status: "400", stage: event.requestContext.stage});
    return {
      status: 400,
      body: { message: err.message }
    }
  }
}

module.exports.updateProduct = ({ ProductModel }) => async (event, context) => {
  try {
    console.log({service: "facility-service", logMessage: "updateProduct API initialised", stage: event.requestContext.stage});
    const payload = JSON.parse(event.body)
    const serial_noPath = event.pathParameters.serial_no
    const allProducts = await ProductModel.find()
     
    let productIds = []
    allProducts.map((item)=>{
      if(item.serial_no === serial_noPath){
          return productIds.push(item._id)
      }
    });

    await ProductModel.updateMany(
      {"_id":{$in:productIds}},
      { $set: {qty:payload.qty , price:payload.price} }
    )

    console.log({service: "facility-service", logMessage: {body: {message: " updateProduct"}, api: 'updateProduct'}, status: "201", stage: event.requestContext.stage});
    return {
      status: 201,
      body:{message: "product update successfully"}
    }
  } catch (err) {
    console.log({service: "facility-service", status: "400", stage: event.requestContext.stage});
    return {
      status: 400,
      body: { message: err.message }
    }
  }
}

module.exports.getAllProducts = ({ ProductModel,PaginationManager }) => async (event, context) => {
  try {
    console.log({service: "facility-service", logMessage: "getAllProducts API initialised", stage: event.requestContext.stage});
    const queryStringParameters = event.queryStringParameters || {};
      const pageSize = parseInt(queryStringParameters.pageSize || 10);
      const pageNumber = parseInt(queryStringParameters.pageNumber || 1)
      const serial_no = queryStringParameters.serial_no;
      const sortBy = queryStringParameters.sortBy || `date`;
      const orderBy = queryStringParameters.orderBy || "asc";
      const sort = { [sortBy]: orderBy == "asc" ? 1 : -1 }; 
      const FromDate = queryStringParameters.fromDate || "";
      const ToDate = queryStringParameters.toDate || "";
      const search = queryStringParameters.search;
      let skip = (pageNumber - 1) * pageSize

      let filter = {serial_no:serial_no}; 
      // Checks for search text is present in query params , if yes add to the filter object
      if (search) {
        let searchvalue = new RegExp(search, "i");
        filter["product_name"] = searchvalue 
      }

      // Setting up Aggregation Pipeline
      const orderAgg = [
        
        {
          $match:filter
        },
        {
         $sort : sort 
        },
        
      ];

    return Promise.all([ProductModel.aggregate([...orderAgg, { $skip: skip }, { $limit: pageSize }]),
    ProductModel.aggregate([...orderAgg, { $count: "total" }])]).then(async (values) => {
      let data = await PaginationManager.getPaginateResponse({ totalCount: values[1]?.length ? values[1][0].total : 0, pageSize, pageNumber, payload: values[0] })

      console.log({
        service: "facility-service",
        logMessage: data,
        status: "201",
        stage: event.requestContext.stage,
      });
      return {
        status: 201,
        body: {
          data
        }
      };
    })
    
  } catch (err) {
    console.log({service: "facility-service", status: "400", stage: event.requestContext.stage});
    return {
      status: 400,
      body: { message: err.message }
    }
  }
}
