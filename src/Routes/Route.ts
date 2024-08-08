/*
* Add all your Routes here and export them
*/
const router = require('express').Router();
const UserController = require("../controllers/UserController");
const PageController = require("../controllers/PageController");
const MessageController = require("../controllers/MessageController");
const authVerify = require("../middlewares/AuthVerify");

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

module.exports = router;