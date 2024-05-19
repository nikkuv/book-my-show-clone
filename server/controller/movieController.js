const movieModel = require("../modal/movieModal");

const AddMovie = async (req, res) => {
  try {
    const newMovie = new movieModel(req.body);
    await newMovie.save();
    res.send({
      success: true,
      message: "Movie Added SuccessFully",
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

const getAllMovies = async (req, res) => {
  try {
    const movies = await movieModel.find();
    res.send({
      success: true,
      message: "Movie Fetched SuccessFully",
      data: movies,
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

const deleteMovie = async (req, res) => {
  try {
    await movieModel.findByIdAndDelete(req.body._id);
    res.send({
      success: true,
      message: "Movie Deleted SuccessFully",
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

const updateMovies = async (req, res) => {
  try {
    await movieModel.findByIdAndUpdate(req.body._id, req.body);
    res.send({
      success: true,
      message: "Movie Updated Successfully",
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

const getMovieById = async (req, res) => {
  try {
    const movie = await movieModel.findById(req.params.id);
    res.send({
      success: true,
      message: "Movie Fetched Successfully",
      data: movie,
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  AddMovie,
  getAllMovies,
  deleteMovie,
  updateMovies,
  getMovieById,
};
