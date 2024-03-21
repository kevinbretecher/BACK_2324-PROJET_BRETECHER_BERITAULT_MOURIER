require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb');
const url = process.env.URL;
const dbName = process.env.DBNAME;

async function clientConnect(){
    const client = new MongoClient(url);
    await client.connect();
    return client;
}
async function getUserById(userId){
    const client = await clientConnect()
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    try {
        return await usersCollection.findOne({_id: new ObjectId(userId)});
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

async function getUserInfoById(userId){
    const client = await clientConnect()
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    try {
        return await usersCollection.findOne({_id: new ObjectId(userId)},{projection: {password: 0}});
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
        return await usersCollection.insertOne(newUser);
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await client.close();
    }
}

async function editAvatar(userId,avatarPath){
    const client = await clientConnect()
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    try {
        await usersCollection.updateOne({_id: new ObjectId(userId)}, {$set: {avatar: avatarPath}});
        return await usersCollection.findOne({_id: new ObjectId(userId)}, {projection: {password: 0}});
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}



async function getAllEvents(){
    const client = await clientConnect()
    const db = client.db(dbName);
    const eventsCollection = db.collection('events');
    try {
        return await eventsCollection.find().toArray();
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

async function getEventById(eventId){
    const client = await clientConnect()
    const db = client.db(dbName);
    const eventsCollection = db.collection('events');
    try {
        return await eventsCollection.findOne({_id: new ObjectId(eventId)});
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

async function addEvent(newEvent){
    const client = await clientConnect();
    const db = client.db(dbName);
    const eventsCollection = db.collection('events');
    try {
        return await eventsCollection.insertOne(newEvent);
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await client.close();
    }
}

async function editEventById(editedEvent){
    const client = await clientConnect();
    const db = client.db(dbName);
    const eventsCollection = db.collection('events');
    try {
        return await eventsCollection.updateOne({_id: new ObjectId(editedEvent._id)},{$set: editedEvent});
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await client.close();
    }
}

async function deleteEventById(eventId){
    const client = await clientConnect();
    const db = client.db(dbName);
    const eventsCollection = db.collection('events');
    try {
        return await eventsCollection.deleteOne({ _id: new ObjectId(eventId) });
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await client.close();
    }
}

async function getEventOwnerById(eventId) {
    const client = await clientConnect();
    const db = client.db(dbName);
    const eventsCollection = db.collection('events');
    try {
        const event = await eventsCollection.findOne({_id: new ObjectId(eventId)}, {projection: {ownerId: 1, _id: 0 }});
        return event.ownerId;
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await client.close();
    }
}

module.exports = {getUserById,getUserByEmail,getUserByUsername,getUserInfoById,addUser,editAvatar,getAllEvents,getEventById,addEvent,editEventById,deleteEventById,getEventOwnerById};