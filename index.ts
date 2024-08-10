/*
* This is the main file for initializing your server
*/

// Importing the dotenv module to read the .env file
import 'dotenv/config'

// Importing the app module
import { server as initializeApp } from './app.ts';

const PORT: number = Number(process.env.RUNNING_PORT) || 5000;
initializeApp.listen(PORT, () => {
    console.log(`Server running @ http://localhost:${PORT}`)
});