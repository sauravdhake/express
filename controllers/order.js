var { ObjectId } = require("mongoose").mongo
let moment = require("moment");
var ObjectId = require("mongodb").ObjectId;
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const fileUpload = process.env.FILE_UPLOAD_URL;

module.exports.createOrder = ({ OrderModel, ProductModel}) => async (event) => {
  try {
    console.log({service: "order-service", logMessage: "createOrder API initialised", stage: event.requestContext.stage});
   
    
    const payload = JSON.parse(event.body)
    
    order = new OrderModel({
      serial_no: payload.serial_no,
      user_id: uuidv4(),
      qty:payload.qty,
      
  })

  order = await order.save()

  const filter = { serial_no:payload.serial_no }

  //qty change logic
    let aggQuery = [
      {
        $match: filter
      },
      {
        $lookup: {
          from: "product-slots",
          localField: "serial_no",
          foreignField: "serial_no",
          as: "associateproducts"
        }
      },
      {
        $unwind : {
            path : "$associateproducts",
            preserveNullAndEmptyArrays: true
        }
      }

    ]
    
    const orderWithProducts = await OrderModel.aggregate([...aggQuery, { $count: "total" }])


    // let array = [];
    // let productIds = orderWithProducts.associateproducts.map((item) => {
    //       let remainingQty = item.qty - orderWithProducts.qty
    //   return array.push({id:item._id, quantity:remainingQty})
    // })

    product = await ProductModel.findOne({ _id: orderWithProducts.associateproducts._id});

    product.qty = product.qty - orderWithProducts.qty;
    
    product.save();


    // await ProductModel.updateMany(
    //   { "_id": {$in:productIds}},
    //   { $set: { qty : qty - } },
    //   { multi: true }
    // )
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


