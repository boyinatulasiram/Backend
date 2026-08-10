import movies from './data.js';
function searchByTitle(movies,title){
    const normalizedTitle = title.trim().toLowerCase();
    if(normalizedTitle === ""){
        return [];
    }
    const results = [];
    for (let movie of movies){
        if(movie.title.toLowerCase().includes(normalizedTitle)){
            results.push(movie);
        }
    }
    return results;
}


const output = searchByTitle(movies, "    ");
console.log(output);
