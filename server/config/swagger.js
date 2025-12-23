const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "BookMyShow Clone API",
            version: "1.0.0",
            description: "API documentation for BookMyShow Clone application",
            contact: {
                name: "API Support",
            },
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "64abc123def456" },
                        name: { type: "string", example: "John Doe" },
                        email: { type: "string", example: "john@example.com" },
                        isAdmin: { type: "boolean", example: false },
                    },
                },
                Movie: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "64abc123def456" },
                        title: { type: "string", example: "Inception" },
                        description: { type: "string", example: "A thief who steals corporate secrets..." },
                        duration: { type: "number", example: 148 },
                        genre: { type: "string", example: "Sci-Fi" },
                        language: { type: "string", example: "English" },
                        releaseDate: { type: "string", format: "date", example: "2024-12-01" },
                        poster: { type: "string", example: "https://example.com/poster.jpg" },
                    },
                },
                Theatre: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "64abc123def456" },
                        name: { type: "string", example: "PVR Cinemas" },
                        address: { type: "string", example: "123 Main Street, Mumbai" },
                        phone: { type: "string", example: "9876543210" },
                        email: { type: "string", example: "pvr@example.com" },
                        owner: { type: "string", example: "64abc123def456" },
                        isActive: { type: "boolean", example: true },
                    },
                },
                Show: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "64abc123def456" },
                        name: { type: "string", example: "Morning Show" },
                        date: { type: "string", format: "date", example: "2024-12-20" },
                        time: { type: "string", example: "10:00 AM" },
                        movie: { type: "string", example: "64abc123def456" },
                        theatre: { type: "string", example: "64abc123def456" },
                        ticketPrice: { type: "number", example: 250 },
                        totalSeats: { type: "number", example: 100 },
                        bookedSeats: { type: "array", items: { type: "number" }, example: [1, 2, 5, 10] },
                    },
                },
                Booking: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "64abc123def456" },
                        user: { type: "string", example: "64abc123def456" },
                        show: { type: "string", example: "64abc123def456" },
                        seats: { type: "array", items: { type: "number" }, example: [15, 16, 17] },
                        transactionId: { type: "string", example: "TXN_123456789" },
                        status: { type: "string", enum: ["pending", "confirmed", "cancelled"], example: "confirmed" },
                    },
                },
                ApiResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        message: { type: "string", example: "Operation successful" },
                        data: { type: "object" },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string", example: "Error message" },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./routes/*.js", "./swagger-docs.js"],
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs,
};
