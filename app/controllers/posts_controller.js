//                  _
//  _ __   ___  ___| |_ ___
// | '_ \ / _ \/ __| __/ __|
// | |_) | (_) \__ \ |_\__ \
// | .__/ \___/|___/\__|___/
// |_|

var Post = require('../models/post');
var Comment = require('../models/comment');
var debug = require('debug')('app:controller:posts')

const EARTH_RADIUS = 3959.0;

/////////////////////
//	Post API
/////////////////////

/** CREATE **/

/**
* @description Create a new post
*/
function createPost(request, response) {
  var user = request.user;
  var content = request.body.content;
  var latitude = request.body.latitude || request.body.lat;
  var longitude = request.body.longitude || request.body.long;

  debug(`User ${user._id} creating post at ${latitude}, ${longitude}`);

  var post = new Post({
    user: user._id,
    content: content,
    latitude: latitude,
    longitude: longitude,
  });

  post.save()
    .then(function(post) {
      response.json(post);
    }).catch(function(err) {
      response.status(400).json({
        error: {
          code: err.code || 400,
          message: err.message
        }
      });
    });
}


/** READ **/
/**
* @description Finds a post by post ID
*/
function findPost(request, response) {
  var postID = request.params.postID;
  // find the post by id
  Post.findById(postID)
    .exec()
    .then(function(post) {
      if (post) {
        // there it is
        response.json(post)
      } else {
        // no post found, throw error to be caught later
        var error = new Error('Invalid post id');
        error.safeMessage = 'That post doesn\'t exist';
        error.code = 400;
        throw error;
      }
    }).catch(function(error) {
      console.log(error);
      response.status(400).json({
        error: {
          code: error.code,
          message: error.safeMessage || 'Error when looking for post'
        }
      });
    });
}

/** DELETE **/
/**
* @description Marks a post as deleted (soft delete)
*/
function destroyPost(request, response) {
  var thisUser = request.user._id;
  var postID = request.params.postID;

  debug(`user ${request.user._id} deleting post ${postID}`);

  Post.findById(postID)
    .where('user', thisUser)
    .update({ is_deleted: true })
    .exec()
    .then(function(modified) {

      if (modified.nModified > 0) {
        //success
        response.json({
          success: true
        });

      } else { // post may not belong to user, there's some funny business here..
        debug(`User ${thisUser} might not own post ${postID}`);
        response.status(401).json({
          error: {
            code: 401,
            message: 'something fishy is going on.'
          }
        });
      }

    }).catch(function(error) {
      console.log(error);
      response.status(500).json({
        error: {
          code: error.code || 500,
          message: 'couldn\'t delete the post'
        }
      })
    });
}

/** SEARCH **/
/**
* @description Searches for local posts by lat/long
*/
function postsByLocation(request, response) {
  var user = request.user;
  var userTeam = user.team;
  var latitude = request.query.latitude || request.query.lat;
  var longitude = request.query.longitude || request.query.long;
  var radiusMiles = parseFloat(request.query.within) || 5.0;

  queryPostsAtLocation(user, latitude, longitude, radiusMiles)
  .then(function(posts) {
    // send the ish
    response.json({
      posts: posts
    });

  }).catch(function(error) {
    // something bad happened
    console.log(error);
    response.status(500).json({
      error: {
        code: error.code || 500,
        message: error.message
      }
    })
  })
}

/**
* @description Utility for querying posts and autoexpanding radius !
*/
function queryPostsAtLocation(user, latitude, longitude, radiusMiles) {

  var radiusRadians = radiusMiles / EARTH_RADIUS;
  // use x/y coordinates for Mongo
  var xyCoordinate = [longitude, latitude];
  // construct a geoJSON point
  var point = {
    type: 'Point',
    center: xyCoordinate,
    maxDistance: radiusRadians,
    spherical: true
  };

  debug(`${user._id} Looking for posts ${radiusMiles} miles and ${radiusRadians} radians from ${xyCoordinate}`);

  // look for public posts within X miles, not deleted, by most recent
  var query = Post.find()
    .ne('is_deleted', true)
    .near('point', point)
    .sort('-createdAt')
    .limit(200)
    .exec().then(function(posts) {

      debug(`${posts.length} posts found.`)

      return posts;
    });

    return query;

}




/////////////////////
//	Exports
/////////////////////

module.exports.createPost = createPost;
module.exports.findPost = findPost;
module.exports.destroyPost = destroyPost;
module.exports.postsByLocation = postsByLocation;
