'use strict';
var express = require('express');

const fs = require("fs");


// Initialize mongoose and connect to the models
const mongoose = require("mongoose")
var { ObjectId } = mongoose.mongo;
const DataStore = require("./package/data-store")
const dataStore = new DataStore(mongoose)
//const constantManager = require('@securra/constant-manager')
dataStore
.connect(process.env.DB_URI)
.debug(false)



//Pagination package
const {PaginationManager}  = require("./package/api-pagination/index");  
const ModelManager = require("./package/model-manager/index");
const handlerExport = require("./package/handler-export/index")

ModelManager
  .bind(mongoose)
  .register('Order')
  .register('Product')

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const OrderController = require("./controllers/order")

app.post("/api/v1/order", handlerExport(
  OrderController.createOrder({
    OrderModel: ModelManager.get('Order'),
    PaginationManager
  }), mongoose,JSON.parse(fs.readFileSync('./schema-validators/create-order.json')))
);

const ProductController = require("./controllers/product")

app.post("/api/v1/product", handlerExport(
  ProductController.createProduct({
    ProductModel: ModelManager.get('Product'),
    PaginationManager
  }), mongoose,JSON.parse(fs.readFileSync('./schema-validators/create-order.json')))
);



  app.use((err, req, res, next) => {
    console.log({
      type: err.type,
      message: err.message,
    });
    res.status(400).json({
      type: err.type,
      message: err.message,
    });
  });
  
app.use(function(req,res){
   res.status(404).json ({ status: 404, message: "Route not found" });
})

module.exports = app;