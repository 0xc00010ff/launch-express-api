//                  _
//  _ __   ___  ___| |_
// | '_ \ / _ \/ __| __|
// | |_) | (_) \__ \ |_
// | .__/ \___/|___/\__|
// |_|

var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

/**
* @description The Post data schema
*/
var postSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 400 },
  comment_count: { type: Number, default: 0, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  point : {
    type: [Number],
    index: '2dsphere'
  },  is_deleted: Boolean
}, { timestamps: true }); // adds `createdAt` and `updatedAt`

/**
* @description Easy setter for lat-long minded folks (because Mongo does it in reverse).
*   This is because Mongo does geo indexing by long,lat which is really some international
*   standard but whatever. Standards, eh
*/
postSchema.pre('save', function(next) {
  this.point = [this.longitude, this.latitude];
  next();
});

// create model using schema
var Post = Mongoose.model('Post', postSchema);

/////////////////////
//	Exports
/////////////////////

module.exports = Post;
