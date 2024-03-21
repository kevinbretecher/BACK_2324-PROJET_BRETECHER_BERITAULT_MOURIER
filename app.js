const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT;

const morgan = require('morgan');
const path = require('path');

const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(morgan('tiny'));
app.use(express.static("public"));
app.use(cors());

const indexRouter = require(path.join(__dirname,"roads/index.js"));
const eventsRouter = require(path.join(__dirname,"roads/events.js"));
app.use("/", indexRouter);
app.use("/events", eventsRouter);

//app.get('/:name',(req,res) => {
//    res.send('Hello, '+ req.params.name + '!');
//});

app.use( (req, res, next) => {
    res.status(404).send('Page not found');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

