const {
  addTheatre,
  getAllTheatresByOwnerId,
  updateTheatre,
  deleteTheatre,
  getAllTheatres,
  addShowToTheatre,
  deleteShow,
  getAllShowsByTheatre,
  getAllTheatresByMovie,
  getShowById,
} = require("../controller/theatreController");

const { validateJWTToken, validateAdmin } = require("../middleware/authmiddleware");
const theatreRouter = require("express").Router();

theatreRouter.post("/add-theatre", validateAdmin, addTheatre);
theatreRouter.post("/update-theatre", validateAdmin, updateTheatre);
theatreRouter.post("/delete-theatre", validateAdmin, deleteTheatre);
theatreRouter.get("/get-all-theatres", validateAdmin, getAllTheatres);
theatreRouter.post("/add-shows", validateAdmin, addShowToTheatre);
theatreRouter.post("/delete-show", validateAdmin, deleteShow);
theatreRouter.post(
  "/get-all-theatres-by-owner",
  validateAdmin,
  getAllTheatresByOwnerId
);
theatreRouter.post(
  "/get-all-shows-by-theatre",
  validateJWTToken,
  getAllShowsByTheatre
);
theatreRouter.post(
  "/get-all-theatres-by-movie",
  validateJWTToken,
  getAllTheatresByMovie
);
theatreRouter.post("/get-show-by-id", validateJWTToken, getShowById);

module.exports = theatreRouter;

