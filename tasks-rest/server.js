import express from "express";
import {tasks} from "./data.js";
const app = express();

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});

app.use(express.json());

app.use((req,res,next) =>{
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get("/tasks", (req, res) => {
    res.json(tasks);
});

app.get("/tasks/:id", (req,res) =>{
    const id = Number(req.params.id);
    const task = tasks.find(task => task.id === id);
    if(!task){
        res.status(404).json({message: "Task not found"});
        return;
    }
    res.status(200).json(task);
});

app.post("/tasks", (req,res) =>{
    console.log(req.body);
    let task = req.body.task;
    let newTask = {
        id: tasks.length + 1,
        title: task,
        completed: false
    };
    tasks.push(newTask);
    res.status(201).json({message: "Task created"});

});
