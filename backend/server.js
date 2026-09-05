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
const SomaticStressRecord = require("./models/SomaticStressRecord");
const PHQ4Assessment = require("./models/PHQ4Assessment");
const InterventionLibrary = require("./models/InterventionLibrary");
const Intervention = require("./models/Intervention");
const ShiftCheckin = require("./models/ShiftCheckin");
const PostShiftDecompression = require("./models/PostShiftDecompression");

const authenticateToken = require("./middleware/authMiddleware");

const app=express()

app.use(cors())
app.use(express.json())

const PORT = 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas!");

    app.listen(PORT, () => {
      console.log(
        `Sukoon backend running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error
    );
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

// Save somatic stress record
app.post("/api/somatic-stress", authenticateToken, async (req, res) => {
  try {
    const { symptoms, severity } = req.body;

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        message: "At least one body symptom is required",
      });
    }

    if (
      typeof severity !== "number" ||
      severity < 1 ||
      severity > 10
    ) {
      return res.status(400).json({
        message: "Severity must be between 1 and 10",
      });
    }

    const record = await SomaticStressRecord.create({
      userId: req.user.userId,
      symptoms,
      severity,
    });

    res.status(201).json({
      message: "Somatic stress record saved successfully",
      record,
    });
  } catch (error) {
    console.error(
      "Somatic stress error:",
      error
    );

    res.status(500).json({
      message: "Error saving somatic stress record",
    });
  }
});

// PHQ-4 Assessment
app.post("/api/phq4", authenticateToken, async (req, res) => {
  try {
    const { responses } = req.body;

    // Validate responses
    if (
      !Array.isArray(responses) ||
      responses.length !== 4 ||
      responses.some(
        (response) =>
          !Number.isInteger(response) ||
          response < 0 ||
          response > 3
      )
    ) {
      return res.status(400).json({
        message:
          "PHQ-4 requires exactly 4 responses, each between 0 and 3.",
      });
    }

    // Calculate subscale scores
    const anxietyScore = responses[0] + responses[1];

    const depressionScore = responses[2] + responses[3];

    // Calculate total score
    const score = responses.reduce(
      (total, response) => total + response,
      0
    );

    // Determine interpretation
    let interpretation;

    if (score <= 2) {
      interpretation = "normal";
    } else if (score <= 5) {
      interpretation = "mild";
    } else if (score <= 8) {
      interpretation = "moderate";
    } else {
      interpretation = "severe";
    }

    // Save assessment
    const assessment = await PHQ4Assessment.create({
      userId: req.user.userId,
      responses,
      anxietyScore,
      depressionScore,
      score,
      interpretation,
    });

    res.status(201).json({
      message: "PHQ-4 assessment saved successfully",
      assessment,
    });
  } catch (error) {
    console.error("PHQ-4 error:", error);

    res.status(500).json({
      message: "Error saving PHQ-4 assessment",
    });
  }
});

// Get PHQ-4 assessment history
app.get("/api/phq4", authenticateToken, async (req, res) => {
  try {
    const assessments = await PHQ4Assessment.find({
      userId: req.user.userId,
    }).sort({ completedAt: -1 });

    res.status(200).json({
      assessments,
    });
  } catch (error) {
    console.error("PHQ-4 history error:", error);

    res.status(500).json({
      message: "Error fetching PHQ-4 assessment history",
    });
  }
});

// Get Intervention Library
app.get("/api/interventions", authenticateToken, async (req, res) => {
  try {
    const interventions = await InterventionLibrary.find({
      active: true,
    }).sort({ title: 1 });

    res.status(200).json({
      interventions,
    });
  } catch (error) {
    console.error("Intervention library error:", error);

    res.status(500).json({
      message: "Error fetching intervention library",
    });
  }
});

// Start an Intervention
app.post("/api/interventions/start", authenticateToken, async (req, res) => {
  try {
    const { interventionId } = req.body;

    if (!interventionId) {
      return res.status(400).json({
        message: "Intervention ID is required",
      });
    }

    const intervention = await InterventionLibrary.findOne({
      _id: interventionId,
      active: true,
    });

    if (!intervention) {
      return res.status(404).json({
        message: "Intervention not found",
      });
    }

    const userIntervention = await Intervention.create({
      userId: req.user.userId,
      interventionId: intervention._id,
      type: intervention.type,
      title: intervention.title,
      reason: "Started by user",
      status: "started",
      startedAt: new Date(),
    });

    res.status(201).json({
      message: "Intervention started successfully",
      intervention: userIntervention,
    });
  } catch (error) {
    console.error("Start intervention error:", error);

    res.status(500).json({
      message: "Error starting intervention",
    });
  }
});

// Complete an Intervention
app.patch(
  "/api/interventions/:id/complete",
  authenticateToken,
  async (req, res) => {
    try {
      const intervention = await Intervention.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      });

      if (!intervention) {
        return res.status(404).json({
          message: "User intervention not found",
        });
      }

      intervention.status = "completed";
      intervention.completedAt = new Date();

      await intervention.save();

      res.status(200).json({
        message: "Intervention completed successfully",
        intervention,
      });
    } catch (error) {
      console.error("Complete intervention error:", error);

      res.status(500).json({
        message: "Error completing intervention",
      });
    }
  }
);

app.post(
  "/api/shift-checkins",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        shiftType,
        mood,
        energyLevel,
        stressLevel,
        emotionalReadiness,
        note,
      } = req.body;

      if (
        !shiftType ||
        !mood ||
        !mood.emotion ||
        mood.intensity === undefined ||
        energyLevel === undefined ||
        stressLevel === undefined ||
        emotionalReadiness === undefined
      ) {
        return res.status(400).json({
          message: "All required shift check-in fields must be provided.",
        });
      }

      const checkin = await ShiftCheckin.create({
        userId: req.user.userId,

        shiftType,

        mood: {
          emotion: mood.emotion,
          intensity: mood.intensity,
        },

        energyLevel,
        stressLevel,
        emotionalReadiness,

        note: note || "",
      });

      res.status(201).json({
        message: "Shift check-in saved successfully.",
        checkin,
      });
    } catch (error) {
      console.error("Shift check-in error:", error);

      res.status(500).json({
        message: "Error saving shift check-in.",
      });
    }
  }
);

app.get(
  "/api/shift-checkins",
  authenticateToken,
  async (req, res) => {
    try {
      const checkins = await ShiftCheckin.find({
        userId: req.user.userId,
      }).sort({
        checkInTime: -1,
      });

      res.status(200).json({
        checkins,
      });
    } catch (error) {
      console.error("Shift check-in history error:", error);

      res.status(500).json({
        message: "Error fetching shift check-in history.",
      });
    }
  }
);

app.post(
  "/api/post-shift-decompression",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        shiftType,
        emotionalState,
        stressLevel,
        energyLevel,
        selectedActivity,
        activityDuration,
        reflection,
        voiceTranscript,
      } = req.body;

      if (
        !shiftType ||
        !emotionalState ||
        !emotionalState.mood ||
        emotionalState.intensity === undefined ||
        stressLevel === undefined ||
        energyLevel === undefined
      ) {
        return res.status(400).json({
          message:
            "All required post-shift fields must be provided.",
        });
      }

      const decompression =
        await PostShiftDecompression.create({
          userId: req.user.userId,

          shiftType,

          emotionalState: {
            mood: emotionalState.mood,
            intensity: emotionalState.intensity,
          },

          stressLevel,
          energyLevel,

          selectedActivity:
            selectedActivity || "none",

          activityDuration:
            activityDuration || 0,

          reflection:
            reflection || "",

          voiceTranscript:
            voiceTranscript || "",

          startedAt: new Date(),
        });

      res.status(201).json({
        message:
          "Post-shift decompression started successfully.",
        decompression,
      });
    } catch (error) {
      console.error(
        "Post-shift decompression error:",
        error
      );

      res.status(500).json({
        message:
          "Error saving post-shift decompression.",
      });
    }
  }
);

app.get(
  "/api/post-shift-decompression",
  authenticateToken,
  async (req, res) => {
    try {
      const decompressions =
        await PostShiftDecompression.find({
          userId: req.user.userId,
        }).sort({
          startedAt: -1,
        });

      res.status(200).json({
        decompressions,
      });
    } catch (error) {
      console.error(
        "Post-shift decompression history error:",
        error
      );

      res.status(500).json({
        message:
          "Error fetching post-shift decompression history.",
      });
    }
  }
);

app.patch(
  "/api/post-shift-decompression/:id/complete",
  authenticateToken,
  async (req, res) => {
    try {
      const decompression =
        await PostShiftDecompression.findOne({
          _id: req.params.id,
          userId: req.user.userId,
        });

      if (!decompression) {
        return res.status(404).json({
          message:
            "Post-shift decompression not found.",
        });
      }

      decompression.completedAt = new Date();

      await decompression.save();

      res.status(200).json({
        message:
          "Post-shift decompression completed successfully.",
        decompression,
      });
    } catch (error) {
      console.error(
        "Complete decompression error:",
        error
      );

      res.status(500).json({
        message:
          "Error completing post-shift decompression.",
      });
    }
  }
);