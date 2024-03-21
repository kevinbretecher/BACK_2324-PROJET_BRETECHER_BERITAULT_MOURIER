//login, signup, profile
require('dotenv').config()
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require("../database.js")
const fs = require('fs');
const path = require('path');
const authenticateToken = require("../middlewares/authenticateToken")
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
        res.cookie('authToken',token,{httpOnly:true,secure:true});
        res.json({username: user.username, token});
    }
});

router.post('/signup', async (req, res) => {
    const { email, password, name, firstname, birthdate, username } = req.body;
    try {
        const [existingUserByEmail, existingUserByUsername] = await Promise.all([
            database.getUserByEmail(email),
            database.getUserByUsername(username)
        ]);

        if (existingUserByEmail || existingUserByUsername) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            email,
            password: hashedPassword,
            name,
            firstname,
            birthdate: new Date(birthdate),
            avatar: "/images/users/default.svg",
            username,
            admin: false
        };

        const createdUser = await database.addUser(newUser);

        const token = jwt.sign({ userId: createdUser.insertedId }, secret, { expiresIn: '1h' });

        res.status(201).cookie('authToken',token,{httpOnly:true,secure:true});
        res.json({username: newUser.username , token});
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/profile',authenticateToken,async (req,res) => {
    const userId = req.decoded.userId;
    res.json(await database.getUserInfoById(userId));
});

router.post('/profile', authenticateToken,async (req, res) => {
    try {
        const { avatar } = req.body;
        const avatarFileName = `${req.decoded.userId}.${getImageFormat(avatar)}`;
        const avatarPath = path.join(__dirname, '../public/images/users', avatarFileName);
        const base64Data = avatar.replace(/^data:image\/(png|jpeg);base64,/, '');
        fs.writeFileSync(avatarPath, base64Data, 'base64');
        res.json(await database.editAvatar(req.decoded.userId, "/images/users"+avatarFileName));
    }
    catch (err) {
        console.error('Error updating avatar:', err);
        res.status(500).json({ error: 'Internal server error or invalid image format' });
    }
});

function getImageFormat(dataURI) {
    const formatMatch = dataURI.match(/^data:image\/(png|jpeg);base64,/);
    if (formatMatch && formatMatch[1]) {
        return formatMatch[1];
    } else {
        throw new Error('Invalid image format');
    }
}


module.exports = router;