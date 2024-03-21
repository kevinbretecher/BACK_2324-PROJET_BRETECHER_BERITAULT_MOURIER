//events/id , events/new , events/ , events/id/edit, events/id/delete

const express = require('express');
const database = require("../database.js")
const fs = require('fs');
const path = require('path');
const authenticateToken = require("../middlewares/authenticateToken")

const router = express.Router();

router.get('/',authenticateToken,async (req,res) => {
    res.json(await database.getAllEvents());
});

router.post('/',authenticateToken,async (req,res) => {
    res.json(await database.getAllEvents());
    //add filter
});

router.post('/new', authenticateToken, async (req, res) => {
    try {
        const { name, image, price, date, theme, location, owner } = req.body;

        const newEvent = {
            name,
            image,
            price,
            date: date,
            theme,
            location,
            owner: req.decoded.userId
        };

        const result = await database.addEvent(newEvent);

        res.status(201).json({ message: 'Event added successfully', eventId: result.insertedId });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id',authenticateToken,async (req,res) => {
    res.json(await database.getEventById(req.params.id));
});
router.post('/:id/edit',authenticateToken,async (req,res) => {
    try {
        const userId = req.decoded.userId;
        const eventOwnerId = await database.getEventOwnerById(req.params.id);
        if (userId === eventOwnerId) {
            const { name, image, price, date, theme, location } = req.body;

            const updatedEvent = {
                _id: req.params.id,
                name,
                image,
                price,
                date: date,
                theme,
                location,
                owner: eventOwnerId
            };

            await database.editEventById(updatedEvent);
            res.status(200).json({ message: 'Event updated successfully' });
        }
        else {
            res.status(403).json({ error: 'You are not authorized to edit this event' });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:id/delete',authenticateToken,async (req,res) => {
    const userId = req.decoded.userId;
    try {
        const owner = await database.getEventOwnerById(req.params.id);
        if (owner === userId) {
            await database.deleteEventById(req.params.id);
            res.status(200).json({message: 'Event deleted successfully'});
        } else {
            res.status(403).json({error: 'You are not authorized to delete this event'});
        }
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

module.exports = router;