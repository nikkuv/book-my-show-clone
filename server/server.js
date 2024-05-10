const express = require("express");
require('dotenv').config();
const userRouter = require("./routes/userRouter");
const app = express();

const dbConfig = require("./config/dbConfig");
app.use(express.json());

app.use("/app/v1/users", userRouter);

app.get('/', (req, res) => {
    res.send("Hello World");
})

app.listen(process.env.PORT, () => {
    console.log('server is running on port ' + process.env.PORT);
})
