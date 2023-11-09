var { ObjectId } = require("mongoose").mongo

//"creator" Function links facility with pracitioner and given role
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

