import {} from "dotenv/config";

import express from "express";

import { createServer } from "http";
import path from "path";
import helmet, { contentSecurityPolicy, crossOriginEmbedderPolicy } from 'helmet'

import database from "./services/Database";
import router from "./Routes/router";
import useSocket from "./socket/socket";

import passport from "./config/passport";

import { c } from "./utils/color";

console.clear();
console.log(c.bold(`Starting server in ${process.env.NODE_ENV} mode`))

const app = express();


// helmet TODO: change COEP with working yt player ;/
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc: ["fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'www.youtube.com'],
      frameSrc: ['youtube.com', 'www.youtube.com'],
      objectSrc: ["'none'"],
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))


app.disable("x-powered-by");

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



// connect to db
const connection = database();

// passport
passport();

//
app.all("*", (req, res, next) => {
  console.log(req.path);

  if (connection.readyState !== 1)
    return res.status(500).json({ err: "databaseError" });

  next();
});

// add routing
router(app);

// add static path for frontend
if (process.env.NODE_ENV === "production") {
  // static path for client
  app.use(express.static(path.join(__dirname, "/../client/")));

  // serve client
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/../client/index.html"));
  });
}

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

useSocket(httpServer);

httpServer.listen(PORT, (err) => {
  console.log(c.listening(`Server listening on ${PORT}`));
});
