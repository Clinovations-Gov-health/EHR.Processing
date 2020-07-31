const { MongoClient } = require('mongodb');

const mongoclient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const dbname = "Clinovations";
const url = "mongodb://mwebware:welcome1!@18.222.33.97:27017/mwebware?authSource=admin";
const mongoOptions = { useNewUrlParser: true , useUnifiedTopology: true };

const state = {
    db: null
}

const connect = (cb) => {
    if (state.db)
        cb()
    else {
        MongoClient.connect(url, mongoOptions, (err, client) => {
            if (err)
                cb(err);
            else {
                state.db = client.db(dbname);
                cb();
            }
        })
    }
}

const getPrimaryKey = (_id) => {
    return ObjectID(_id);
}

const getDB = () => {
    return state.db;
}

module.exports = {getDB,connect,getPrimaryKey};
