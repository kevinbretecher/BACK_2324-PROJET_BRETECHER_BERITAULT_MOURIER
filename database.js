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
        const result = await eventsCollection.insertOne(newEvent);
        await addFavorite(newEvent.owner,result.insertedId);
        return result;
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
        const { _id, ...updatedFields } = editedEvent;
        return await eventsCollection.updateOne({ _id: new ObjectId(_id) },{ $set: updatedFields });
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
        const event = await eventsCollection.findOne({_id: new ObjectId(eventId)}, {projection: {owner: 1, _id: 0 }});
        return event.owner;
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await client.close();
    }
}

async function getAllUsers(){
    const client = await clientConnect()
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    try {
        return await usersCollection.find({},{projection: {_id: 1, username: 1, avatar: 1}}).toArray();
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

async function getMessagesByUsers(user1,user2){
    const client = await clientConnect()
    const db = client.db(dbName);
    const messagesCollection = db.collection('messages');
    try {
        return await messagesCollection.find({
            $or: [
                {sender: user1, receiver: user2},
                {sender: user2, receiver: user1}
            ]
        }).sort({ date: 1 }).toArray();
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

async function addMessage(sender,receiver,content,date){
    const client = await clientConnect()
    const db = client.db(dbName);
    const messagesCollection = db.collection('messages');
    try {
        const newMessage = {
            sender,
            receiver,
            content,
            date,
        };

        const result = await messagesCollection.insertOne(newMessage);
        const insertedId = result.insertedId;

        return { _id: insertedId, ...newMessage };
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

async function addFavorite(userId,eventId){
    const client = await clientConnect();
    const db = client.db(dbName);
    const favoritesCollection = db.collection('favorites');
    try {
        return await favoritesCollection.insertOne({userId,eventId});
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await client.close();
    }
}

async function deleteFavorite(userId,eventId){
    const client = await clientConnect();
    const db = client.db(dbName);
    const favoritesCollection = db.collection('favorites');
    try {
        return await favoritesCollection.deleteOne({userId,eventId});
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await client.close();
    }
}

async function getUserFavoriteEvents(userId) {
    const client = await clientConnect();
    const db = client.db(dbName);
    const favoritesCollection = db.collection('favorites');
    const eventsCollection = db.collection('events');

    try {
        const favoriteEvents = await favoritesCollection
            .find({ userId })
            .toArray();

        const eventIds = favoriteEvents.map(event => new ObjectId(event.eventId));

        return await eventsCollection
            .find({ _id: { $in: eventIds } })
            .toArray();
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await client.close();
    }
}

async function getEventFavoritedUsers(eventId) {
    const client = await clientConnect();
    const db = client.db(dbName);
    const favoritesCollection = db.collection('favorites');
    const usersCollection = db.collection('users');

    try {
        const favoritedUserIds = await favoritesCollection
            .find({ eventId })
            .toArray();

        const userIds = favoritedUserIds.map(user => new ObjectId(user.userId));

        return await usersCollection
            .find({ _id: { $in: userIds } })
            .project({ _id: 1, username: 1 })
            .toArray();
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await client.close();
    }
}

module.exports = {getUserById,getUserByEmail,getUserByUsername,getUserInfoById,addUser,editAvatar,getAllEvents,getEventById,addEvent,editEventById,deleteEventById,getEventOwnerById,getAllUsers,getMessagesByUsers,addMessage,addFavorite,deleteFavorite,getUserFavoriteEvents,getEventFavoritedUsers};