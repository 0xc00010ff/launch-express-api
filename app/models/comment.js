//                                           _
//   ___ ___  _ __ ___  _ __ ___   ___ _ __ | |_
//  / __/ _ \| '_ ` _ \| '_ ` _ \ / _ \ '_ \| __|
// | (_| (_) | | | | | | | | | | |  __/ | | | |_
//  \___\___/|_| |_| |_|_| |_| |_|\___|_| |_|\__|
//

var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

/**
* @description The Comment schema
*/
var commentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 300 },
  parent_post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  is_deleted: Boolean,
}, { timestamps: true });


// create model using schema
var Comment = Mongoose.model('Comment', commentSchema);

/////////////////////
//	Exports
/////////////////////

module.exports = Comment;
