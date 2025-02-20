import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import googlePkg from 'passport-google-oauth20';
import dotenv from 'dotenv';
import session from 'express-session';
import { googleAuth, googleAuthResponse } from './authStratergies/google.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { fileURLToPath } from 'url';

const genAi = new GoogleGenerativeAI(process.env.GOOGLE_GEN_AI_API_KEY);
export const model = genAi.getGenerativeModel({model: "gemini-1.5-flash"})

dotenv.config({
  path: './.env',
});

const project_mode = process.env.PROJECT_MODE || 'development';

const app = express();

app.use(session({
  secret: 'heyheyheyhohoho',  // Replace with your own secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: project_mode == "production" ? true : false }  // Set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.use(cors({
  origin:  process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/userCodes', express.static(path.join(__dirname, '../public/userCodes')));
app.use(cookieParser());

// import routes

import userRoutes from './routes/user.route.js';
import imageUpload from './routes/image.route.js';
import ideaRoutes from './routes/idea.route.js';
import chatRoutes from './routes/chatAndGroup.route.js';
import messageRoutes from './routes/message.route.js';
import commentRoutes from './routes/comment.route.js';
import notificationRoutes from './routes/notification.route.js';
import codeRoutes from './routes/code.route.js';

// use routes

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/images', imageUpload);
app.use('/api/v1/ideas', ideaRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/codes', codeRoutes);

// websocket stepup

import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  }
});

// import socket namespaces

import "./sockets/messaging.js";
import { messanging } from './sockets/messaging.js';
import "./sockets/signalling.js";
import { signalling } from './sockets/signalling.js';
import "./sockets/notification.js";
import { notification } from './sockets/notification.js';
import { textSuggestions } from './sockets/textSuggestions.js';

const PORT = process.env.WEBSOCKET_PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket Server running on port ${PORT}`);
});

// using socket namespaces

messanging();
signalling();
notification();
textSuggestions();

// authentication

const { Strategy: GoogleStrategy } = googlePkg;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, googleAuth));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: project_mode == 'production' ? '/' : 'http://localhost:5173',
}), googleAuthResponse);

// streaming

import { createCode, updateCode } from './stream/code.stream.js';
import jwt from 'jsonwebtoken';

app.get('/stream-code', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { token, codeId } = req.query;

  if (token) {
		try {
			const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
			req.user = decoded;
		} catch (error) {
			console.log("jwt error", error);
			res.status(401).json(new ApiResponse(401, {
				authenticated: false,
			}, 'You are not logged in'));
      res.end();
		}
	} else {
    res.status(401).json(new ApiResponse(401, {
      authenticated: false,
    }, 'You are not logged in'));
    res.end();
  }

  if (codeId) updateCode(req, res);
  else createCode(req, res);

  req.on('close', () => {
    res.end();
  })
})

export { 
  app,
  io,
};