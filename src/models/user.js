const mongoose = require("mongoose");
const { default: validator } = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true //trim removes white spaces
    },
    email: {
        type: String,
        trim: true,
        unique: true,
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
    },
    token: [{
        
            token: {
                type: String,
                required: true
            }
        
    }]
});

userSchema.methods.generateAuthToken = async function (){
    const user = this;

    const token = jwt.sign({_id: user._id.toString()}, "thesecretword");

    user.token = user.token.concat({token});

    await user.save()

    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if(!user){
        throw new Error("Unable to login");
    }
    
    const isMatch =  await bcrypt.compare(password, user.password);

        if(!isMatch){
        throw new Error("Unable to login");
        } 
        return user;
    
}
// Middleware that hash password (the 'pre' is used for actions before and 'post' for after, 'save' is a type of action carried out)
userSchema.pre("save",  async function (next){ 
    const user = this;

    if (user.isModified("password")){
        user.password = await bcrypt.hash(user.password, 10);
    }

    next();
})

const User = mongoose.model("User", userSchema);


module.exports = User;