import express from "express";
import {connect, mongoose} from "mongoose";
import Movie from "./models/movie.js";


const app = express();

app.use(express.json());

//db Connnection
async function connectToDatabase() {
    try {
        await mongoose.connect("mongodb://localhost:27017/moviesDB");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

connectToDatabase();

//get all movies

app.get("/movies", async(req, res)=>{
    const movies = await Movie.find();
    if(movies.length === 0){
        res.status(200).json({message: "No movies found"});
        return;
    }
    else{
        res.status(200).json(movies);
    }
});

//movie by title

app.get("/movies/:title", async(req, res)=>{
    const title = req.params.title;

    const movie = await Movie.findOne({title: title});
    if(!movie){
        res.status(404).json({message: "Movie not found"});
        return;
    }
    else{
        res.status(200).json(movie);
    }
});

//create a new task

app.post("/movies", async(req,res)=>{
    const {title, rating, year} = req.body;
    const newMovie = new Movie({title, rating, year});
    await newMovie.save();
    res.status(201).json({message: "Movie created"});
});

//update movie

app.patch("/movies/:title", async(req,res)=>{
    const title = req.params.title;
    const {rating, year} = req.body;
    const movie = await Movie.findOne({title: title});
    if(!movie){
        res.status(404).json({message: "Movie not found"});
        return;
    }
    movie.rating = rating || movie.rating;
    movie.year = year || movie.year;
    await movie.save();
    res.status(200).json({message: "Movie updated"});
});

//delete movie

app.delete("/movies/:title", async(req,res)=>{  
    const title = req.params.title;
    const movie = await Movie.findOne({title: title});
    if(!movie){
        res.status(404).json({message: "Movie not found"});
        return;
    }
    let dc = await Movie.deleteOne({title: title});
    if(dc.deletedCount === 1){
        res.status(200).json({message: "Movie deleted"});
    }
    else{
        res.status(500).json({message: "Error deleting movie"});
    }
}
);

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});


