const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/user");
const auth = require("../middlware/auth");
const {sendWelcomeEmail, sendCanceleEmail} = require("../emails/acccount");
const path = require("path");
const router = new express.Router();



const upload = multer({
    // dest: "avatar", set the storage path
    limits: {
        fileSize: 1000000 // 1MB
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return  cb(new Error("Please upload an image"));
        }
        cb(undefined, true);  
    }
    
});

router
//create users(signup)
.post("/users", async (req,res) => {
    const user = new User(req.body); // express.json parses the content of req.body
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        //res.cookie("auth_token", token);
        res.status(201).send({ user, token});
        //res.sendFile(path.resolve(__dirname, "..", "views", "private.html"));
    } catch (error) {
        res.status(400).send(error)
    }
})
//login
.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        //res.cookie("auth_token", token);
        res.send({user, token});
       // res.sendFile(path.resolve(__dirname, "..", "views", "private.html"));
    } catch (e) {
        res.status(400).send(e.message);
    }
})

.post("/users/me/avatar",  auth, upload.single("avatar"), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send()
},(error, req, res, next) => {
    res.status(400).send({error: error.message});
})

.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((tok) => tok.token !== req.authtoken);

        await req.user.save();

        res.send("Successfully logged out");
    } catch (e) {
        res.status(500).send();
    }
})

.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];

        await req.user.save();

        res.send("Successfully logged out of all sessions.");
    } catch (e) {
        res.status(500).send();
    }
})
//read user profile
.get("/users/me", auth, async (req, res) => {
    res.send(req.user);

    // try {
    //    const users = await User.find({});
    //     if(users.length === 0){
    //     return res.status(200).send("Empty collection ");
    //     }
    //     res.status(200).send(users);
    // } catch (error) {
    //     res.status(500).send();
    // }

})

//update profile
.patch("/users/me", auth, async (req,res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "age", "password"];
    const isAllowed = updates.every((update) => allowedUpdates.includes(update));

    if(!isAllowed){
      return  res.status(400).send({"error": "Invalid Update!"});
    }

    try {
        // const user = await User.findById(req.params.id);

        updates.forEach((update) => req.user[update] = req.body[update]); //used cos of middleware
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        
        await req.user.save();
        
        // if(!user){return res.status(404).send({"error": "User not Found"})};
        res.send(req.user);
        
    } catch (e) {
        res.status(400).send(e);
    }
})

.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCanceleEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
})

.delete("/users/me/avatar",  auth, upload.single("avatar"), async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send()
})

//Fetching the image from the browser
.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar) {
            throw new Error()
        }

        res.set("Content-Type", "image/png");
        res.send(user.avatar);
    } catch(e) {
        res.status(404).send()
    }
});



module.exports = router;