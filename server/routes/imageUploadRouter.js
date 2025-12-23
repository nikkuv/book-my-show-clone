const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { validateAdmin } = require("../middleware/authmiddleware");

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer (Temp storage)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });

// Upload Endpoint
router.post("/upload-movie-poster", validateAdmin, upload.single("image"), async (req, res) => {
    try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "bookmyshow-clone",
        });

        const fs = require("fs");
        fs.unlinkSync(req.file.path); // DELETE the temp file

        res.send({
            success: true,
            message: "Image Uploaded Successfully",
            data: result.secure_url,
        });
    } catch (err) {
        res.send({
            success: false,
            message: err.message,
        });
    }
});

module.exports = router;
