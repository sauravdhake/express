const fs = require('fs');
const path = require("path");
const dbType = require("process").env.DB_TYPE;
class DataStore {
  constructor(mongoose) {
    this.mongoose = mongoose
    this.connectionRetryCount = 0
  }

  connect(dbUri) {
    if(dbType === 'document'){
      this.mongoose
        .connect(dbUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
          useCreateIndex: true,
          sslCA: [fs.readFileSync(path.resolve(__dirname, "./rds-combined-ca-bundle.pem"))],
        })
        .then((mongoose) => {
          console.log(`Mongo connected to: ${dbUri}`);
        })
        .catch((err) => {
          if (this.connectionRetryCount < 3) {
            console.log("Retrying connection :", this.connectionRetryCount);
            this.connectionRetryCount++;
            this.connect(dbUri);
          }
          console.error(
            `Mongo connection failed count: ${this.connectionRetryCount} :--`,
            err,
            dbUri
          );
        });
      return this
    } else {
      this.mongoose
        .connect(dbUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
          useCreateIndex: true
        })
        .then((mongoose) => {
          console.log(`Mongo connected to: ${dbUri}`);
        })
        .catch((err) => {
          if (this.connectionRetryCount < 3) {
            console.log("Retrying connection :", this.connectionRetryCount);
            this.connectionRetryCount++;
            this.connect(dbUri);
          }
          console.error(
            `Mongo connection failed count: ${this.connectionRetryCount} :--`,
            err,
            dbUri
          );
        });
      return this
    }
  }

  disconnect(){
    this.mongoose.disconnect()
      .then(() => {
        console.log(`Mongo disconnected`);
      })
      .catch(err => {
        console.error('Mongo disconnection failed:', err);
      });
    return this
  }

  debug(opt) {
    this.mongoose.set("debug", opt)
    return this
  }

}

module.exports = DataStore