const express = require("express");
const cors = require('cors');
require('dotenv').config();
const userRouter = require("./routes/userRouter");
const movieRouter = require("./routes/movieRouter");
const theatreRouter = require("./routes/theatreRouter");
const app = express();

app.use(cors());

const dbConfig = require("./config/dbConfig");
app.use(express.json());

app.use("/app/v1/users", userRouter);
app.use("/app/v1/users/admin", movieRouter);
app.use("/app/v1/users/theatres", theatreRouter);

app.get('/', (req, res) => {
    res.send("Hello World");
})

app.listen(process.env.PORT, () => {
    console.log('server is running on port ' + process.env.PORT);
})
