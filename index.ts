/*
* This is the main file for initializing your server
*/

// Importing the ngrok module to create a tunnel
const ngrok = require('@ngrok/ngrok');
// Importing the dotenv module to read the .env file
const dotenv = require('dotenv');
dotenv.config({
    path: './config.env'
});

// Importing the app module
const { server: initializeApp } = require('./app');

initializeApp.listen(process.env.RUNNING_PORT, async () => {
    console.log(`Server running @ http://localhost:${process.env.RUNNING_PORT}`)
    try {
        // ngrok.connect({ addr: process.env.RUNNING_PORT, authtoken_from_env: true })
	    //     .then((listener: any) => {
        //         console.log(`Ingress established at: ${listener.url()}`)
        //     });     
    } catch (error) {
        console.log(error);
    }
});