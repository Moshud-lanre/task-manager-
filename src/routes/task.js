const express =require("express");
const Task = require("../models/task");
const auth = require("../middlware/auth");
const router = new express.Router();


router
.post("/tasks", auth, async (req, res) => {
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        author: req.user._id
    });
    try {
        await task.save();
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send()
    }
})

.get("/tasks", auth,  async (req, res) => {
    const match = {};
    if(req.query.completed){
        match.completed = req.query.completed == "true";
    }

    try {
       
       //const tasks = await Task.find({author: req.user._id});
       await req.user.populate({
           path: "tasks",
           match,
           options: {
               limit: Number(req.query.limit),
               skip: parseInt(req.query.skip)
           }
       }).execPopulate(); //method 2
       //if(tasks.length === 0) return res.send("Empty")
       //res.send(tasks);
       res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error);
    }
    
})

.get("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({_id, author: req.user._id});
        if(!task) return res.status(404).send();
        res.send(task);
    } catch (error) {
        res.status(500).send(error)
    }
    
})

.patch("/tasks/:id", auth, async (req, res) => {
    const Updates = Object.keys(req.body);
    const Allowedupdate = ["description", "completed"];
    const isValidUpdate = Updates.every((update) => Allowedupdate.includes(update));

    if(!isValidUpdate){return res.status(400).send({"error": "Invalid Update!"})};

    try {
        const task = await Task.findOne({_id: req.params.id, author:req.user._id});
        
        if(!task){
            return res.status(404).send({error: "Task not found"})
        };
        Updates.forEach((update) => task[update] = req.body[update]);

        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

        await task.save();
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
})

.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const task =  await Task.findOneAndDelete({_id: req.params.id, author: req.user._id});
        if(!task){
            return res.status(404).send({error: "Task not found"});
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;