const express = require("express");
const User = require("../models/user");
const auth = require("../middlware/auth");
const path = require("path");
const router = new express.Router();

router
//create users(signup)
.post("/users", async (req,res) => {
    const user = new User(req.body); // express.json parses the content of req.body
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.cookie("auth_token", token);
        res.sendFile(path.resolve(__dirname, "..", "views", "private.html"));
    } catch (error) {
        res.status(400).send(error)
    }
})
//login
.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.cookie("auth_token", token);
        res.sendFile(path.resolve(__dirname, "..", "views", "private.html"));
    } catch (e) {
        res.status(400).send(e.message);
    }
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
        
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;