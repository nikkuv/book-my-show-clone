const {
  AddMovie,
  getAllMovies,
  updateMovies,
  deleteMovie,
  getMovieById,
} = require("../controller/movieController");
const { validateJWTToken } = require("../middleware/authmiddleware");
const movieRouter = require("express").Router();

movieRouter.get("/getAllMovies", validateJWTToken, getAllMovies);
movieRouter.post("/addMovie", validateJWTToken, AddMovie);
movieRouter.patch("/updateMovie", validateJWTToken, updateMovies);
movieRouter.post("/deleteMovie", validateJWTToken, deleteMovie);
movieRouter.get("/getMovieById/:id", validateJWTToken, getMovieById);

module.exports = movieRouter;
