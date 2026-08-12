import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017');

await client.connect();

const db = client.db("movieDB");
const movies = db.collection("movies");

const result = await movies.insertOne({
    title: "Inception",
    year: 2010,
    rating: 8.8
});

console.log(`New movie inserted with the following id: ${result.insertedId}`);

const allMovies = await movies.find().toArray();
console.log("All movies in the collection:");
console.log(allMovies);

