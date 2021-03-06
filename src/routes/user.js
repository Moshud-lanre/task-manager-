const express = require("express");
const User = require("../models/user");
const router = new express.Router();

router
//create users(signup)
.post("/users", async (req,res) => {
    const user = new User(req.body); // express.json parses the content of req.body
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    } catch (error) {
        res.status(400).send(error)
    }
})
//login
.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch (e) {
        res.status(400).send(e.message);
    }
})
//read users
.get("/users", async (req, res) => {
    try {
       const users = await User.find({});
        if(users.length === 0){
        return res.status(200).send("Empty collection ");
        }
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send();
    }

})
//get specific user
.get("/users/:id", async (req, res) => {
    const _id = req.params.id;

    try {
        const user = await User.findById(_id);
        if (!user) return res.status(404).send("No user matches, try another id ");
        res.send(user);
    } catch (error) {
        res.status(500).send(error)
    }
})
//update a user
.patch("/users/:id", async (req,res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "age", "password"];
    const isAllowed = updates.every((update) => allowedUpdates.includes(update));

    if(!isAllowed){
      return  res.status(400).send({"error": "Invalid Update!"});
    }

    try {
        const user = await User.findById(req.params.id);

        updates.forEach((update) => user[update] = req.body[update]); //used cos of middleware
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        
        await user.save();
        
        if(!user){return res.status(404).send({"error": "User not Found"})};
        res.send(user);
        
    } catch (e) {
        res.status(400).send(e);
    }
})

.delete("/users/:id", async (req, res) => {
    try {
        const user =  await User.findByIdAndDelete(req.params.id);
        if(!user){
            return res.status(404).send({error: "User not found"});
        }
        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;