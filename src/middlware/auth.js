const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
    try{
        //const token = req.header("Authorization").replace("Bearer ", "");
        const token = req.cookies["auth_token"];
        const decode = jwt.verify(token, "thesecretword");
        const user = await User.findOne({ _id: decode._id, "tokens.token": token });

        if(!user){
            throw new Error();
        }
        req.authtoken = token;
        req.user = user;

        next();

    } catch (e) {
        res.status(401).send({error: "Please Authenticate"});
    }  
}


module.exports = auth;