//events/id , events/new , events/ , events/id/edit, events/id/delete

const express = require('express');
const database = require("../database.js")
const fs = require('fs');
const path = require('path');
const authenticateToken = require("../middlewares/authenticateToken")

const router = express.Router();

router.get('/',authenticateToken,async (req,res) => {
    return await database.getAllEvents();
});

router.post('/',authenticateToken,async (req,res) => {
    return await database.getAllEvents();
    //add filter
});

router.post('/new',authenticateToken,async (req, res) => {
    //new event
});

router.get('/:id',authenticateToken,async (req,res) => {
    return await database.getEventById(req.params.id);
});
router.post('/:id/edit',authenticateToken,async (req,res) => {
    //edit event if owner
    const userId = req.decoded.userId;
    if (userId === await database.getEventOwnerById(req.params.id)) {
        //build the new event from the request
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
            res.status(403).json({error: 'Forbidden'});
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({error: 'Internal server error'});
    }
});

module.exports = router;