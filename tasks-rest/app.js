import http from "node:http";
import {tasks} from './data.js';

const server = http.createServer((req, res)=>{
    if(req.url === "/tasks" && req.method === "GET"){
        res.writeHead(200, {"Content-Type":"application/json"});
        res.end(JSON.stringify(tasks));
    }

    if(req.url.startsWith("/tasks/") && req.method === 'GET'){
        // res.writeHead(200, {"Content-Type":"application/json"});
        const id = Number(req.url.split("/")[2]);
        const task = tasks.find(task => task.id === id);
        if(!task){
            res.writeHead(404, {"Content-Type": "application/json"});
            return res.end(JSON.stringify({ message: "Task not found" }));
        }
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(tasks[id - 1]));
    }

    if(req.url === "/tasks" && req.method === "POST"){
        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });
        req.on("end", () => {
            
            let task = JSON.parse(body).task;
            let newTask = {
                id: tasks.length + 1,
                title: task,
                completed: false
            };
            tasks.push(newTask);
            res.writeHead(201, {"Content-Type":"application/json"});
            res.end(JSON.stringify({message: "Task created"}));
        });
    }

    if(req.url.startsWith("/tasks/") && req.method === 'PATCH'){
        const id = Number(req.url.split("/")[2]);
        const task = tasks.find(task => task.id === id);
        if(!task){
            res.writeHead(404, {"Content-Type": "application/json"});
            return res.end(JSON.stringify({ message: "Task not found" }));
        }
        tasks[id - 1].completed = !tasks[id - 1].completed;
        res.writeHead(200, {"Content-Type":"application/json"});
        res.end(JSON.stringify({message: "Task updated"}));
    }

    if(req.url.startsWith("/tasks/") && req.method === 'DELETE'){
        const id = Number(req.url.split("/")[2]);
        const task = tasks.find(task => task.id === id);
        if(!task){
            res.writeHead(404, {"Content-Type": "application/json"});
            return res.end(JSON.stringify({ message: "Task not found" }));
        }
        tasks.splice(id - 1, 1);
        res.writeHead(200, {"Content-Type":"application/json"});
        res.end(JSON.stringify({message: "Task deleted"}));
    }
})

server.listen(3000, ()=>{
    console.log("Server is listening on port 3000");
})

