var { ObjectId } = require("mongoose").mongo
let moment = require("moment");
var ObjectId = require("mongodb").ObjectId;
const { v4: uuidv4 } = require('uuid');

module.exports.createOrder = ({ OrderModel, ProductModel}) => async (event) => {
  try {
    console.log({service: "order-service", logMessage: "createOrder API initialised", stage: event.requestContext.stage});

    const payload = JSON.parse(event.body)

    const allOrders = await OrderModel.find({serial_no:payload.serial_no})
     
  //   let flag = true;
  //  await allOrders.map((item)=>{
  //     if(item.serial_no === payload.serial_no){
  //         flag = true  
  //     }
  //   });

    let order;
    //if order entry not available then only create record
    if(allOrders.length === 0){
       order = new OrderModel({
        product_id:payload.product_id, 
        serial_no: payload.serial_no,
        user_id: uuidv4(),
        qty:payload.qty,
        
      })

      order = await order.save()
  }

  const filter = { serial_no:payload.serial_no }

  //below steps for decreasing qty of products according to order qty
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
    
    const orderWithProducts = await OrderModel.aggregate([...aggQuery])


    // let array = [];
    // let productIds = orderWithProducts.associateproducts.map((item) => {
    //       let remainingQty = item.qty - orderWithProducts.qty
    //   return array.push({id:item._id, quantity:remainingQty})
    // })
    let id = orderWithProducts[0].associateproducts._id
    let product = await ProductModel.findOne({ _id: ObjectId(id)});
    //subtraction
    let remainingQty = product.qty - orderWithProducts[0].qty;
    
   
    //updating remaining qty in product collection
    await ProductModel.updateOne(
      { "_id": ObjectId(id)},
      { $set: { qty : remainingQty} }
    )
   

    return {
      status: 200,
      body: {message:"order booked successffully"}
    }
  } catch (err) {
    console.log({service: "facility-service", requestBody: JSON.parse(event.body), logMessage: {message:err.message, api: 'createOrder'}, status: "400", stage: event.requestContext.stage});
    return {
      status: 400,
      body: { message: err.message }
    }
  }
}

module.exports.cancelledOrder = ({ OrderModel, ProductModel}) => async (event) => {
  try {
    console.log({service: "order-service", logMessage: "cancelledOrder API initialised", stage: event.requestContext.stage});

    const payload = JSON.parse(event.body)

    const order = await OrderModel.find({_id:payload.order_id})
  
    
    //for product Qty
    const product = await ProductModel.find({_id:order.product_id})
    // 
    let productQty = product.qty;
    let orderQty = order.qty
    //let originalQuantity = productQty + orderQty
    let originalQuantity = productQty + orderQty
   // for update qty
   const cancelOrder = await ProductModel.updateMany({product_id:order.product_id},{ $set: { qty :originalQuantity }})
    //product = 5 , order cancelled => remove order record from collection
   const cancelledOrder = await OrderModel.delete({_id:order._id})
    return {
      status: 200,
      body: {message:"order cancelled successffully"}
    }
  } catch (err) {
    console.log({service: "facility-service", requestBody: JSON.parse(event.body), logMessage: {message:err.message, api: 'cancelledOrder'}, status: "400", stage: event.requestContext.stage});
    return {
      status: 400,
      body: { message: err.message }
    }
  }
}



