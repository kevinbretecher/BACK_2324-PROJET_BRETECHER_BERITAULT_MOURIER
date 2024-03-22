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

//mounts index router on / and events router on /events
const indexRouter = require(path.join(__dirname,"roads/index.js"));
const eventsRouter = require(path.join(__dirname,"roads/events.js"));
app.use("/", indexRouter);
app.use("/events", eventsRouter);

//app.get('/:name',(req,res) => {
//    res.send('Hello, '+ req.params.name + '!');
//});

app.use( (req, res, next) => {
    //if no route matches error 404
    res.status(404).send('Page not found');
});


//websocket server
const http = require('http');
const messagesSocket = require('./messagesSocket'); // Import WebSocket server logic
const server = http.createServer(app);
const io = messagesSocket(server);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});



