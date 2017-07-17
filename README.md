# express-launch
Boilerplate for a production Express JSON API

### What is it?
A super simple production express app that allows CRUD on locational microposts. 
With a slightly more sane project structure than default to honor loose mvc rules. 
JWT for stateless authentication. Mongoose for easy hookup to MongoDB. dot-env for development configuration.

### What do I do?
#### Setup
Install Node, MongoDB, and nodemon (optional) locally

##### Node
[https://nodejs.org/en/#download](https://nodejs.org/en/#download)

##### MongoDB (will use the `test` db by default)
[https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
then start the MongoDB daemon in the background with `mongod`

##### Nodemon (watches your files and reloads the server on save)
sudo npm install -g nodemon

### Running the app
Make sure the MongoDB daemon is running locally
(Copy and paste)
```
git clone https://github.com/0xc00010ff/express-launch.git &&
cd express-launch &&
npm install &&
nodemon
```

Use [Postman](https://www.getpostman.com/) for playing with the API and [Robo3T](https://robomongo.org/) for accessing Mongo visually.

#### note: .env will be included in the repo to start but it should not be left there. 
When ready, remove it from git with `git rm --cached .env`
