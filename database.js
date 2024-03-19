require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb');
const url = process.env.URL;
const dbName = process.env.DBNAME;

async function clientConnect(){
    const client = new MongoClient(url);
    await client.connect();
    console.log(`Connected successfully to MongoDB server: ${url}`);
    return client;
}
async function getUserById(userId){
    const client = await clientConnect()
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    try {
        return await usersCollection.findOne({_id: new ObjectID(userId)});
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

async function getUserByEmail(userEmail){
    const client = await clientConnect()
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    try {
        return await usersCollection.findOne({email: userEmail});
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

async function getUserByUsername(username){
    const client = await clientConnect()
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    try {
        return await usersCollection.findOne({username: username});
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

async function addUser(newUser) {
    const client = await clientConnect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    try {
        await usersCollection.insertOne(newUser);
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await client.close();
    }
}

module.exports = {getUserById,getUserByEmail,getUserByUsername,addUser};