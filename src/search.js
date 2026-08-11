export function searchByTitle(movies,title){
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

export const advancedSearch = function(movies, params){
    let {title,genres,actors,rating,year} = params;
    if(typeof title === "string" || title === undefined){
       if(typeof title === "string") title = title.trim().toLowerCase();
    } else {
        return [];
    }
    if(typeof genres === "string"  || genres === undefined){
        if(typeof genres === "string") genres = genres.trim().toLowerCase();
    } else{
        return [];
    }
    if(typeof actors === "string" || actors === undefined){
        if(typeof actors === "string") actors = actors.trim().toLowerCase();
    } else{
        return [];
    }
    if(typeof rating === "number" && rating >= 0 && rating <= 10 || rating === undefined){
       ;
    } else {
        return [];
    }
    if(typeof year === "number" && year >= 1888 && year <= new Date().getFullYear() || year === undefined){
       ;
    } else {
        return [];
    }

    // const results = [];
    const results = movies.filter(movie =>
    (!title || movie.title.toLowerCase().includes(title)) &&
    (!genres || movie.genres.some(g => g.toLowerCase() === genres)) &&
    (!actors || movie.actors.some(a => a.toLowerCase().includes(actors))) &&
     ( rating === undefined || movie.rating === rating) &&
    (year === undefined || movie.year === year)
    );

    return results;
}

// module.exports = {searchByTitle};