module.exports = (mongoose) => {
  const Mongoose = mongoose;
  Schema = Mongoose.Schema;

  
  const ProductSlotsSchema = new Schema({
    
    serial_no: { type: String ,unique: true},
    product_name: { type: String},
    description: { type: String },
    price: { type: String },
    qty: { type: Number },
    isactive: { type: Boolean, default: true },
    
  },
  {
    timestamps: true,
    toObject: { virtuals: true, getters: true },
    toJSON: { virtuals: true, getters: true },
  });

  return Mongoose.model("ProductSlot", ProductSlotsSchema, "product-slots");
};
