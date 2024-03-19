const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT;

const morgan = require('morgan');
const path = require('path');

app.use(morgan('tiny'));
app.use(express.static("public"));

const indexRouter = require(path.join(__dirname,"roads/index.js"));
//const eventsRouter = require(path.join(__dirname,"roads/events.js"));
app.use("/", indexRouter);
//app.use("/events", eventsRouter);

//app.get('/:name',(req,res) => {
//    res.send('Hello, '+ req.params.name + '!');
//});

app.use( (req, res, next) => {
    res.status(404).send('Page not found');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

