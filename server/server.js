const express = require("express");
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const userRouter = require("./routes/userRouter");
const movieRouter = require("./routes/movieRouter");
const theatreRouter = require("./routes/theatreRouter");
const bookingRouter = require("./routes/bookingRouter");
const imageUploadRouter = require("./routes/imageUploadRouter");
const { swaggerUi, specs } = require("./config/swagger");
require("./swagger-docs"); // Load swagger documentation
const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    // TODO: read about this parameter for CORS
    credentials: true
}));
app.use(cookieParser());

const dbConfig = require("./config/dbConfig");
app.use(express.json());
app.use(express.static("public")); // Serve static files

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "BookMyShow Clone API Documentation"
}));

// API Routes
app.use("/app/v1/users", userRouter);
app.use("/app/v1/users/admin", movieRouter);
app.use("/app/v1/users/theatres", theatreRouter);
app.use("/app/v1/bookings", bookingRouter);
app.use("/app/v1/common", imageUploadRouter);

app.get('/', (req, res) => {
    res.send(`
        <h1>BookMyShow Clone API</h1>
        <p>Welcome to the API server!</p>
        <a href="/api-docs">📚 View API Documentation (Swagger)</a>
    `);
})

app.listen(process.env.PORT, () => {
    console.log('Server is running on port ' + process.env.PORT);
    console.log('API Documentation: http://localhost:' + process.env.PORT + '/api-docs');
})
