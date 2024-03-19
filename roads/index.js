//login, signup, profile
require('dotenv').config()
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require("../database.js")
const fs = require('fs');
const path = require('path');
const router = express.Router();

const secret = process.env.SECRET


router.post('/login',async (req,res) => {
    const {email, password} = req.body;
    const user = await database.getUserByEmail(email);
    if (!user){
        res.status(401).json({ error: 'Invalid email or password' });
    }
    else{
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign({userId: user._id},secret,{expiresIn:'1h'});
        res.json({token});
    }
});

router.post('/signup', async (req, res) => {
    console.log(req.body);
    const { email, password, name, lastname, birthdate, status, avatar, username } = req.body;

    try {
        const [existingUserByEmail, existingUserByUsername] = await Promise.all([
            database.getUserByEmail(email),
            database.getUserByUsername(username)
        ]);

        if (existingUserByEmail || existingUserByUsername) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const avatarFileName = `${username}_${Date.now()}.png`;
        //const avatarPath = path.join(__dirname, '../public/images', avatarFileName);
        //const base64Data = avatar.replace(/^data:image\/png;base64,/, '');
        //fs.writeFileSync(avatarPath, base64Data, 'base64');

        const newUser = {
            email,
            password: hashedPassword,
            name,
            lastname,
            birthdate,
            status: "online",
            avatar: `/images/${avatarFileName}`,
            username,
            admin: false
        };

        // Add the new user to the database
        const createdUser = await database.addUser(newUser);

        // Generate JWT token
        const token = jwt.sign({ userId: createdUser._id }, secret, { expiresIn: '1h' });

        // Send the token in the response
        res.status(201).json({ token });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/profile',async (req,res) => {

});

module.exports = router;