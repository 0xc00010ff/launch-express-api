//                  _
//  _ __ ___  _   _| |_ ___  ___
// | '__/ _ \| | | | __/ _ \/ __|
// | | | (_) | |_| | ||  __/\__ \
// |_|  \___/ \__,_|\__\___||___/
//

const express = require('express');
const router = express.Router();
const defaultRouter = express.Router();
const apiRouter = express.Router();
const postsRouter = express.Router();
const PostsController = require('./controllers/posts_controller');
const CommentsController = require('./controllers/comments_controller');
const UsersController = require('./controllers/users_controller');

const debug = require('debug')('app:routing');

// / just returns a plain html page
defaultRouter.get('/', function(request, response) {
  // render the html page with some motivational text
  response.render('index', { title: 'Let\'s fucking do this' });
});

// heartbeat
defaultRouter.get('/heartbeat', function(request, response) {
  // send defaults to 200, same as `response.status(200).send()`
  response.send('OK');
});

/////////////////////
//	Posts
/////////////////////

// routes can be singular..
apiRouter.post('/posts', UsersController.checkUser, PostsController.createPost)
// ..or grouped
apiRouter.route('/post/:id')
         .get(UsersController.checkUser, PostsController.findPost)
         .delete(UsersController.checkUser, PostsController.destroyPost);


/////////////////////
//	Comments
/////////////////////

apiRouter.post('/posts/:post_id/comments', UsersController.checkUser, CommentsController.createComment);
apiRouter.delete('/posts/:post_id/comments/:comment_id', UsersController.checkUser, CommentsController.destroyComment);


/////////////////////
//	Users
/////////////////////

apiRouter.get('/users/:id', UsersController.checkUser, UsersController.findUser);
apiRouter.post('/signup', UsersController.createUser);
apiRouter.post('/login', UsersController.login);
apiRouter.post('/logout', UsersController.checkUser, UsersController.logout);


/////////////////////
//	Exports
/////////////////////

/* Route consolidation */
router.use(defaultRouter);
router.use('/api/v1', apiRouter);

module.exports = router;
