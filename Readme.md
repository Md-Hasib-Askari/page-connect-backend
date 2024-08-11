# Documentation (Page Connect Backend)
## Table of Contents
- [Documentation](#documentation)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Endpoints](#endpoints)
    - [User](#user)
    - [Page](#page)
    - [Message](#message)
    - [Webhook](#webhook)
    - [Test](#test)
  - [Installation](#installation)

## Introduction
This is the backend of the Page Connect application. It is a RESTful API built using Node.js and Express.js. The API is used to interact with the Facebook Graph API to get the user data, pages, and messages. The API also handles the webhook events from Facebook. The API uses MongoDB to store the user data, pages, and messages. The API also uses JWT for authentication. The API is hosted on Azure.


## Endpoints
The API has the following endpoints:
### User
- `GET /api/V1/getUser`: Get the user data.
- `GET /api/V1/verifyUser`: Verify the user.
- `POST /api/V1/saveAccessToken`: Save the access token.
- `GET /api/V1/logout`: Logout the user.

### Page
- `GET /api/V1/getPages`: Get all the pages.
- `GET /api/V1/getPage`: Get a page.
- `POST /api/V1/savePage`: Save a page.

### Message
- `GET /api/V1/syncMessages`: Sync the messages of a page.

### Webhook
- `GET /webhook`: Verify the webhook.
- `POST /webhook`: Handle the webhook events.

### Test
- `GET /test`: Test the API which returns 'hello world'.

## Installation
1. Clone the repository.
2. Run `npm install` to install the dependencies.
3. Create a `.env` file in the root directory and add the following environment variables:
```env
MONGODB_URI=<MongoDB URI>
PORT=<Port>
JWT_SECRET=<JWT Secret>
FB_URI=<Facebook Graph API URI>
VERIFY_TOKEN=<Facebook Verify Token>
PAGE_ACCESS_TOKEN=<Facebook Page Access Token>
WEBHOOK_TOKEN=<Facebook Webhook Token>
```
4. Run `npm run dev` to start the server.
5. The server will be running on `http://localhost:<PORT>`.
6. For production, run `npm run build` and then `npm start`.
7. The API is hosted on Azure.
8. The API is live at `https://page-connect-hwdbfkgkdygjeca7.eastus-01.azurewebsites.net`.

## Author
- [Md Hasib Askari](https://findhasib.me)
- [LinkedIn](https://www.linkedin.com/in/mdhasibaskari/)
- [GitHub](https://github.com/Md-Hasib-Askari)