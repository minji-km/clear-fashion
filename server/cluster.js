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

connect();