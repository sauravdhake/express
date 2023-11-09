module.exports = (mongoose) => {
    const Mongoose = mongoose;
    Schema = Mongoose.Schema;
   
    
    const OrderSlotsSchema = new Schema({
      product_id :{
        type: Schema.Types.ObjectId,
        ref: "ProductSlot",
        required: true,
        index: true,
      },
      serial_no: { 
        type: String,
      },
    
      user_id: { type: String },
      qty: { type: Number,required: true },

     
    },
    {
      timestamps: true,
      toObject: { virtuals: true, getters: true },
      toJSON: { virtuals: true, getters: true },
    });
  
    return Mongoose.model("OrderSlot", OrderSlotsSchema, "order-slots");
  };
  