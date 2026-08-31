const express=require('express')
const mongoose=require('mongoose')
const cors=require('cors')
const dotenv=require('dotenv')

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

 
dotenv.config()

const User = require("./models/User");
const MoodRecord = require("./models/MoodRecord");
const EmotionalGranularity = require("./models/EmotionalGranularity");

const authenticateToken = require("./middleware/authMiddleware");

const app=express()

app.use(cors())
app.use(express.json())

mongoose
.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log("Connected to MongoDB Atlas!")
})
.catch((error)=>{
    console.error("MongoDB connection error:",error);
});

app.get('/',(req,res)=>{
    res.json({
        message:"Sukoon Backend is running successfully!"
    })
})

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);

    res.status(500).json({
      message: "Error fetching users",
    });
  }
});

// Register a new user
app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      profession,
      specialization,
      organization,
      preferredLanguage,
    } = req.body;

    // Check required fields
    if (!fullName || !email || !password || !profession) {
      return res.status(400).json({
        message:
          "Full name, email, password, and profession are required",
      });
    }

    // Check whether user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      email,
      passwordHash,
      profession,
      specialization: specialization || "",
      organization: organization || "",
      preferredLanguage: preferredLanguage || "English",
    });

    // Send safe user data back
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profession: user.profession,
        specialization: user.specialization,
        organization: user.organization,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Error registering user",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Send token and user data back
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profession: user.profession,
        specialization: user.specialization,
        organization: user.organization,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Error logging in",
    });
  }
});
    
// Save a mood check-in
app.post("/api/moods", authenticateToken, async (req, res) => {
  try {
    const { mood, intensity } = req.body;

    // Validate mood
    if (!mood) {
      return res.status(400).json({
        message: "Mood is required",
      });
    }

    // Validate intensity
    if (
      intensity === undefined ||
      intensity < 1 ||
      intensity > 10
    ) {
      return res.status(400).json({
        message: "Intensity must be between 1 and 10",
      });
    }

    const moodRecord = await MoodRecord.create({
      userId: req.user.userId,
      mood,
      intensity,
    });

    res.status(201).json({
      message: "Mood check-in saved successfully",
      moodRecord,
    });
  } catch (error) {
    console.error("Mood check-in error:", error);

    res.status(500).json({
      message: "Error saving mood check-in",
    });
  }
});

// Save an emotional granularity check-in
app.post(
  "/api/emotional-granularity",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        primaryEmotion,
        secondaryEmotion,
        specificEmotion,
        intensity,
      } = req.body;

      // Validate emotions
      if (
        !primaryEmotion ||
        !secondaryEmotion ||
        !specificEmotion
      ) {
        return res.status(400).json({
          message: "All emotion levels are required",
        });
      }

      // Validate intensity
      if (
        intensity === undefined ||
        intensity < 1 ||
        intensity > 10
      ) {
        return res.status(400).json({
          message: "Intensity must be between 1 and 10",
        });
      }

      const record = await EmotionalGranularity.create({
        userId: req.user.userId,
        primaryEmotion,
        secondaryEmotion,
        specificEmotion,
        intensity,
        source: "self_reported",
      });

      res.status(201).json({
        message: "Emotional granularity record saved successfully",
        record,
      });
    } catch (error) {
      console.error(
        "Emotional granularity error:",
        error
      );

      res.status(500).json({
        message: "Error saving emotional granularity record",
      });
    }
  }
);

const PORT=5000;
app.listen(PORT,()=>{
    console.log(`Sukoon backend running on http://localhost:${PORT}`)
})