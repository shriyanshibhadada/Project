require("dotenv").config(); 
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const cors = require('Cors');
const { v4: uuidv4 } = require('uuid');
const io = require('socket.io')(server, {
    cors:{
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const redis = require('redis');
client = redis.createClient();

client.on("error", (error) => {
  console.log(error);
});

const saveCallId =  (key, value) => {
    return new Promise((resolve, reject) => {
            Client.SET(key, JSON.stringify(value), "EX", 86400, (err, res) => {
            if (err) {
            reject(err);
            }
            resolve(res);
        });
    });
};
  
const getCallId = (key) => {
    return new Promise((resolve, reject) => {
            Client.GET(key, (err, res) => {
            if (err) {
            reject(err);
            }
            resolve(JSON.parse(res));
        });
    });
};

const savecallid = async (req, res) => {
    try {
        const { id, signalData } = req.body;
        await saveCallId(id, signalData);
        res.status(200).send(true);
    } catch (ex) {
        res.status(400).send(ex.message);
    }
};
  
const getcallid = async (req, res) => {
    try {
        const { id } = req.params;
        const code = await getCallId(id);
        res.status(200).send({ code });
    } catch (ex) {
        res.status(400).send(ex.message);
    }
};

const router = express.Router();
router.post("/api/save-call-id", savecallid);
router.get("/api/get-call-id/:id", getcallid);

app.use([cors(), bodyParser.json(), bodyParser.urlencoded({extended: false}), router]);

const PORT = process.env.PORT || 5000;


io.on("connection", (socket) => {

	socket.on("code", (data, callback) => {
		socket.broadcast.emit("code", data);
	});
});


server.listen(PORT, () =>{
    console.log(`listening to server on ${PORT}`);
});
