const {MongoClient} = require('mongodb');
const MONGODB_URI = 'mongodb+srv://minjikmk:aQE22PlNqUS1SH7u@cluster.8fngeta.mongodb.net/test?retryWrites=true&writeConcern=majority';
const MONGODB_DB_NAME = 'clearfashion';

const listproducts = require("./list.json")

async function connect(){
    const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    const db =  client.db(MONGODB_DB_NAME);
    const list = db.collection('products');
    const f = await list.insertMany(listproducts);
    console.log(f);
    client.close();
}

async function filterByBrand(brand){
    const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    const db =  client.db(MONGODB_DB_NAME);
    const list = db.collection('products');
    const f = await list.find({brand}).toArray();
    console.log(f);
    client.close();
}

async function filterByPrice(lowerprice){
    const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    const db =  client.db(MONGODB_DB_NAME);
    const list = db.collection('products');
    const lowerthanprice = {price:{$lt: lowerprice}};
    const f = await list.find(lowerthanprice).toArray();
    console.log(f);
    client.close();
}

async function sortByPrice(){
    const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    const db =  client.db(MONGODB_DB_NAME);
    const list = db.collection('products');
    const f = await list.find({}).sort({price:1}).toArray();
    console.log(f);
    client.close();
}

//connect();
filterByBrand('Dedicatedbrand');
filterByPrice(50);
sortByPrice();