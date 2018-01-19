const mongoose = require('mongoose');
let Schema = mongoose.Schema;
// define the company schema
var contentSchema = new Schema({
    "authorName" : String,
    "authorEmail" : String,
    "subject" : String,
    "commentText" : String,
    "postedDate" : Date,
    "replies" : [{
        "comment_id" : String,
        "authorName" : String, 
        "authorEmail" : String, 
        "commentText" : String,
        "repliedDate" : Date
    }]
});


let Comment;
module.exports.initialize = function () { 
    return new Promise(function (resolve, reject) {
         let db = mongoose.createConnection("mongodb://hkim246:Epsqj6574@ds155424.mlab.com:55424/a6"); 
         db.on('error', (err)=>{ 
             reject(err);  
         }); 
         db.once('open', ()=>{ 
             Comment = db.model("comments", contentSchema); 
             console.log("Mongo connection is open");
             resolve(); 
        }); 
    }); 
};

module.exports.addComment = (data) =>{
    return new Promise( (resolve, reject) => {
        data.postedDate = Date.now();
        let newComment = new Comment(data);
        newComment.save( (err) => {
            if(err){
                reject("There was an error saving the newCommnet");
            }else{
                resolve(newComment._id);
            }
        });
    });
};

module.exports.getAllComments = () =>{
    return new Promise( (resolve, reject) =>{
        Comment.find()
        .sort({postedDate : 1})
        .exec()
        .then((comments) => {
            resolve(comments);
        })
        .catch((err) => {
            reject("getAllComments Error" + err);
        });
    });
};



module.exports.addReply = (data) =>{
    return new Promise( (resolve, reject) =>{
        data.repliedDate = Date.now();
        console.log('2',data);
        
        Comment.update({ _id : data.comment_id },
        { $addToSet : { replies:data } },
        { multi : false})
        .exec()
        .then(() =>{
            resolve();
        })
        .catch( (err) => {
            reject("addReply Error" + err);
        });
    });
};

