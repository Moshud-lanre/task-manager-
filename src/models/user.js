const mongoose = require("mongoose");
const { default: validator } = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true //trim removes white spaces
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)) throw new Error("Email is invalid")
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minlength: 6,
        validate(value){
            if(value.toLowerCase().includes("password")) throw new Error("Kindly change the Password, can't contain 'password'");
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0){
                throw new Error("Age must be a positive number!");
            }
        }
    }
});
// Middleware that activate bcrypt (the 'pre' is used for actions before and 'post' for after, 'save' is a type of action carried out)
userSchema.pre("save",  async function (next){ 
    const user = this;

    if (user.isModified("password")){
        user.password = await bcrypt.hash(user.password, 10);
    }

    next();
})

const User = mongoose.model("User", userSchema);


module.exports = User;