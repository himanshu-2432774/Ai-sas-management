const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        trim:true
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },

    password:{
        type:String,
        required:true
    },

    role:{
        type:String,
        enum:["user", "admin"],
        default:"user"
    },

   plan: {
    type: String,
    enum: ["free", "basic", "pro"],
    default: "free"
},

credits: {
    type: Number,
    default: 10
},
subscriptionStatus: {
    type: String,
    enum: ["active", "expired"],
    default: "active"
},

subscriptionStartDate: {
    type: Date,
    default: Date.now
},

subscriptionEndDate: {
    type: Date,
    default: null

},
resetPasswordToken: {
    type: String,
    default: null
},

resetPasswordExpire: {
    type: Date,
    default: null
}
},
{
    timestamps:true
});

module.exports = mongoose.model("User",userSchema);