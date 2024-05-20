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

const { validateJWTToken } = require("../middleware/authmiddleware");
const theatreRouter = require("express").Router();

theatreRouter.post("/add-theatre", validateJWTToken, addTheatre);
theatreRouter.post("/update-theatre", validateJWTToken, updateTheatre);
theatreRouter.post("/delete-theatre", validateJWTToken, deleteTheatre);
theatreRouter.get("/get-all-theatres", validateJWTToken, getAllTheatres);
theatreRouter.post("/add-shows", validateJWTToken, addShowToTheatre);
theatreRouter.post("/delete-show", validateJWTToken, deleteShow);
theatreRouter.post(
  "/get-all-theatres-by-owner",
  validateJWTToken,
  getAllTheatresByOwnerId
);
theatreRouter.post(
  "/get-all-shows-by-theatre",
  validateJWTToken,
  getAllShowsByTheatre
);

module.exports = theatreRouter;
