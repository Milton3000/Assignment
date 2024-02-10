import mongoose from "mongoose";
import promptSync from "prompt-sync";

const db = mongoose.connection;

await mongoose.connect("mongodb://127.0.0.1:27017/DB-Milton");

const movieSchema = mongoose.Schema({
    title: String,
    director: String,
    releaseYear: Number,
    genres: [String],
    ratings: [Number],
    cast: [String]
});

const movieModel = mongoose.model("Movies", movieSchema);

const prompt = promptSync();

async function displayMenu() {
    console.log("\n\x1b[33m=======================================");
    console.log("            Movie Database             ");
    console.log("=======================================\x1b[0m\n");
    console.log("\n\x1b[33mChoose a number (1-5) and press 'Enter'\n");
    console.log("\x1b[32m1. View all movies\x1b[0m");
    console.log("\x1b[36m2. Add a new movie\x1b[0m");
    console.log("\x1b[35m3. Update a movie\x1b[0m");
    console.log("\x1b[31m4. Delete a movie\x1b[0m");
    console.log("\x1b[34m5. Exit\x1b[0m\n");
}

async function viewAllMovies() {
    const movies = await movieModel.find();
    console.log("\n\x1b[33mAll movies:\x1b[0m\n");
    movies.forEach(movie => {
        console.log(`\x1b[32mTitle:\x1b[0m ${movie.title}`);
        console.log(`\x1b[32mDirector:\x1b[0m ${movie.director}`);
        console.log(`\x1b[32mRelease Year:\x1b[0m ${movie.releaseYear}`);
        console.log(`\x1b[32mGenres:\x1b[0m ${movie.genres.join(", ")}`);
        console.log(`\x1b[32mRatings:\x1b[0m ${movie.ratings.join(", ")}`);
        console.log(`\x1b[32mCast:\x1b[0m ${movie.cast.join(", ")}\n`);
    });
}

async function addNewMovie() {
    console.log("\n");
    const title = prompt("\x1b[36mEnter movie title:\x1b[0m ");
    const director = prompt("\x1b[36mEnter movie director:\x1b[0m ");
    const releaseYearInput = prompt("\x1b[36mEnter movie release year (optional, press 'Enter' to skip):\x1b[0m ");
    const releaseYear = releaseYearInput ? parseInt(releaseYearInput) : undefined;
    const genresInput = prompt("\x1b[36mEnter movie genres separated by commas (optional, press 'Enter' to skip):\x1b[0m ");
    const genres = genresInput ? genresInput.split(",") : [];
    const ratingsInput = prompt("\x1b[36mEnter movie ratings with a decimal point '.' separated by commas (optional, press 'Enter' to skip):\x1b[0m ");
    const ratings = ratingsInput ? ratingsInput.split(",").map(Number) : [];
    const castInput = prompt("\x1b[36mEnter movie cast separated by commas (optional, press 'Enter' to skip):\x1b[0m ");
    const cast = castInput ? castInput.split(",") : [];
    
    const newMovie = new movieModel({
        title,
        director,
        releaseYear,
        genres,
        ratings,
        cast
    });

    await newMovie.save();
    console.log("\n\x1b[32mNew movie added successfully.\x1b[0m\n");
}

async function updateMovie() {
    const titleToUpdate = prompt("\x1b[35mEnter the title of the movie you want to update:\x1b[0m ");
    const movieToUpdate = await movieModel.findOne({ title: titleToUpdate });

    if (!movieToUpdate) {
        console.log("\n\x1b[31mMovie not found. Please check spelling and try again.\x1b[0m\n");
        return;
    }

    console.log("\n\x1b[35mEnter new data for the movie:\x1b[0m");
    console.log("\x1b[33mLeave fields empty and press 'Enter' to keep existing values.\x1b[0m");
    console.log("\x1b[33mThe original information is showcased within brackets [].\x1b[0m\n");
    console.log("\x1b[36mTo add or remove elements from genres, ratings, or cast, rewrite the entire list separated by commas.\x1b[0m");
    console.log("\x1b[36mFor example: To add \x1b[34m'Drama'\x1b[36m to genres: \x1b[34mAction\x1b[36m, \x1b[34mFantasy\x1b[36m, \x1b[34mAdventure - \x1b[36mWrite: \x1b[34mAction, Fantasy, Adventure, Drama\x1b[0m");
    console.log("\x1b[36mTo remove \x1b[34m'Adventure'\x1b[36m from genres, \x1b[36mwrite: \x1b[34mAction\x1b[36m, \x1b[34mFantasy\x1b[0m\n\x1b[0m");
    
    
    
    
    const newTitle = await getInput("\x1b[35mNew title\x1b[0m", movieToUpdate.title);
    const newDirector = await getInput("\x1b[35mNew director\x1b[0m", movieToUpdate.director);
    const newReleaseYear = await getInput("\x1b[35mNew release year\x1b[0m", movieToUpdate.releaseYear ? movieToUpdate.releaseYear.toString() : '');
    const newGenres = await getInput("\x1b[35mNew genres\x1b[0m", movieToUpdate.genres.join(", "));
    const newRatings = await getInput("\x1b[35mNew ratings\x1b[0m", movieToUpdate.ratings.join(", "));
    const newCast = await getInput("\x1b[35mNew cast\x1b[0m", movieToUpdate.cast.join(", "));

    movieToUpdate.title = newTitle;
    movieToUpdate.director = newDirector;
    movieToUpdate.releaseYear = newReleaseYear ? parseInt(newReleaseYear) : undefined;
    movieToUpdate.genres = newGenres ? newGenres.split(",") : [];
    movieToUpdate.ratings = newRatings ? newRatings.split(",").map(Number) : [];
    movieToUpdate.cast = newCast ? newCast.split(",").map(name => name.trim()) : [];

    await movieToUpdate.save();
    console.log("\n\x1b[32mMovie updated successfully.\x1b[0m\n");
}

async function getInput(promptMessage, defaultValue) {
    const input = prompt(`[${defaultValue}] - ${promptMessage}: `);
    return input.trim() || defaultValue;
}

async function deleteMovie() {
    const titleToDelete = prompt("\x1b[31mEnter the title of the movie you want to delete:\x1b[0m ");
    const movieToDelete = await movieModel.findOne({ title: titleToDelete });

    if (!movieToDelete) {
        console.log("\n\x1b[31mMovie not found. Please check spelling and try again.\x1b[0m\n");
        return;
    }

    const confirmDelete = prompt(`\n\x1b[31mAre you sure you want to delete the movie "${movieToDelete.title}"? (Y/N):\x1b[0m `);

    if (confirmDelete.toUpperCase() === 'Y') {
        const result = await movieModel.deleteOne({ title: titleToDelete });
        if (result.deletedCount === 0) {
            console.log("\n\x1b[31mError occurred while deleting the movie.\x1b[0m\n");
        } else {
            console.log("\n\x1b[32mMovie deleted successfully.\x1b[0m\n");
        }
    } else {
        console.log("\n\x1b[33mDeletion canceled.\x1b[0m\n");
    }
}

async function main() {
    let choice = "";
    while (choice !== "5") {
        await displayMenu();
        choice = prompt("\x1b[33mEnter your choice:\x1b[0m ");
        switch (choice) {
            case "1":
                await viewAllMovies();
                break;
            case "2":
                await addNewMovie();
                break;
            case "3":
                await updateMovie();
                break;
            case "4":
                await deleteMovie();
                break;
            case "5":
                console.log("\n\x1b[32mExiting...\x1b[0m\n");
                break;
            default:
                console.log("\n\x1b[31mInvalid choice. Please enter a number from 1 to 5.\x1b[0m\n");
        }
    }
    mongoose.disconnect();
}

main();
