//
//  _   _ ___  ___ _ __ ___
// | | | / __|/ _ \ '__/ __|
// | |_| \__ \  __/ |  \__ \
//  \__,_|___/\___|_|  |___/
//

var User = require('../models/user');
var JWT = require('jsonwebtoken');
var debug = require('debug')('app:controllers:users')

/***** DO NOT CHANGE THIS. LIVE AND SENSITIVE KEY *****/
const _auth_secret = 'you-cant-change-this-after-prod';
/******/

/////////////////////
//  Auth Middleware
/////////////////////

function checkUser(request, response, next) {
  // get the auth bearer token
  var token = request.token;
  if (!token) {
    debug('no bearer token')
    // guard no bearer token
    return unauthorized(response);
  }

  // verify the jwt
  JWT.verify(token, _auth_secret, function (error, payload) {
    // check for decoding error
    if (error) {
      debug(`Error decoding token: ${error}`);
      return unauthorized(response);
    }
    // success
    // set the basic user(+ _id) payload as the user
    request.user = payload;
    next();
  });

}


/////////////////////
//  Auth API
/////////////////////

function login(request, response) {
  var username = request.body.username && request.body.username.toLowerCase();
  var password = request.body.password;
  // find a user by email and check the password
  User.findOne({username: username})
    .exec()
    .then(ensureUserExists)
    .then(matchUserPassword(password))
    .then(generateTokenForUser)
    .then(successfulLogin(response))
    .catch(function (error) {
      console.error(error);
      return unauthorized(response);
    });
}

function logout(request, response) {
  // we're using stateless tokens, logout is performed client side
  // so just send back a thumbs up in case the client just wants permission
  response.status(202).json({
    type: 'success',
    success: true
  });
}


/////////////////////
//	API
/////////////////////

/**
* @description Creates user with POST body
*/
function createUser(request, response) {
  var username = request.body.username;
  var password = request.body.password;

  if (!(username && password)) {
    return response.status(400).json({
      error: {
        code: 400,
        message: 'Bad params'
      }
    });
  }

  // sanitize input
  username = username.trim()

  // sometimes we want to hold on to this for monitoring fraud
  var ip = request.clientIp;
  debug(`IP: ${ip}`);

  debug(`Creating user ${username} from ${ip}`);

  var user = new User({
    username: username,
    password: password,
  });

  // save the user
  user.save().then(function(user) {
    // we have a user, but we need to give them an auth token too
    var userAndToken = generateTokenForUser(user);
    var token = userAndToken.token;
    // respond successfully
    response.status(201).json({
      user: user,
      token: token
    });
  })
  .catch(function(error) {
    console.error(error);
    // check if theres an invalid uniqueness
    if (error.code == 11000) {
      response.status(409).json({
        error: {
          code: 409,
          message: "Username already taken"
        }
      });
    } else { // other error
      response.status(500).json({
        error: {
          code: error.code || 27107,
          message: "Could not save the user"
        }
      });
    }
  });
}


/**
* @description Finds user by ID
*/
function findUser(request, response) {
  var currentUserID = request.user && request.user._id;
  var targetUserID = request.params.userID;
  // get the user by id, hide the password and logins

  var isCurrentUser = (currentUserID == targetUserID);

  debug(`user ${currentUserID} looking at ${targetUserID}`);

  User.findById(targetUserID)
    .exec()
    .then(function(user) {
      if (user) {
        response.json(user);
      } else {
        // that user id is bogus
        response.status(400).json({
          error: {
            code: 400,
            message: 'That user doesn\'t exist'
          }
        })
      }
    });
}


/**
* @description Logs in a user
*/
function findUser(request, response) {
  var currentUserID = request.user && request.user._id;
  var targetUserID = request.params.userID;
  // get the user by id, hide the password and logins

  // TODO Looking at your own account
  var isCurrentUser = (currentUserID == targetUserID);

  debug(`user ${currentUserID} looking at ${targetUserID}`);

  User.findById(targetUserID)
    .exec()
    .then(function(user) {
      if (user) {
        response.json(user);
      } else {
        // that user id is bogus
        response.status(400).json({
          error: {
            code: 400,
            message: 'That user doesn\'t exist'
          }
        })
      }
    });
}


////////////////
//  Utils
////////////////

/**
* Generate a JWT for a user
* @return {Object} userAndToken - the user and auto token
* @return {Object} userAndToken.user - the user Object
* @return {string} userAndToken.token - the jwt token
*/
function generateTokenForUser(user) {
  // create a token payload for the user
  var payload = {
    _id: user._id
  };

  // create the actual token
  var token = JWT.sign(payload, _auth_secret);

  // return a user-and-token object
  var userAndToken = {
    user: user,
    token: token
  };

  return userAndToken;
}

function ensureUserExists(user) {
  if (!user) {
    throw new Error('No user matched that login');
  }
  return user;
}

function matchUserPassword(password) {
  return function (user) {
    return user.comparePassword(password)
      .then(function (matched) {
        if (matched) {
          return user;
        } else {
          throw new Error('Password doesn\'t match.');
        }
      });
  };
}

function successfulLogin(response) {
  return function (userAndToken) {
    response.json({
      user: userAndToken.user,
      token: userAndToken.token
    });
  };
}

function unauthorized(response) {
  response.status(401).json({
    error: {
      code: 401,
      message: 'Not authorized'
    }
  });
}


/////////////////////
//	Exports
/////////////////////


module.exports.checkUser = checkUser;
module.exports.createUser = createUser;
module.exports.login = login;
module.exports.logout = logout;
module.exports.findUser = findUser;
