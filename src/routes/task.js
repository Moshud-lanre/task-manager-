const express =require("express");
const Task = require("../models/task");
const router = new express.Router();


router
.post("/tasks", async (req, res) => {
    const task = new Task(req.body);
    try {
        await task.save();
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send()
    }
})

.get("/tasks", async (req, res) => {
    try {
       const tasks = await Task.find({}); 
       if(tasks.length === 0) return res.send("Empty")
       res.send(tasks);
    } catch (error) {
        res.status(500).send(error);
    }
    
})

.get("/tasks/:id", async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findById(_id);
        if(!task) return res.status(404).send("Zero match found, check the id and try again");
        res.send(task);
    } catch (error) {
        res.status(500).send(error)
    }
    
})

.patch("/tasks/:id", async (req, res) => {
    const Updates = Object.keys(req.body);
    const Allowedupdate = ["description", "completed"];
    const isValidUpdate = Updates.every((update) => Allowedupdate.includes(update));

    if(!isValidUpdate){return res.status(400).send({"error": "Invalid Update!"})};

    try {
        const task = await Task.findById(req.params.id);

        Updates.forEach((update) => task[update] = req.body[update]);

        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

        await task.save();
        
        if(!task){
            return res.status(404).send({error: "User not found"})
        };
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
})

.delete("/tasks/:id", async (req, res) => {
    try {
        const task =  await Task.findByIdAndDelete(req.params.id);
        if(!task){
            return res.status(404).send({error: "Task not found"});
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;