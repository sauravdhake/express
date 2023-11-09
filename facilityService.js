'use strict';
var express = require('express');

const fs = require("fs");

//const medall = require("./medall/index.js")
// const S3Manager = require('@securra/s3-manager')
// const { nanoid } = require("nanoid")
// const { EventManager, events: Events } = require("@securra/async-event");

// const route = `/${process.env.SERVICE_ROUTING_PATH ?? "facility-service"}`;
// const InternalPath = `${process.env.INTERNAL_PATH_KEYWORD ?? "internal"}`;
// Initialize mongoose and connect to the models
const mongoose = require("mongoose")
var { ObjectId } = mongoose.mongo;
const DataStore = require("./package/data-store")
const dataStore = new DataStore(mongoose)
//const constantManager = require('@securra/constant-manager')
dataStore
.connect(process.env.DB_URI)
.debug(false)


// Load and Initialize the ModelManager
// Init Authorizers for this service
// const { jwtAuthorizers: { facilityAdminAuthorizer, facilityAdminOrUserAuthorizer } } = require("@securra/authorization")
// module.exports.facilityAdminAuthorizer = facilityAdminAuthorizer
// module.exports.facilityAdminOrUserAuthorizer = facilityAdminOrUserAuthorizer


//Init nm
//const notificationManager = require('./utilities/notification-manager')

// Register and export the lambdas from controllers
// const handlerExport = require("@securra/handler-export")

// const {practitioner : activePractitioner,availablepractitioner: availabilityManager} = require('@securra/common-manager')
// Init RazorPayX Service
// const { RazorpayXService } = require("@securra/razorpay")
// const razorpayXService = RazorpayXService(require('process').env.STAGE)

// const {
//   file: FileConstants,
//   userCareProgrammePlan: UserCareProgrammePlanConstants,
//   roles: RolesConstants
// } = constantManager;

// const { profileStatus: EmpanelmentConstants ,consultation: consultationConstants, invite :inviteConstants,
//   profileStatus: profileStatusConstants ,facility:facilityConstants} = constantManager

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

app.patch("/api/v1/order", handlerExport(
  OrderController.createOrder({
    OrderModel: ModelManager.get('Order'),
    PaginationManager
  }), mongoose,JSON.parse(fs.readFileSync('./schema-validators/create-facility.json')))
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