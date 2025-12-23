const {
  AddMovie,
  getAllMovies,
  updateMovies,
  deleteMovie,
  getMovieById,
} = require("../controller/movieController");
const { validateJWTToken, validateAdmin } = require("../middleware/authmiddleware");
const movieRouter = require("express").Router();

movieRouter.get("/get-all-movies", validateJWTToken, getAllMovies);
movieRouter.post("/add-movie", validateAdmin, AddMovie);
movieRouter.patch("/update-movie", validateAdmin, updateMovies);
movieRouter.post("/delete-movie", validateAdmin, deleteMovie);
movieRouter.get("/get-movie-by-id/:id", validateJWTToken, getMovieById);

module.exports = movieRouter;
