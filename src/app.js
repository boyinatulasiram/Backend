import movies from './data.js';
import {searchByTitle, advancedSearch} from './search.js';

const output = searchByTitle(movies, "    ");

const output2 = advancedSearch(movies, {title: "ring",genres: "", actors: ""});


console.log(output2);
