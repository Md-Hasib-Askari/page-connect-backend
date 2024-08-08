/*
* Add all your Routes here and export them
*/
import express from 'express';
import * as UserController from '../Controllers/UserController.ts';
import * as PageController from '../Controllers/PageController.ts';
import * as MessageController from '../Controllers/MessageController.ts';
import authVerify from '../Middlewares/AuthVerify.ts';

const router = express.Router();
// const router = require('express').Router();
// const UserController = require("../controllers/UserController");
// const PageController = require("../controllers/PageController");
// const MessageController = require("../controllers/MessageController");
// const authVerify = require("../middlewares/AuthVerify");

// User Routes
router.get('/getUser', authVerify, UserController.getUser);
router.get('/verifyUser', authVerify, UserController.verifyUser);

// Save access token to MongoDB
router.post('/saveAccessToken', UserController.saveAccessToken);

// Page Routes
router.get('/getPages', authVerify, PageController.getPages);
router.get('/getPage', authVerify, PageController.getPage);
router.post('/savePage', authVerify, PageController.savePage);

// Message Routes
router.get('/syncMessages', authVerify, MessageController.syncMessages);

export default router;
// module.exports = router;