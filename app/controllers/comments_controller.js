//                                           _
//   ___ ___  _ __ ___  _ __ ___   ___ _ __ | |_ ___
//  / __/ _ \| '_ ` _ \| '_ ` _ \ / _ \ '_ \| __/ __|
// | (_| (_) | | | | | | | | | | |  __/ | | | |_\__ \
//  \___\___/|_| |_| |_|_| |_| |_|\___|_| |_|\__|___/
//

const Post = require('../models/post');
const Comment = require('../models/comment');
const debug = require('debug')('app:controller:posts')

/////////////////////
//	Comment API
/////////////////////

/** LIST **/
/**
* @description Fethes comments for a particular post
*/
function commentsForPost(request, response) {
  var user = request.user;
  var postID = request.params.postID;
  // get all comments where parent_post._id == postID, not deleted, not blocked
  Comment.fromPostID(postID, user)
    .exec().then(function(comments) {
      response.json({
        comments: comments
      });
    }).catch(function(error) {
      console.error(error);
      response.status(400).json({
        error: {
          code: 400,
          message: 'Can\'t find the comments'
        }
      });
    });
}

/** CREATE **/
/**
* @description Whips up a new comment
*/
function createComment(request, response) {
  var currentUser = request.user;
  var currentUserID = request.user._id;
  var postID = request.params.post_id;
  var content = request.body.content;

  debug(`${currentUser} commenting on post ${postID}`)
  // save it
  // fetch the post,
  // save the comment to that
  // The order of operations matters for data integrity
  // Fetch the parent post first.
  Post.findById(postID)
    .ne('is_deleted', true)
    .exec().then(function(post) {
      if (post) {
        // create a comment
        var comment = new Comment({
          user: currentUserID,
          parent_post: post._id,
          content: content,
        });
        // save the comment, return the promise chain
        return comment.save().then(function(comment) {
          // increment the comment count
          post.comment_count += 1;
          // save the post, pass along the promise result
          return post.save().then(function(post) {
            // save the post after incrementing, but ultimately return the comment
            return comment;
          });
        });

      } else {
        // no post found, throw error to be caught later
        var error = new Error('Invalid parent post');
        error.safeMessage = 'The parent post doesn\'t exist';
        error.code = 400;
        throw error;
      }

    }).then(function(comment) {

      // success, send back the comment
      response.json(comment);

    }).catch(function(error) {
      //error, log it and send the safe description
      console.log(error);
      var code = error.code || 400;
      response.status(400).json({
        error: {
          code: error.code || 400,
          message: error.safeMessage || 'Could not save the comment'
        }
      });
    });
}

/** DELETE **/
/**
* @description Trashes a comment
*/
function destroyComment(request, response) {
  var thisUser = request.user._id;
  var postID = request.params.postID;
  var commentID = request.params.commentID;
  // mark the comment as deleted
  // update it
  Comment.findById(commentID)
    .where('user', thisUser)
    .update({ is_deleted: true })
    .exec()
    .then(function(commentUpdate) {
      // if the comment was successfully updated (to soft-delete)
      if (commentUpdate.nModified > 0) {
        // decrement the parent post comment_count
        return Post.findById(postID)
          .update({ $inc: { comment_count: -1 } })
          .exec()

      } else { // something funny is going on...
        // this probably isn't their post
        var error = new Error('Comment deletion went off the rails after fetch');
        throw error;
      }

    }).then(function(post) {
      //success
      response.json({
        success: true
      });

    }).catch(function(error) {
      console.log(error);
      response.status(400).json({
        error: {
          code: error.code || 400,
          message: 'couldn\'t complete comment deletion'
        }
      })
    });

}

/////////////////////
//	Exports
/////////////////////


module.exports.createComment = createComment;
module.exports.destroyComment = destroyComment;
