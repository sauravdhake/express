module.exports = (mongoose) => {
    const Mongoose = mongoose;
    Schema = Mongoose.Schema;
   
    
    const OrderSlotsSchema = new Schema({
      
      serial_no: { 
        type: String,
        ref: "ProductSlot",
        required: true,
        index: true},
    
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
  