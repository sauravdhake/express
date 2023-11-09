import { describe } from "node:test";
import app, { response } from "./facilityService";
import request from "supertest";

describe("testing app with order" ,()=>{
    it('create a order with status code 201', () => {
       const response = await request(app).post('/api/v1/order')
          .send({
            serial_no:"test",
            qty:4
            })
          expect(201)
          .then((res) => {
           const {serial_no,qty,id} = res.body;
           expect(id).toBeDefined()
           expect(serial_no).toEqual("test")
           expect(qty).toEqual(4)
          })
      });


      it('create a product with status code 201', () => {
        return request(app.getHttpServer())
          .post('/api/v1/product')
          .send({
            product_name:"hello",
            description:"tapp",
            serial_no:"hello",
            price:"34",
            qty:4,
            isactive:false
        })
          .expect(201)
          .then((res) => {
           const {serial_no,isactive,id} = res.body;
           expect(id).toBeDefined()
           expect(serial_no).toEqual("hello")
           expect(isactive).toEqual(true)
          })
      });
    
      it('GET /api/v1/product/serial_no/:serial_no    get product with status code 200', () => {
        return request(app.getHttpServer())
          .get('/product/serial_no/hello')
          .expect(200)
          .then((res) => {
           const {serial_no} = res.body;
           expect(serial_no).toEqual("hello")
          })
      });
    
      it('PATCH /api/v1/product/serial_no/:serial_no    update the product with status code 201', () => {
        return request(app.getHttpServer())
          .post('/api/v1/product/serial_no/:serial_no')
          .send({
            price:"70",
            qty:7
        })
          .expect(200)
          .then((res) => {
           const {serial_no,price,id} = res.body;
           expect(id).toBeDefined()
           expect(serial_no).toEqual("hello")
           expect(price).toEqual("70")
          })
      });
    
      it('GET /api/v1/products    get all products with status code 200', () => {
        return request(app.getHttpServer())
          .get('/product/serial_no/hello')
          .expect(200)
          
      });
    
      it('DELETE /v1/product/serial_no/:serial_no    delete product with status code 200', () => {
        return request(app.getHttpServer())
          .get('/product/serial_no/hello')
          .expect(200)
          .then((res) => {
            const {message} = res.body;
            expect(message).toEqual("product deleted successfully")
           })
      });
    
    })