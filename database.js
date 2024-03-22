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
    //returns whole user based on id
    const client = await clientConnect()
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    try {
        return await usersCollection.findOne({ _id: new ObjectId(userId) });
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

async function getUserByEmail(userEmail){
    //returns whole user based on email
    const client = await clientConnect()
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    try {
        return await usersCollection.findOne({ email: userEmail });
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

async function getUserByUsername(username){
    //returns whole user by username
    const client = await clientConnect()
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    try {
        return await usersCollection.findOne({ username: username });
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

async function getUserInfoById(userId){
    //returns user by id without the password hash
    const client = await clientConnect()
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    try {
        return await usersCollection.findOne({ _id: new ObjectId(userId) },{ projection: { password: 0 } });
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

async function addUser(newUser) {
    //add new user
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
    //edit the avatar path for the user by id and returns the updated profile without the hashed password
    const client = await clientConnect()
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    try {
        await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { avatar: avatarPath } });
        return await usersCollection.findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } });
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}



async function getAllEvents(){
    //returns all events
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

async function getAllEventsFilterSort(filterOptions = {}, sortOptions = {}) {
    //returns all events with filter and sorting options
    const client = await clientConnect();
    const db = client.db(dbName);
    const eventsCollection = db.collection('events');

    try {
        const filterCriteria = {};

        if (filterOptions.name) {
            filterCriteria.name = { $regex: filterOptions.name, $options: 'i' }; //case insensitive
        }
        if (filterOptions.minPrice) {
            filterCriteria.price = { $gte: filterOptions.minPrice };
        }
        if (filterOptions.maxPrice) {
            filterCriteria.price = { ...filterCriteria.price, $lte: filterOptions.maxPrice };
        }
        if (filterOptions.theme) {
            filterCriteria.theme = filterOptions.theme;
        }

        return await eventsCollection.find(filterCriteria)
            .sort(sortOptions)
            .toArray();

    }
    catch (err) {
        console.error(err);
    }
    finally {
        await client.close();
    }
}


async function getEventById(eventId){
    //returns a specific event by its id
    const client = await clientConnect()
    const db = client.db(dbName);
    const eventsCollection = db.collection('events');
    try {
        return await eventsCollection.findOne({ _id: new ObjectId(eventId) });
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

async function addEvent(newEvent){
    //creates new event and add the owner in the favorites
    const client = await clientConnect();
    const db = client.db(dbName);
    const eventsCollection = db.collection('events');
    try {
        const result = await eventsCollection.insertOne(newEvent);
        await addFavorite(newEvent.owner,result.insertedId.toString());
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
    //edits a specific event by its id
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
    //deletes a specific event by its id
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
    //returns a specific event owner id by the id of the event
    const client = await clientConnect();
    const db = client.db(dbName);
    const eventsCollection = db.collection('events');
    try {
        const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) }, {projection: {owner: 1, _id: 0 }});
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
    //returns all the user id avatar and username
    const client = await clientConnect()
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    try {
        return await usersCollection.find({},{ projection: { _id: 1, username: 1, avatar: 1 } }).toArray();
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

async function getMessagesByUsers(user1,user2){
    //returns all the messages between the 2 specified users
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
    //adds new message
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
    //adds a user to favorites of an event
    const client = await clientConnect();
    const db = client.db(dbName);
    const favoritesCollection = db.collection('favorites');
    try {
        return await favoritesCollection.insertOne({ userId,eventId });
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await client.close();
    }
}

async function deleteFavorite(userId,eventId){
    //deletes a user to favorites of an event
    const client = await clientConnect();
    const db = client.db(dbName);
    const favoritesCollection = db.collection('favorites');
    try {
        return await favoritesCollection.deleteOne({ userId,eventId });
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await client.close();
    }
}

async function getUserFavoriteEvents(userId) {
    //returns all the events favorited by a specific users
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
    //returns all the users username and id who favorited a specific event
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

module.exports = {getUserById,getUserByEmail,getUserByUsername,getUserInfoById,addUser,editAvatar,getAllEvents,getAllEventsFilterSort,getEventById,addEvent,editEventById,deleteEventById,getEventOwnerById,getAllUsers,getMessagesByUsers,addMessage,addFavorite,deleteFavorite,getUserFavoriteEvents,getEventFavoritedUsers};