const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/PaytmApp")

const userSchema = new mongoose.Schema({ 
 firstName:{type: String, required: true, trim: true, maxLength: 50} ,
 lastName:{type: String, required: true, trim: true, maxLength: 50} ,
 username:{type: String, required: true, unique: true, lowercase: true, minLength: 4, maxLength: 50, trim: true} , 
 password:{type: String, required: true, minLength: 8}}
);

const User = mongoose.model("User", userSchema)

const accountSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
})

const Account = mongoose.model('Account', accountSchema);


module.exports = {
    User , Account
};
