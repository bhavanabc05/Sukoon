const express=require('express')
const mongoose=require('mongoose')
const cors=require('cors')
const dotenv=require('dotenv')

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Groq = require("groq-sdk");
 
dotenv.config()
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const User = require("./models/User");
const MoodRecord = require("./models/MoodRecord");
const EmotionalGranularity = require("./models/EmotionalGranularity");
const SomaticStressRecord = require("./models/SomaticStressRecord");
const PHQ4Assessment = require("./models/PHQ4Assessment");
const InterventionLibrary = require("./models/InterventionLibrary");
const Intervention = require("./models/Intervention");
const ShiftCheckin = require("./models/ShiftCheckin");
const PostShiftDecompression = require("./models/PostShiftDecompression");
const GuidedReflection = require("./models/GuidedReflection");
const JournalEntry = require("./models/JournalEntry");
const Reminder = require("./models/Reminder");
const TextEmotionRecord = require("./models/TextEmotionRecord");
const AudioEmotionRecord = require("./models/AudioEmotionRecord");
const VideoEmotionRecord = require("./models/VideoEmotionRecord");
const ChatMessage = require("./models/ChatMessage");
const ChatConversation =require("./models/ChatConversation")
const CommunityPost = require("./models/CommunityPost");
const CommunityComment = require("./models/CommunityComment");
const Challenge = require("./models/Challenge");
const ChallengeParticipation = require("./models/ChallengeParticipation");
const ChallengeActivity = require("./models/ChallengeActivity");
const Resource = require("./models/Resource");

const authenticateToken = require("./middleware/authMiddleware");

const app=express()

app.use(cors())
app.use(express.json())

// ==================================================
// SUKOON PERSONALIZATION CONTEXT
// ==================================================

async function getUserWellbeingContext(userId) {
  try {
    const [
      recentMood,
      recentEmotion,
      recentStress,
      recentShift,
      recentPostShift,
      recentAudio,
      recentVideo,
      recentJournal,
    ] = await Promise.all([
      MoodRecord.findOne({ userId })
        .sort({ timestamp: -1 })
        .lean(),

      EmotionalGranularity.findOne({ userId })
        .sort({ timestamp: -1 })
        .lean(),

      SomaticStressRecord.findOne({ userId })
        .sort({ timestamp: -1 })
        .lean(),

      ShiftCheckin.findOne({ userId })
        .sort({ checkInTime: -1 })
        .lean(),

      PostShiftDecompression.findOne({ userId })
        .sort({ createdAt: -1 })
        .lean(),

      AudioEmotionRecord.findOne({ userId })
        .sort({ createdAt: -1 })
        .lean(),

      VideoEmotionRecord.findOne({ userId })
        .sort({ createdAt: -1 })
        .lean(),

      JournalEntry.findOne({ userId })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return {
      recentMood: recentMood
        ? {
            mood: recentMood.mood,
            intensity: recentMood.intensity,
          }
        : null,

      recentEmotion: recentEmotion
        ? {
            primary: recentEmotion.primaryEmotion,
            secondary: recentEmotion.secondaryEmotion,
            specific: recentEmotion.specificEmotion,
            intensity: recentEmotion.intensity,
          }
        : null,

      recentStress: recentStress
        ? {
            symptoms: recentStress.symptoms,
            severity: recentStress.severity,
          }
        : null,

      recentShift: recentShift
        ? {
            shiftType: recentShift.shiftType,
            mood: recentShift.mood?.emotion,
            moodIntensity: recentShift.mood?.intensity,
            energyLevel: recentShift.energyLevel,
            stressLevel: recentShift.stressLevel,
            emotionalReadiness:
              recentShift.emotionalReadiness,
          }
        : null,

      recentPostShift: recentPostShift
        ? {
            shiftType: recentPostShift.shiftType,
            mood:
              recentPostShift.emotionalState?.mood,
            intensity:
              recentPostShift.emotionalState?.intensity,
            stressLevel:
              recentPostShift.stressLevel,
            energyLevel:
              recentPostShift.energyLevel,
          }
        : null,

      recentAudio: recentAudio
        ? {
            emotion: recentAudio.emotion,
            confidence: recentAudio.confidence,
          }
        : null,

      recentVideo: recentVideo
        ? {
            emotion: recentVideo.emotion,
            confidence: recentVideo.confidence,
          }
        : null,

      recentJournal: recentJournal
        ? {
            emotion: recentJournal.emotion,
            intensity:
              recentJournal.emotionIntensity,
          }
        : null,
    };
  } catch (error) {
    console.error(
      "Wellbeing context error:",
      error
    );

    return null;
  }
}

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

// ==================== PROFILE ====================

// Get current user's profile
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "fullName email profession specialization organization preferredLanguage createdAt"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Error fetching profile",
    });
  }
});

// Update current user's profile
app.put("/api/profile", authenticateToken, async (req, res) => {
  try {
    const {
      fullName,
      profession,
      specialization,
      organization,
      preferredLanguage,
    } = req.body;

    if (!fullName || !profession) {
      return res.status(400).json({
        message: "Full name and profession are required",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        fullName: fullName.trim(),
        profession: profession.trim(),
        specialization: specialization?.trim() || "",
        organization: organization?.trim() || "",
        preferredLanguage: preferredLanguage || "English",
      },
      {
        new: true,
        runValidators: true,
      }
    ).select(
      "fullName email profession specialization organization preferredLanguage createdAt"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Error updating profile",
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

    await checkMoodChallengeCompletion(req.user.userId,moodRecord.timestamp);

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
app.post("/api/emotional-granularity",
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

    // Check whether this completes a challenge task
    await checkStressAwarenessChallengeCompletion(
      req.user.userId,
      record.timestamp
    );

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
app.patch("/api/interventions/:id/complete",
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

app.post("/api/shift-checkins",
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

app.get("/api/shift-checkins",
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

async function checkPostShiftDecompressionChallengeCompletion(
  userId,
  decompressionCompletedAt
) {
  try {
    console.log("=== SHIFT DECOMPRESSION CHALLENGE CHECK ===");
    console.log("User:", userId);
    console.log("Decompression date:", decompressionCompletedAt);

    const participations = await ChallengeParticipation.find({
      userId,
      status: "active",
    });

    console.log(
      "Active challenge participations:",
      participations.length
    );

    for (const participation of participations) {
      const challenge = await Challenge.findById(
        participation.challengeId
      );

      if (!challenge || challenge.status !== "active") {
        continue;
      }

      console.log(
        "Checking challenge:",
        challenge._id,
        challenge.title,
        challenge.status
      );

      const activityDate = new Date(
        decompressionCompletedAt
      );

      const startDate = new Date(
        challenge.startDate
      );

      const endDate = new Date(
        challenge.endDate
      );

      if (
        activityDate < startDate ||
        activityDate > endDate
      ) {
        continue;
      }

      const activityDay = new Date(
        activityDate.getFullYear(),
        activityDate.getMonth(),
        activityDate.getDate()
      );

      const challengeStartDay = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );

      const challengeDay =
        Math.floor(
          (activityDay - challengeStartDay) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      if (
        challengeDay < 1 ||
        challengeDay > challenge.duration
      ) {
        continue;
      }

      const task = challenge.tasks.find(
        (item) =>
          item.day === challengeDay &&
          item.taskType === "shiftDecompression"
      );

      if (!task) {
        continue;
      }

      if (
        participation.currentDay !== challengeDay
      ) {
        continue;
      }

      const alreadyCompleted =
        await ChallengeActivity.findOne({
          challengeId: challenge._id,
          userId,
          taskId: task._id,
        });

      if (alreadyCompleted) {
        continue;
      }

      await ChallengeActivity.create({
        challengeId: challenge._id,
        userId,
        taskId: task._id,
        day: challengeDay,
        completedAt: new Date(),
      });

      if (
        !participation.completedDays.includes(
          challengeDay
        )
      ) {
        participation.completedDays.push(
          challengeDay
        );
      }

      participation.completionPercentage =
        Math.round(
          (
            participation.completedDays.length /
            challenge.duration
          ) * 100
        );

      participation.currentDay =
        challengeDay + 1 <= challenge.duration
          ? challengeDay + 1
          : challengeDay;

      if (
        participation.completionPercentage >= 100
      ) {
        participation.completionPercentage = 100;
        participation.status = "completed";
      }

      participation.lastActivityAt = new Date();

      await participation.save();

      console.log(
        `Challenge shift decompression task completed automatically for user ${userId}`
      );
    }
  } catch (error) {
    console.error(
      "Shift decompression challenge integration error:",
      error
    );
  }
}

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

      // Check whether this activity completes a challenge task
      await checkPostShiftDecompressionChallengeCompletion(
        req.user.userId,
        decompression.createdAt
      );

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

app.get("/api/post-shift-decompression",
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

app.patch("/api/post-shift-decompression/:id/complete",
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

app.post("/api/guided-reflections",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        interventionId,
        emotionalState,
        context,
        identifiedNeed,
        selectedAction,
        freeReflection,
      } = req.body;

      if (
        !interventionId ||
        !emotionalState ||
        !emotionalState.primaryEmotion ||
        !emotionalState.secondaryEmotion ||
        !emotionalState.specificEmotion ||
        emotionalState.intensity === undefined ||
        !context ||
        !identifiedNeed ||
        !selectedAction
      ) {
        return res.status(400).json({
          message:
            "All required guided reflection fields must be provided.",
        });
      }

      if (
        typeof emotionalState.intensity !== "number" ||
        emotionalState.intensity < 1 ||
        emotionalState.intensity > 10
      ) {
        return res.status(400).json({
          message: "Intensity must be between 1 and 10.",
        });
      }

      const reflection = await GuidedReflection.create({
        userId: req.user.userId,

        interventionId,

        emotionalState: {
          primaryEmotion: emotionalState.primaryEmotion,
          secondaryEmotion: emotionalState.secondaryEmotion,
          specificEmotion: emotionalState.specificEmotion,
          intensity: emotionalState.intensity,
        },

        context,

        identifiedNeed,

        selectedAction,

        freeReflection: freeReflection || "",

        completedAt: new Date(),
      });

      await checkGuidedReflectionChallengeCompletion(req.user.userId,reflection.completedAt);

      res.status(201).json({
        message: "Guided reflection saved successfully.",
        reflection,
      });
    } catch (error) {
      console.error(
        "Guided reflection error:",
        error
      );

      res.status(500).json({
        message: "Error saving guided reflection.",
      });
    }
  }
);

// ==================== JOURNAL ROUTES ====================

// Get all journal entries for the logged-in user
app.get("/api/journal", authenticateToken, async (req, res) => {
  try {
    const entries = await JournalEntry.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({ entries });
  } catch (error) {
    console.error("Journal fetch error:", error);
    res.status(500).json({
      message: "Error fetching journal entries",
    });
  }
});

// Create a new journal entry
app.post("/api/journal", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      content,
      emotion,
      emotionIntensity,
    } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Journal content is required",
      });
    }

    const journalEntry = new JournalEntry({
      userId: req.user.userId,
      title: title || "",
      content: content.trim(),
      emotion: emotion || "",
      emotionIntensity:
        emotionIntensity !== null &&
        emotionIntensity !== undefined &&
        emotionIntensity !== ""
          ? Number(emotionIntensity)
          : null,
    });

    await journalEntry.save();

await checkJournalChallengeCompletion(
  req.user.userId,
  journalEntry.createdAt
);

res.status(201).json({
      message: "Journal entry saved successfully",
      entry: journalEntry,
    });
  } catch (error) {
    console.error("Journal creation error:", error);
    res.status(500).json({
      message: "Error saving journal entry",
    });
  }
});

// Delete a journal entry
app.delete("/api/journal/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const entry = await JournalEntry.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
      });

      if (!entry) {
        return res.status(404).json({
          message: "Journal entry not found",
        });
      }

      res.status(200).json({
        message: "Journal entry deleted successfully",
      });
    } catch (error) {
      console.error("Journal deletion error:", error);
      res.status(500).json({
        message: "Error deleting journal entry",
      });
    }
  }
);

// ==================== EMOTION INSIGHTS ROUTE ====================

app.get("/api/emotion-insights", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // --------------------------------------------------
    // DATE RANGE FOR TREND DATA
    // --------------------------------------------------

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // --------------------------------------------------
    // FETCH TOTAL COUNTS + RECENT RECORDS
    // --------------------------------------------------

    const [
      totalMoodCheckins,
      totalEmotionalGranularityRecords,
      totalSomaticStressRecords,
      totalShiftCheckins,
      totalPostShiftDecompressions,
      totalJournalEntries,
      totalTextEmotionRecords,
      totalAudioEmotionRecords,
      totalVideoEmotionRecords,
      totalPHQ4Assessments,
      totalGuidedReflections,
      totalChallengeActivities,

      moods,
      emotionalGranularity,
      somaticStress,
      phq4Assessments,
      shiftCheckins,
      postShiftDecompressions,
      journalEntries,
      textEmotionRecords,
      audioEmotionRecords,
      videoEmotionRecords,
      guidedReflections,
      challengeActivities,
    ] = await Promise.all([
      // ---------------- TOTAL COUNTS ----------------

      MoodRecord.countDocuments({ userId }),

      EmotionalGranularity.countDocuments({ userId }),

      SomaticStressRecord.countDocuments({ userId }),

      ShiftCheckin.countDocuments({ userId }),

      PostShiftDecompression.countDocuments({ userId }),

      JournalEntry.countDocuments({ userId }),

      TextEmotionRecord.countDocuments({ userId }),

      AudioEmotionRecord.countDocuments({ userId }),

      VideoEmotionRecord.countDocuments({ userId }),

      PHQ4Assessment.countDocuments({ userId }),

      GuidedReflection.countDocuments({ userId }),

      ChallengeActivity.countDocuments({ userId }),

      // ---------------- RECENT DATA ----------------

      MoodRecord.find({ userId })
        .sort({ timestamp: -1 })
        .limit(90),

      EmotionalGranularity.find({ userId })
        .sort({ timestamp: -1 })
        .limit(90),

      SomaticStressRecord.find({ userId })
        .sort({ timestamp: -1 })
        .limit(90),

      PHQ4Assessment.find({ userId })
        .sort({ completedAt: -1 })
        .limit(20),

      ShiftCheckin.find({ userId })
        .sort({ checkInTime: -1 })
        .limit(90),

      PostShiftDecompression.find({ userId })
        .sort({ createdAt: -1 })
        .limit(90),

      JournalEntry.find({ userId })
        .sort({ createdAt: -1 })
        .limit(90),

      TextEmotionRecord.find({ userId })
        .sort({ createdAt: -1 })
        .limit(90),

      AudioEmotionRecord.find({ userId })
        .sort({ createdAt: -1 })
        .limit(90),

      VideoEmotionRecord.find({ userId })
        .sort({ createdAt: -1 })
        .limit(90),

      GuidedReflection.find({ userId })
        .sort({ createdAt: -1 })
        .limit(90),

      ChallengeActivity.find({ userId })
        .sort({ completedAt: -1 })
        .limit(90)
        .populate("challengeId", "title"),
    ]);

    // --------------------------------------------------
    // MOOD SUMMARY
    // --------------------------------------------------

    const moodCount = {};

    moods.forEach((record) => {
      const mood = record.mood?.trim()?.toLowerCase();

      if (mood) {
        moodCount[mood] = (moodCount[mood] || 0) + 1;
      }
    });

    const mostFrequentMood =
      Object.entries(moodCount).length > 0
        ? Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0][0]
        : null;

    const averageMoodIntensity =
      moods.length > 0
        ? Number(
            (
              moods.reduce(
                (sum, record) => sum + (Number(record.intensity) || 0),
                0
              ) / moods.length
            ).toFixed(1)
          )
        : null;

    // --------------------------------------------------
    // EMOTIONAL GRANULARITY SUMMARY
    // --------------------------------------------------

    const emotionCount = {};

    emotionalGranularity.forEach((record) => {
      const emotion = record.specificEmotion?.trim();

      if (emotion) {
        emotionCount[emotion] =
          (emotionCount[emotion] || 0) + 1;
      }
    });

    const frequentSpecificEmotions = Object.entries(emotionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([emotion, count]) => ({
        emotion,
        count,
      }));

    // --------------------------------------------------
    // TEXT EMOTION SUMMARY
    // --------------------------------------------------

    const textEmotionCount = {};

    textEmotionRecords.forEach((record) => {
      const emotion = record.emotion?.trim()?.toLowerCase();

      if (emotion) {
        textEmotionCount[emotion] =
          (textEmotionCount[emotion] || 0) + 1;
      }
    });

    const frequentTextEmotions = Object.entries(textEmotionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([emotion, count]) => ({
        emotion,
        count,
      }));

    // --------------------------------------------------
    // AUDIO EMOTION SUMMARY
    // --------------------------------------------------

    const audioEmotionCount = {};

    audioEmotionRecords.forEach((record) => {
      const emotion = record.emotion?.trim()?.toLowerCase();

      if (emotion) {
        audioEmotionCount[emotion] =
          (audioEmotionCount[emotion] || 0) + 1;
      }
    });

    const frequentAudioEmotions = Object.entries(audioEmotionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([emotion, count]) => ({
        emotion,
        count,
      }));

    // --------------------------------------------------
    // VIDEO EMOTION SUMMARY
    // --------------------------------------------------

    const videoEmotionCount = {};

    videoEmotionRecords.forEach((record) => {
      const emotion = record.emotion?.trim()?.toLowerCase();

      if (emotion) {
        videoEmotionCount[emotion] =
          (videoEmotionCount[emotion] || 0) + 1;
      }
    });

    const frequentVideoEmotions = Object.entries(videoEmotionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([emotion, count]) => ({
        emotion,
        count,
      }));

    // --------------------------------------------------
    // STRESS SUMMARY
    // --------------------------------------------------

    const averageSomaticStress =
      somaticStress.length > 0
        ? Number(
            (
              somaticStress.reduce(
                (sum, record) =>
                  sum + (Number(record.severity) || 0),
                0
              ) / somaticStress.length
            ).toFixed(1)
          )
        : null;

    const averageShiftStress =
      shiftCheckins.length > 0
        ? Number(
            (
              shiftCheckins.reduce(
                (sum, record) =>
                  sum + (Number(record.stressLevel) || 0),
                0
              ) / shiftCheckins.length
            ).toFixed(1)
          )
        : null;

    // --------------------------------------------------
    // SHIFT SUMMARY
    // --------------------------------------------------

    const shiftMoodCount = {};

    shiftCheckins.forEach((record) => {
      const emotion = record.mood?.emotion?.trim()?.toLowerCase();

      if (emotion) {
        shiftMoodCount[emotion] =
          (shiftMoodCount[emotion] || 0) + 1;
      }
    });

    const frequentShiftMoods = Object.entries(shiftMoodCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([emotion, count]) => ({
        emotion,
        count,
      }));

    // --------------------------------------------------
    // JOURNAL SUMMARY
    // --------------------------------------------------

    const journalEmotionCount = {};

    journalEntries.forEach((entry) => {
      const emotion = entry.emotion?.trim()?.toLowerCase();

      if (emotion) {
        journalEmotionCount[emotion] =
          (journalEmotionCount[emotion] || 0) + 1;
      }
    });

    const frequentJournalEmotions = Object.entries(
      journalEmotionCount
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([emotion, count]) => ({
        emotion,
        count,
      }));

    // --------------------------------------------------
    // GUIDED REFLECTION SUMMARY
    // --------------------------------------------------

    const reflectionEmotionCount = {};

    guidedReflections.forEach((record) => {
      const emotion =
        record.emotionalState?.specificEmotion
          ?.trim()
          ?.toLowerCase();

      if (emotion) {
        reflectionEmotionCount[emotion] =
          (reflectionEmotionCount[emotion] || 0) + 1;
      }
    });

    const frequentReflectionEmotions = Object.entries(
      reflectionEmotionCount
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([emotion, count]) => ({
        emotion,
        count,
      }));

    // --------------------------------------------------
    // PHQ-4
    // --------------------------------------------------

    const latestPHQ4 =
      phq4Assessments.length > 0
        ? phq4Assessments[0]
        : null;

    // --------------------------------------------------
    // DAILY TREND HELPERS
    // --------------------------------------------------

    const toDayKey = (dateValue) => {
      if (!dateValue) return null;

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return date.toISOString().slice(0, 10);
    };

    const trendDays = {};

    const ensureTrendDay = (dateValue) => {
      const day = toDayKey(dateValue);

      if (!day) return null;

      if (!trendDays[day]) {
        trendDays[day] = {
          date: day,
          emotionValues: [],
          stressValues: [],
          activityCount: 0,
        };
      }

      return trendDays[day];
    };

    // --------------------------------------------------
    // EMOTIONAL INTENSITY TREND
    // --------------------------------------------------

    moods.forEach((record) => {
      const day = ensureTrendDay(record.timestamp);

      if (day && record.intensity !== undefined) {
        day.emotionValues.push(Number(record.intensity));
        day.activityCount += 1;
      }
    });

    emotionalGranularity.forEach((record) => {
      const day = ensureTrendDay(record.timestamp);

      if (day && record.intensity !== undefined) {
        day.emotionValues.push(Number(record.intensity));
        day.activityCount += 1;
      }
    });

    shiftCheckins.forEach((record) => {
      const day = ensureTrendDay(record.checkInTime);

      if (day && record.mood?.intensity !== undefined) {
        day.emotionValues.push(
          Number(record.mood.intensity)
        );
        day.activityCount += 1;
      }
    });

    postShiftDecompressions.forEach((record) => {
      const day = ensureTrendDay(record.createdAt);

      if (
        day &&
        record.emotionalState?.intensity !== undefined
      ) {
        day.emotionValues.push(
          Number(record.emotionalState.intensity)
        );
        day.activityCount += 1;
      }
    });

    journalEntries.forEach((record) => {
      const day = ensureTrendDay(record.createdAt);

      if (
        day &&
        record.emotionIntensity !== undefined &&
        record.emotionIntensity !== null
      ) {
        day.emotionValues.push(
          Number(record.emotionIntensity)
        );
        day.activityCount += 1;
      }
    });

    guidedReflections.forEach((record) => {
      const day = ensureTrendDay(
        record.completedAt || record.createdAt
      );

      if (
        day &&
        record.emotionalState?.intensity !== undefined
      ) {
        day.emotionValues.push(
          Number(record.emotionalState.intensity)
        );
        day.activityCount += 1;
      }
    });

    // --------------------------------------------------
    // STRESS TREND
    // --------------------------------------------------

    somaticStress.forEach((record) => {
      const day = ensureTrendDay(record.timestamp);

      if (day && record.severity !== undefined) {
        day.stressValues.push(Number(record.severity));
      }
    });

    shiftCheckins.forEach((record) => {
      const day = ensureTrendDay(record.checkInTime);

      if (day && record.stressLevel !== undefined) {
        day.stressValues.push(
          Number(record.stressLevel)
        );
      }
    });

    postShiftDecompressions.forEach((record) => {
      const day = ensureTrendDay(record.createdAt);

      if (day && record.stressLevel !== undefined) {
        day.stressValues.push(
          Number(record.stressLevel)
        );
      }
    });

    const emotionalIntensityTrend = Object.values(trendDays)
      .map((day) => ({
        date: day.date,

        averageIntensity:
          day.emotionValues.length > 0
            ? Number(
                (
                  day.emotionValues.reduce(
                    (sum, value) => sum + value,
                    0
                  ) / day.emotionValues.length
                ).toFixed(1)
              )
            : null,

        activityCount: day.activityCount,
      }))
      .filter((item) => item.averageIntensity !== null)
      .sort(
        (a, b) =>
          new Date(a.date) - new Date(b.date)
      );

    const stressTrend = Object.values(trendDays)
      .map((day) => ({
        date: day.date,

        averageStress:
          day.stressValues.length > 0
            ? Number(
                (
                  day.stressValues.reduce(
                    (sum, value) => sum + value,
                    0
                  ) / day.stressValues.length
                ).toFixed(1)
              )
            : null,
      }))
      .filter((item) => item.averageStress !== null)
      .sort(
        (a, b) =>
          new Date(a.date) - new Date(b.date)
      );

    // --------------------------------------------------
    // MODALITY USAGE
    // --------------------------------------------------

    const modalityUsage = [
      {
        modality: "Text",
        count: totalTextEmotionRecords,
      },
      {
        modality: "Audio",
        count: totalAudioEmotionRecords,
      },
      {
        modality: "Video",
        count: totalVideoEmotionRecords,
      },
      {
        modality: "Emotional Granularity",
        count: totalEmotionalGranularityRecords,
      },
    ];

    // --------------------------------------------------
    // RECENT ACTIVITY
    // --------------------------------------------------

    const recentActivity = [
      // ---------------- MOOD ----------------

      ...moods.map((record) => ({
        type: "mood",
        label: "Mood Check-in",
        emotion: record.mood || null,
        intensity: record.intensity,
        timestamp: record.timestamp,
      })),

      // ---------------- GRANULARITY ----------------

      ...emotionalGranularity.map((record) => ({
        type: "emotional_granularity",
        label: "Emotional Granularity",
        emotion: record.specificEmotion || null,
        intensity: record.intensity,
        timestamp: record.timestamp,
      })),

      // ---------------- SOMATIC STRESS ----------------

      ...somaticStress.map((record) => ({
        type: "somatic_stress",
        label: "Somatic Stress Map",
        intensity: record.severity,
        timestamp: record.timestamp,
      })),

      // ---------------- SHIFT ----------------

      ...shiftCheckins.map((record) => ({
        type: "shift_checkin",
        label: "Shift Check-in",
        emotion: record.mood?.emotion || null,
        intensity: record.mood?.intensity,
        stressLevel: record.stressLevel,
        timestamp: record.checkInTime,
      })),

      // ---------------- POST SHIFT ----------------

      ...postShiftDecompressions.map((record) => ({
        type: "post_shift",
        label: "Post-Shift Decompression",
        emotion:
          record.emotionalState?.mood || null,
        intensity:
          record.emotionalState?.intensity,
        stressLevel: record.stressLevel,
        timestamp: record.createdAt,
      })),

      // ---------------- JOURNAL ----------------

      ...journalEntries.map((record) => ({
        type: "journal",
        label: "Journal",
        emotion: record.emotion || null,
        intensity:
          record.emotionIntensity || null,
        timestamp: record.createdAt,
      })),

      // ---------------- TEXT ----------------

      ...textEmotionRecords.map((record) => ({
        type: "text_emotion",
        label: "Text Emotion",
        emotion: record.emotion || null,
        confidence: record.confidence,
        timestamp: record.createdAt,
      })),

      // ---------------- AUDIO ----------------

      ...audioEmotionRecords.map((record) => ({
        type: "audio_emotion",
        label: "Voice Emotion",
        emotion: record.emotion || null,
        confidence: record.confidence,
        timestamp: record.createdAt,
      })),

      // ---------------- VIDEO ----------------

      ...videoEmotionRecords.map((record) => ({
        type: "video_emotion",
        label: "Video Emotion",
        emotion: record.emotion || null,
        confidence: record.confidence,
        timestamp: record.createdAt,
      })),

      // ---------------- GUIDED REFLECTION ----------------

      ...guidedReflections.map((record) => ({
        type: "guided_reflection",
        label: "Guided Reflection",
        emotion:
          record.emotionalState?.specificEmotion ||
          record.emotionalState?.primaryEmotion ||
          null,
        intensity:
          record.emotionalState?.intensity,
        timestamp:
          record.completedAt || record.createdAt,
      })),

      // ---------------- PHQ-4 ----------------

      ...phq4Assessments.map((record) => ({
        type: "phq4",
        label: "PHQ-4 Assessment",
        timestamp: record.completedAt,
        phq4Score: record.score,
      })),

      // ---------------- CHALLENGES ----------------

      ...challengeActivities.map((record) => ({
        type: "challenge",
        label: "Challenge Activity",
        challengeTitle:
          record.challengeId?.title ||
          "Challenge",
        day: record.day,
        timestamp: record.completedAt,
      })),
    ]
      .filter((activity) => activity.timestamp)
      .sort(
        (a, b) =>
          new Date(b.timestamp) -
          new Date(a.timestamp)
      )
      .slice(0, 50);

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    res.status(200).json({
      summary: {
        totalMoodCheckins,
        totalEmotionalGranularityRecords,
        totalSomaticStressRecords,
        totalShiftCheckins,
        totalPostShiftDecompressions,
        totalJournalEntries,
        totalTextEmotionRecords,
        totalAudioEmotionRecords,
        totalVideoEmotionRecords,
        totalPHQ4Assessments,
        totalGuidedReflections,
        totalChallengeActivities,

        totalActivities:
          totalMoodCheckins +
          totalEmotionalGranularityRecords +
          totalSomaticStressRecords +
          totalShiftCheckins +
          totalPostShiftDecompressions +
          totalJournalEntries +
          totalTextEmotionRecords +
          totalAudioEmotionRecords +
          totalVideoEmotionRecords +
          totalPHQ4Assessments +
          totalGuidedReflections +
          totalChallengeActivities,
      },

      // ------------------------------------------------
      // MOOD
      // ------------------------------------------------

      mood: {
        mostFrequent: mostFrequentMood,
        averageIntensity: averageMoodIntensity,
        distribution: moodCount,
      },

      // ------------------------------------------------
      // EMOTIONAL GRANULARITY
      // ------------------------------------------------

      emotions: {
        frequentSpecificEmotions,
      },

      // ------------------------------------------------
      // TEXT EMOTION
      // ------------------------------------------------

      textEmotion: {
        frequentEmotions: frequentTextEmotions,
      },

      // ------------------------------------------------
      // AUDIO EMOTION
      // ------------------------------------------------

      audioEmotion: {
        frequentEmotions: frequentAudioEmotions,
      },

      // ------------------------------------------------
      // VIDEO EMOTION
      // ------------------------------------------------

      videoEmotion: {
        frequentEmotions: frequentVideoEmotions,
      },

      // ------------------------------------------------
      // STRESS
      // ------------------------------------------------

      stress: {
        averageSomaticStress,
        averageShiftStress,
      },

      // ------------------------------------------------
      // SHIFT
      // ------------------------------------------------

      shift: {
        frequentMoods: frequentShiftMoods,
      },

      // ------------------------------------------------
      // GUIDED REFLECTION
      // ------------------------------------------------

      guidedReflection: {
        frequentEmotions:
          frequentReflectionEmotions,
      },

      // ------------------------------------------------
      // PHQ-4
      // ------------------------------------------------

      phq4: {
        latest: latestPHQ4,
        history: phq4Assessments,
      },

      // ------------------------------------------------
      // JOURNAL
      // ------------------------------------------------

      journal: {
        frequentEmotions:
          frequentJournalEmotions,
      },

      // ------------------------------------------------
      // TRENDS
      // ------------------------------------------------

      trends: {
        emotionalIntensity:
          emotionalIntensityTrend,

        stress: stressTrend,

        modalityUsage,
      },

      // ------------------------------------------------
      // RECENT ACTIVITY
      // ------------------------------------------------

      recentActivity,
    });
  } catch (error) {
    console.error("Emotion insights error:", error);

    res.status(500).json({
      message: "Error generating emotion insights",
    });
  }
});

// ==================== REMINDER ROUTES ====================

// Get all reminders for the logged-in user
app.get("/api/reminders", authenticateToken, async (req, res) => {
  try {
    const reminders = await Reminder.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({ reminders });
  } catch (error) {
    console.error("Reminder fetch error:", error);
    res.status(500).json({
      message: "Error fetching reminders",
    });
  }
});

app.post("/api/reminders/setup-defaults", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const defaultReminders = [
      {
        reminderType: "hydration",
        title: "Hydration",
        description: "Take a short water break",
        scheduleType: "interval",
        startTime: "10:00",
        endTime: "18:00",
        intervalMinutes: 120,
        repeat: "daily",
      },
      {
        reminderType: "sun_break",
        title: "Sun Break",
        description: "Take a short break and spend some time outdoors",
        scheduleType: "fixed",
        time: "11:00",
        repeat: "daily",
      },
      {
        reminderType: "movement",
        title: "Movement Break",
        description: "Take a moment to stretch or move around",
        scheduleType: "interval",
        startTime: "09:00",
        endTime: "18:00",
        intervalMinutes: 90,
        repeat: "daily",
      },
      {
        reminderType: "breathing",
        title: "Breathing Reset",
        description: "Take a few minutes to slow down and breathe",
        scheduleType: "fixed",
        time: "15:00",
        repeat: "daily",
      },
      {
        reminderType: "mood_checkin",
        title: "Mood Check-in",
        description: "Take a moment to notice how you're feeling",
        scheduleType: "fixed",
        time: "20:00",
        repeat: "daily",
      },
      {
        reminderType: "journal",
        title: "Journal",
        description: "Reflect on your day and put your thoughts into words",
        scheduleType: "fixed",
        time: "21:30",
        repeat: "daily",
      },
    ];

    const createdReminders = [];

    for (const reminder of defaultReminders) {
      const existingReminder = await Reminder.findOne({
        userId,
        reminderType: reminder.reminderType,
        defaultReminder: true,
      });

      if (existingReminder) {
        createdReminders.push(existingReminder);
        continue;
      }

      try {
        const newReminder = await Reminder.create({
          ...reminder,
          userId,
          defaultReminder: true,
          status: "active",
        });

        createdReminders.push(newReminder);
      } catch (error) {
        // Another setup request may have created it at the same time.
        if (error.code === 11000) {
          const existingReminder = await Reminder.findOne({
            userId,
            reminderType: reminder.reminderType,
            defaultReminder: true,
          });

          if (existingReminder) {
            createdReminders.push(existingReminder);
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }

    res.status(200).json({
      message: "Default reminders are ready",
      reminders: createdReminders,
      created: createdReminders.length > 0,
    });
  } catch (error) {
    console.error("Default reminder setup error:", error);

    res.status(500).json({
      message: "Error setting up default reminders",
    });
  }
});

// Create a new reminder
app.post("/api/reminders", authenticateToken, async (req, res) => {
  try {
    const {
      reminderType,
      title,
      description,
      scheduleType,
      time,
      startTime,
      endTime,
      intervalMinutes,
      repeat,
    } = req.body;

    if (!reminderType || !title || !scheduleType) {
      return res.status(400).json({
        message: "Reminder type, title, and schedule type are required",
      });
    }

    if (scheduleType === "fixed" && !time) {
      return res.status(400).json({
        message: "Time is required for a fixed reminder",
      });
    }

    if (scheduleType === "interval") {
      if (!startTime || !endTime || !intervalMinutes) {
        return res.status(400).json({
          message:
            "Start time, end time, and interval are required for an interval reminder",
        });
      }
    }

    const reminder = new Reminder({
      userId: req.user.userId,
      reminderType,
      title,
      description: description || "",
      scheduleType,
      time: scheduleType === "fixed" ? time : "",
      startTime: scheduleType === "interval" ? startTime : "",
      endTime: scheduleType === "interval" ? endTime : "",
      intervalMinutes:
        scheduleType === "interval"
          ? Number(intervalMinutes)
          : null,
      repeat: repeat || "daily",
      status: "active",
    });

    await reminder.save();

    res.status(201).json({
      message: "Reminder created successfully",
      reminder,
    });
  } catch (error) {
    console.error("Reminder creation error:", error);
    res.status(500).json({
      message: "Error creating reminder",
    });
  }
});

// Update a reminder
app.patch("/api/reminders/:id", authenticateToken, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found",
      });
    }

    const allowedFields = [
      "reminderType",
      "title",
      "description",
      "scheduleType",
      "time",
      "startTime",
      "endTime",
      "intervalMinutes",
      "repeat",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        reminder[field] = req.body[field];
      }
    });

    reminder.updatedAt = new Date();

    await reminder.save();

    res.status(200).json({
      message: "Reminder updated successfully",
      reminder,
    });
  } catch (error) {
    console.error("Reminder update error:", error);
    res.status(500).json({
      message: "Error updating reminder",
    });
  }
});

// Delete a reminder
app.delete("/api/reminders/:id", authenticateToken, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found",
      });
    }

    res.status(200).json({
      message: "Reminder deleted successfully",
    });
  } catch (error) {
    console.error("Reminder deletion error:", error);
    res.status(500).json({
      message: "Error deleting reminder",
    });
  }
});

app.post("/api/text-emotions",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        text,
        cleanedText,
        emotion,
        confidence,
        probabilities,
      } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({
          message: "Text is required",
        });
      }

      if (!emotion) {
        return res.status(400).json({
          message: "Emotion is required",
        });
      }

      const record = new TextEmotionRecord({
        userId: req.user.userId,
        text: text.trim(),
        cleanedText: cleanedText || "",
        emotion,
        confidence: Number(confidence),
        probabilities: probabilities || {},
      });

      await record.save();

      res.status(201).json({
        message: "Text emotion result saved successfully",
        record,
      });
    } catch (error) {
      console.error("Text emotion save error:", error);

      res.status(500).json({
        message: "Error saving text emotion result",
      });
    }
  }
);

app.post("/api/audio-emotions", authenticateToken, async (req, res) => {
  try {
    const {
      transcript,
      emotion,
      confidence,
    } = req.body;

    if (!emotion) {
      return res.status(400).json({
        message: "Emotion is required",
      });
    }

    if (
      confidence === undefined ||
      confidence === null ||
      confidence < 0 ||
      confidence > 1
    ) {
      return res.status(400).json({
        message: "Valid confidence is required",
      });
    }

    const record = await AudioEmotionRecord.create({
      userId: req.user.userId,
      transcript: transcript || "",
      emotion,
      confidence,
    });

    res.status(201).json(record);
  } catch (error) {
    console.error("Error saving audio emotion:", error);

    res.status(500).json({
      message: "Failed to save audio emotion",
    });
  }
});

app.post("/api/video-emotions", authenticateToken, async (req, res) => {
  try {
    const {
      emotion,
      confidence,
      probabilities,
    } = req.body;

    if (!emotion) {
      return res.status(400).json({
        message: "Emotion is required",
      });
    }

    if (
      confidence === undefined ||
      confidence === null ||
      confidence < 0 ||
      confidence > 1
    ) {
      return res.status(400).json({
        message: "Valid confidence is required",
      });
    }

    const record = await VideoEmotionRecord.create({
      userId: req.user.userId,
      emotion,
      confidence,
      probabilities: probabilities || {},
    });

    res.status(201).json(record);
  } catch (error) {
    console.error("Error saving video emotion:", error);

    res.status(500).json({
      message: "Failed to save video emotion",
    });
  }
});

// ==================== SUKOON CHAT ROUTE ====================

app.post("/api/chat", authenticateToken, async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Chat message is required",
      });
    }

    const userId = req.user.userId;
    const userMessage = message.trim();
    const wellbeingContext =
  await getUserWellbeingContext(userId);

  console.log(
  "SUKOON WELLBEING CONTEXT:",
  JSON.stringify(wellbeingContext, null, 2)
);

    let conversation;

    // ------------------------------------------------
    // Find existing conversation
    // ------------------------------------------------

    if (conversationId) {
      conversation = await ChatConversation.findOne({
        _id: conversationId,
        userId,
      });

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found",
        });
      }
    } else {
      // ------------------------------------------------
      // Create a new conversation if none was provided
      // ------------------------------------------------

      conversation = await ChatConversation.create({
        userId,
        title: "New conversation",
      });
    }

    // ------------------------------------------------
    // Get messages from THIS conversation only
    // ------------------------------------------------

    const previousMessages = await ChatMessage.find({
      userId,
      conversationId: conversation._id,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    previousMessages.reverse();

    const conversationHistory = previousMessages.map((item) => ({
      role: item.role,
      content: item.message,
    }));

    // ------------------------------------------------
    // Sukoon personality
    // ------------------------------------------------

const systemPrompt = `
You are Sukoon, a warm, supportive and emotionally aware wellbeing companion.

Your purpose is to give the user a safe, natural space to talk about their
thoughts, emotions, work experiences, stress and everyday life.

You are not a therapist, doctor, or human friend. You should feel caring and
companion-like without pretending to have human feelings or relationships.

==================================================
CORE PERSONALITY
==================================================

- Be warm, calm, patient, respectful and non-judgmental.
- Sound like a caring person having a natural conversation, not like a
  therapist, counselor, motivational speaker, wellness article or chatbot script.
- Be emotionally aware without overanalyzing the user.
- Never claim certainty about what the user feels or needs.
- Let the user control the direction of the conversation.
- Match the user's tone naturally.
- If the user is casual, be casual.
- If the user is excited, share their excitement.
- If the user is upset, acknowledge it without becoming overly dramatic.
- Do not force every conversation to become a wellbeing discussion.

==================================================
CONVERSATION DECISION
==================================================

Before responding, silently determine what the user most likely wants from
the current message. Do not reveal this classification.

LISTEN:
Use when the user is mainly venting, sharing an experience, or expressing
an emotion without asking for advice.

Respond with acknowledgement and emotional presence.
Do not immediately solve the problem.
Do not automatically ask a question.

EXPLORE:
Use when the user is trying to understand an experience, thought or feeling.

Gently help them explore it.
Ask at most one relevant question when it would genuinely help.

SUPPORT:
Use when the user explicitly asks for advice, guidance, or help handling
a situation.

Give practical, realistic and manageable suggestions.
Focus on the user's actual situation rather than giving generic wellbeing advice.
Do not overwhelm the user with a long list.

SHIFT:
Use when the user says they want to stop discussing something, forget about
it, change the subject, or talk about something else.

Respect the change immediately.
Do not bring the previous topic back unless the user does.

SHARE:
Use when the user is happy, excited, relieved, proud, grateful or sharing
something positive.

Share the positive moment naturally.
Do not turn positive experiences into unnecessary emotional analysis.

CASUAL:
Use for ordinary conversation, entertainment, recommendations, hobbies,
general questions or playful conversation.

Answer naturally.
Do not unnecessarily connect casual topics to wellbeing.

==================================================
IMPORTANT CONVERSATION RULES
==================================================

- Respond directly to the user's latest message.
- The user's explicit request is more important than inferred emotional needs.
- Do not ask a question simply because a question is expected.
- Do not end every response with a question.
- Sometimes a simple acknowledgement or observation is the best response.
- Ask at most ONE meaningful follow-up question when appropriate.
- Do not give advice when the user is only venting.
- Do not only provide emotional validation when the user explicitly asks
  for practical help.
- If the user asks for a recommendation, answer the recommendation directly.
- If the user wants distraction, help them move on rather than analyzing
  why they need distraction.
- Do not repeatedly say "I'm here for you", "I'm here to listen", or similar
  phrases.
- Avoid repetitive phrases such as "That sounds difficult", "It makes sense",
  or "I'm glad to hear that" in every response.
- Do not use unnecessary therapeutic terminology.
- Do not use breathing exercises, grounding exercises, meditation, journaling,
  or coping exercises unless they are relevant to the user's request.
- Do not give lists unless the user asks for several options or a list is
  genuinely useful.
- Keep normal responses concise and conversational.

==================================================
EMOTIONAL AWARENESS
==================================================

- Pay attention to emotional cues in the user's current message.
- The current message is the strongest indication of the user's current state.
- Recent Sukoon signals are supporting context, not facts.
- Never assume an older emotional signal represents the user's current emotion.
- If current words conflict with stored signals, prioritize the current words.
- Do not tell the user that you "detected" their emotion unless they ask.
- Do not diagnose mental health conditions.
- Do not make clinical judgments about the user's mental health.

==================================================
PERSONALIZATION
==================================================

Use recent Sukoon context only when it is clearly relevant to the current
conversation.

Personalization should feel like remembering the user's recent experiences,
not monitoring them.

When relevant:
- Naturally incorporate ONE important contextual detail.
- At most TWO contextual details may be used when both are clearly relevant.
- Prefer recent work/shift context when discussing work or shifts.
- Prefer recent emotional or mood context when discussing feelings.
- Prefer recent journal context when the user discusses something related
  to their recent experiences.
- Audio and video emotion should only be supporting context.

Do NOT:
- Mention databases, stored records, model outputs, confidence scores,
  emotion classifiers, or technical details.
- Mention exact numerical wellbeing scores unless the user explicitly asks.
- Say that an emotion was detected from their voice or video.
- Recite multiple wellbeing signals.
- Force personalization when the context is unrelated.
- Treat stored signals as proof of the user's current emotion.
- Claim that a stored event definitely caused the user's current feeling.

Use natural wording such as:
"given how demanding your recent shifts have been"
or
"after some of the difficult days you've had lately"

rather than:
"your recent stress score was 8/10."

==================================================
CONTEXT RELEVANCE
==================================================

When deciding whether stored context is useful, prioritize:

1. Current message and current conversation.
2. Recent shift/work context for work-related topics.
3. Recent mood/emotional context for emotional topics.
4. Recent journal context when directly relevant.
5. Recent audio/video emotion as supporting background.
6. Ignore unrelated or old context.

If no stored context is clearly relevant, do not use it.

==================================================
CONTEXT CONFLICTS
==================================================

Different Sukoon signals may disagree.

For example:
- The user's mood may be happy while their voice emotion is sad.
- A journal entry may be positive while a recent shift was stressful.
- Video emotion may differ from audio emotion.

This is normal.

Do not try to decide which signal is "correct".
Do not mention the conflict to the user.
Use only the signal that is most relevant to the current conversation.

==================================================
RECENT SUKOON CONTEXT
==================================================

${JSON.stringify(wellbeingContext, null, 2)}

The information above is recent background context only.
It is not definitive information about the user's current emotional state.
The user's current words always take priority.

==================================================
RELATIONSHIP BOUNDARIES
==================================================

- Be warm and caring without pretending to be human.
- If the user expresses affection toward Sukoon, respond warmly but do not
  claim human feelings.
- Do not encourage emotional dependency.
- Do not suggest that Sukoon should replace friends, family, colleagues,
  therapists, doctors, or other real-world support.
- Encourage real-world support when it is genuinely relevant.
- Do not use romantic or possessive language toward the user.

==================================================
SAFETY
==================================================

- You are a wellbeing companion, not a medical professional.
- Do not diagnose or make clinical judgments.
- Do not claim certainty about the user's mental state.
- If the user expresses thoughts of suicide or self-harm, or appears to be
  in immediate danger, respond with supportive language and encourage them
  to contact a trusted person, local emergency services, or an appropriate
  crisis support service.

==================================================
RESPONSE STYLE
==================================================

For ordinary conversation:
- Usually 1–4 sentences.
- Prefer 2–3 sentences.
- One short paragraph is usually enough.
- Avoid unnecessary headings or formatting.
- Do not provide long explanations unless the user asks for detail.
- Do not sound scripted.
- Do not repeat information the user already knows.
- Do not automatically end with a question.

The response should feel like a natural continuation of the conversation,
not a generated wellbeing exercise.
`;

    // ------------------------------------------------
    // Ask Groq
    // ------------------------------------------------

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: systemPrompt,
        },

        ...conversationHistory,

        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const assistantMessage =
      completion.choices[0]?.message?.content?.trim();

    if (!assistantMessage) {
      return res.status(500).json({
        message: "Sukoon could not generate a response",
      });
    }

    // ------------------------------------------------
    // Save user message
    // ------------------------------------------------

    await ChatMessage.create({
      conversationId: conversation._id,
      userId,
      role: "user",
      message: userMessage,
    });

    // ------------------------------------------------
    // Save Sukoon response
    // ------------------------------------------------

    await ChatMessage.create({
      conversationId: conversation._id,
      userId,
      role: "assistant",
      message: assistantMessage,
    });

    // ------------------------------------------------
    // Update conversation timestamp
    // ------------------------------------------------

    conversation.updatedAt = new Date();

    // Give a new conversation a simple title
    if (
      conversation.title === "New conversation"
    ) {
      conversation.title =
        userMessage.length > 40
          ? `${userMessage.substring(0, 40)}...`
          : userMessage;
    }

    await conversation.save();

    res.status(200).json({
      reply: assistantMessage,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("Sukoon chat error:", error);

    res.status(500).json({
      message: "Unable to process chat message",
    });
  }
});

app.get("/api/chat", authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(400).json({
        message: "Conversation ID is required",
      });
    }

    const conversation = await ChatConversation.findOne({
      _id: conversationId,
      userId: req.user.userId,
    }).lean();

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const messages = await ChatMessage.find({
      conversationId,
      userId: req.user.userId,
    })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error("Chat history error:", error);

    res.status(500).json({
      message: "Unable to load chat history",
    });
  }
});

app.get("/api/chat/conversations",
  authenticateToken,
  async (req, res) => {
    try {
      const conversations = await ChatConversation.find({
        userId: req.user.userId,
      })
        .sort({ updatedAt: -1 })
        .lean();

      res.status(200).json({
        conversations,
      });
    } catch (error) {
      console.error(
        "Chat conversations error:",
        error
      );

      res.status(500).json({
        message: "Unable to load conversations",
      });
    }
  }
);

// ==================================================
// COMMUNITY ROUTES
// ==================================================

// Create a community post
app.post("/api/community/posts", authenticateToken, async (req, res) => {
  try {
    const { content, category, isAnonymous } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    const post = await CommunityPost.create({
      userId: req.user.userId,
      content: content.trim(),
      category: category || "General",
      isAnonymous: Boolean(isAnonymous),
    });

    const populatedPost = await CommunityPost.findById(post._id)
      .populate("userId", "name email")
      .lean();

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Create community post error:", error);

    res.status(500).json({
      message: "Failed to create community post",
    });
  }
});

// Get community posts
app.get("/api/community/posts", authenticateToken, async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .populate("userId", "fullName")
      .sort({ createdAt: -1 })
      .lean();

    const formattedPosts = posts.map((post) => ({
      ...post,

      author: post.isAnonymous
        ? "Anonymous"
        : post.userId?.fullName || "User",

      likeCount: post.likes?.length || 0,

      likedByCurrentUser: post.likes?.some(
        (id) => id.toString() === req.user.userId.toString()
      ) || false,
    }));

    res.status(200).json({
      posts: formattedPosts,
    });
  } catch (error) {
    console.error("Get community posts error:", error);

    res.status(500).json({
      message: "Failed to load community posts",
    });
  }
});

// Like / unlike a community post
app.post("/api/community/posts/:postId/like",
  authenticateToken,
  async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.userId;

      const post = await CommunityPost.findById(postId);

      if (!post) {
        return res.status(404).json({
          message: "Post not found",
        });
      }

      const alreadyLiked = post.likes.some(
        (id) => id.toString() === userId.toString()
      );

      if (alreadyLiked) {
        post.likes = post.likes.filter(
          (id) => id.toString() !== userId.toString()
        );
      } else {
        post.likes.push(userId);
      }

      post.updatedAt = new Date();

      await post.save();

      res.status(200).json({
        message: alreadyLiked
          ? "Post unliked"
          : "Post liked",

        liked: !alreadyLiked,

        likeCount: post.likes.length,
      });
    } catch (error) {
      console.error("Community like error:", error);

      res.status(500).json({
        message: "Failed to update like",
      });
    }
  }
);

// ==================================================
// COMMUNITY COMMENT ROUTES
// ==================================================

// Add a comment to a post
app.post("/api/community/posts/:postId/comments",
  authenticateToken,
  async (req, res) => {
    try {
      const { postId } = req.params;
      const { content, isAnonymous } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({
          message: "Comment content is required",
        });
      }

      const post = await CommunityPost.findById(postId);

      if (!post) {
        return res.status(404).json({
          message: "Post not found",
        });
      }

      const comment = await CommunityComment.create({
        postId,
        userId: req.user.userId,
        content: content.trim(),
        isAnonymous: Boolean(isAnonymous),
      });

      const populatedComment = await CommunityComment.findById(
        comment._id
      )
        .populate("userId", "fullName")
        .lean();

      res.status(201).json({
        message: "Comment added successfully",
        comment: {
          ...populatedComment,
          author: populatedComment.isAnonymous
            ? "Anonymous"
            : populatedComment.userId?.fullName || "User",
        },
      });
    } catch (error) {
      console.error("Create community comment error:", error);

      res.status(500).json({
        message: "Failed to add comment",
      });
    }
  }
);

// Get comments for a post
app.get("/api/community/posts/:postId/comments",
  authenticateToken,
  async (req, res) => {
    try {
      const { postId } = req.params;

      const comments = await CommunityComment.find({ postId })
        .populate("userId", "fullName")
        .sort({ createdAt: 1 })
        .lean();

      const formattedComments = comments.map((comment) => ({
        ...comment,

        author: comment.isAnonymous
          ? "Anonymous"
          : comment.userId?.fullName || "User",
      }));

      res.status(200).json({
        comments: formattedComments,
      });
    } catch (error) {
      console.error("Get community comments error:", error);

      res.status(500).json({
        message: "Failed to load comments",
      });
    }
  }
);

// Get current user's community posts
app.get("/api/community/my-posts",
  authenticateToken,
  async (req, res) => {
    try {
      const posts = await CommunityPost.find({
        userId: req.user.userId,
      })
        .populate("userId", "fullName")
        .sort({ createdAt: -1 })
        .lean();

      const formattedPosts = posts.map((post) => ({
        ...post,

        author: post.isAnonymous
          ? "Anonymous"
          : post.userId?.fullName || "User",

        likeCount: post.likes?.length || 0,

        likedByCurrentUser:
          post.likes?.some(
            (id) =>
              id.toString() === req.user.userId.toString()
          ) || false,
      }));

      res.status(200).json({
        posts: formattedPosts,
      });
    } catch (error) {
      console.error("My community posts error:", error);

      res.status(500).json({
        message: "Failed to load your posts",
      });
    }
  }
);

// Delete a community post owned by the current user
app.delete("/api/community/posts/:postId",
  authenticateToken,
  async (req, res) => {
    try {
      const { postId } = req.params;

      const post = await CommunityPost.findOne({
        _id: postId,
        userId: req.user.userId,
      });

      if (!post) {
        return res.status(404).json({
          message: "Post not found or you do not have permission to delete it",
        });
      }

      await CommunityComment.deleteMany({
        postId: post._id,
      });

      await CommunityPost.deleteOne({
        _id: post._id,
      });

      res.status(200).json({
        message: "Post deleted successfully",
      });
    } catch (error) {
      console.error("Delete community post error:", error);

      res.status(500).json({
        message: "Failed to delete post",
      });
    }
  }
);

// Delete a community comment owned by the current user
app.delete("/api/community/comments/:commentId",
  authenticateToken,
  async (req, res) => {
    try {
      const { commentId } = req.params;

      const comment = await CommunityComment.findOne({
        _id: commentId,
        userId: req.user.userId,
      });

      if (!comment) {
        return res.status(404).json({
          message:
            "Comment not found or you do not have permission to delete it",
        });
      }

      await CommunityComment.deleteOne({
        _id: comment._id,
      });

      res.status(200).json({
        message: "Comment deleted successfully",
      });
    } catch (error) {
      console.error("Delete community comment error:", error);

      res.status(500).json({
        message: "Failed to delete comment",
      });
    }
  }
);

// ==================== CHALLENGE ROUTES ====================

// Create a new challenge
app.post("/api/challenges",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        duration,
        startDate,
        maxParticipants,
        visibility,
        tasks,
      } = req.body;

      // Basic validation
      if (
        !title ||
        !description ||
        !category ||
        !duration ||
        !startDate ||
        !tasks ||
        tasks.length === 0
      ) {
        return res.status(400).json({
          message: "Please provide all required challenge details",
        });
      }

      // Calculate end date from start date + duration
      const start = new Date(startDate);

      if (isNaN(start.getTime())) {
        return res.status(400).json({
          message: "Invalid start date",
        });
      }

      const end = new Date(start);
      end.setDate(end.getDate() + Number(duration) - 1);
      end.setHours(23, 59, 59, 999);

      // Validate that number of tasks matches duration
      if (tasks.length !== Number(duration)) {
        return res.status(400).json({
          message: "A task is required for each challenge day",
        });
      }

      // Validate task day numbers
      const expectedDays = Array.from(
        { length: Number(duration) },
        (_, index) => index + 1
      );

      const receivedDays = tasks.map((task) => Number(task.day));

      const validDays =
        receivedDays.length === expectedDays.length &&
        expectedDays.every((day) => receivedDays.includes(day));

      if (!validDays) {
        return res.status(400).json({
          message: "Challenge tasks must contain one task for each day",
        });
      }

      const challenge = new Challenge({
        creatorId: req.user.userId,
        title: title.trim(),
        description: description.trim(),
        category,
        duration: Number(duration),
        startDate: start,
        endDate: end,
        maxParticipants:
          maxParticipants === "" ||
          maxParticipants === null ||
          maxParticipants === undefined
            ? null
            : Number(maxParticipants),
        visibility: visibility || "public",
        tasks,
        status: start > new Date() ? "upcoming" : "active",
      });

      await challenge.save();

// Creator automatically joins their own challenge
const creatorParticipation = new ChallengeParticipation({
  challengeId: challenge._id,
  userId: req.user.userId,
  joinedAt: new Date(),
  completedDays: [],
  currentDay: 1,
  completionPercentage: 0,
  status: "active",
});

await creatorParticipation.save();

res.status(201).json({
        message: "Challenge created successfully",
        challenge,
      });
    } catch (error) {
      console.error("Create challenge error:", error);

      res.status(500).json({
        message: "Failed to create challenge",
      });
    }
  }
);

// Join a challenge
app.post("/api/challenges/:challengeId/join",
  authenticateToken,
  async (req, res) => {
    try {
      const { challengeId } = req.params;
      const userId = req.user.userId;

      const challenge = await Challenge.findById(challengeId);

      if (!challenge) {
        return res.status(404).json({
          message: "Challenge not found",
        });
      }

      // A cancelled or completed challenge cannot be joined
      if (
        challenge.status === "completed" ||
        challenge.status === "cancelled"
      ) {
        return res.status(400).json({
          message: "This challenge is no longer accepting participants",
        });
      }

      // Check whether the user already joined
      const existingParticipation =
        await ChallengeParticipation.findOne({
          challengeId,
          userId,
        });

      if (existingParticipation) {
        return res.status(400).json({
          message: "You have already joined this challenge",
        });
      }

      // Check participant limit
      if (challenge.maxParticipants !== null) {
        const participantCount =
          await ChallengeParticipation.countDocuments({
            challengeId,
            status: { $ne: "left" },
          });

        if (participantCount >= challenge.maxParticipants) {
          return res.status(400).json({
            message: "This challenge has reached its participant limit",
          });
        }
      }

      // Create participation record
      const participation = new ChallengeParticipation({
        challengeId,
        userId,
        joinedAt: new Date(),
        completedDays: [],
        currentDay: 1,
        completionPercentage: 0,
        status: "active",
      });

      await participation.save();

      res.status(201).json({
        message: "Joined challenge successfully",
        participation,
      });
    } catch (error) {
      console.error("Join challenge error:", error);

      // Handles duplicate participation caused by the unique index
      if (error.code === 11000) {
        return res.status(400).json({
          message: "You have already joined this challenge",
        });
      }

      res.status(500).json({
        message: "Failed to join challenge",
      });
    }
  }
);

// Leave a challenge
app.post("/api/challenges/:challengeId/leave",
  authenticateToken,
  async (req, res) => {
    try {
      const { challengeId } = req.params;

      const challenge = await Challenge.findById(
        challengeId
      );

      if (!challenge) {
        return res.status(404).json({
          message: "Challenge not found.",
        });
      }

      const participation =
        await ChallengeParticipation.findOne({
          challengeId,
          userId: req.user.userId,
          status: "active",
        });

      if (!participation) {
        return res.status(400).json({
          message: "You are not an active participant in this challenge.",
        });
      }

      // Challenge creator cannot leave their own challenge
      if (
        challenge.creatorId.toString() ===
        req.user.userId.toString()
      ) {
        return res.status(400).json({
          message:
            "The challenge creator cannot leave their own challenge.",
        });
      }

      participation.status = "left";

      await participation.save();

      res.status(200).json({
        message: "You have left the challenge successfully.",
      });
    } catch (error) {
      console.error(
        "Leave challenge error:",
        error
      );

      res.status(500).json({
        message: "Error leaving challenge.",
      });
    }
  }
);

// Get public challenges
app.get("/api/challenges",
  authenticateToken,
  async (req, res) => {
    try {
      const challenges = await Challenge.find({
        visibility: "public",
        status: { $in: ["upcoming", "active"] },
      })
        .populate("creatorId", "fullName")
        .sort({ createdAt: -1 })
        .lean();

      const formattedChallenges = await Promise.all(
        challenges.map(async (challenge) => {
          const participantCount =
            await ChallengeParticipation.countDocuments({
              challengeId: challenge._id,
              status: { $ne: "left" },
            });

          const joined = await ChallengeParticipation.exists({
            challengeId: challenge._id,
            userId: req.user.userId,
            status: { $ne: "left" },
          });

          return {
            ...challenge,
            creatorName: challenge.creatorId?.fullName || "User",
            participantCount,
            joined: !!joined,
          };
        })
      );

      res.status(200).json({
        challenges: formattedChallenges,
      });
    } catch (error) {
      console.error("Get challenges error:", error);

      res.status(500).json({
        message: "Failed to load challenges",
      });
    }
  }
);

// Get challenge details
app.get("/api/challenges/:challengeId",
  authenticateToken,
  async (req, res) => {
    try {
      const { challengeId } = req.params;
      const userId = req.user.userId;

      const challenge = await Challenge.findById(challengeId)
        .populate("creatorId", "fullName")
        .lean();

      if (!challenge) {
        return res.status(404).json({
          message: "Challenge not found",
        });
      }

      // Private challenges can only be viewed by
      // the creator or an existing participant.
      if (challenge.visibility === "private") {
        const isCreator =
          challenge.creatorId?._id?.toString() === userId.toString();

        const participation = await ChallengeParticipation.findOne({
          challengeId,
          userId,
          status: { $ne: "left" },
        });

        if (!isCreator && !participation) {
          return res.status(403).json({
            message: "You do not have access to this challenge",
          });
        }
      }

      const participantCount =
        await ChallengeParticipation.countDocuments({
          challengeId,
          status: { $ne: "left" },
        });

      const participation =
        await ChallengeParticipation.findOne({
          challengeId,
          userId,
          status: { $ne: "left" },
        }).lean();

      const isCreator =
        challenge.creatorId?._id?.toString() === userId.toString();

      res.status(200).json({
        challenge: {
          ...challenge,
          creatorName: challenge.creatorId?.fullName || "User",
          participantCount,
          isCreator,
          joined: !!participation,
          participation: participation || null,
        },
      });
    } catch (error) {
      console.error("Get challenge details error:", error);

      res.status(500).json({
        message: "Failed to load challenge details",
      });
    }
  }
);

// Get challenges joined by the current user
app.get("/api/challenges/my/joined",
  authenticateToken,
  async (req, res) => {
    try {
      const participations =
        await ChallengeParticipation.find({
          userId: req.user.userId,
          status: { $ne: "left" },
        })
          .populate({
            path: "challengeId",
            populate: {
              path: "creatorId",
              select: "fullName",
            },
          })
          .sort({ joinedAt: -1 })
          .lean();

      const challenges = participations
        .filter((participation) => participation.challengeId)
        .map((participation) => ({
          challenge: participation.challengeId,
          creatorName:
            participation.challengeId.creatorId?.fullName || "User",

          participation: {
            joinedAt: participation.joinedAt,
            completedDays: participation.completedDays,
            currentDay: participation.currentDay,
            completionPercentage:
              participation.completionPercentage,
            status: participation.status,
            lastActivityAt: participation.lastActivityAt,
          },
        }));

      res.status(200).json({
        challenges,
      });
    } catch (error) {
      console.error("Get joined challenges error:", error);

      res.status(500).json({
        message: "Failed to load joined challenges",
      });
    }
  }
);

// Get challenges created by the current user
app.get("/api/challenges/my/created",
  authenticateToken,
  async (req, res) => {
    try {
      const challenges = await Challenge.find({
        creatorId: req.user.userId,
      })
        .sort({ createdAt: -1 })
        .lean();

      const formattedChallenges = await Promise.all(
        challenges.map(async (challenge) => {
          const participantCount =
            await ChallengeParticipation.countDocuments({
              challengeId: challenge._id,
              status: { $ne: "left" },
            });

          return {
            ...challenge,
            participantCount,
          };
        })
      );

      res.status(200).json({
        challenges: formattedChallenges,
      });
    } catch (error) {
      console.error("Get created challenges error:", error);

      res.status(500).json({
        message: "Failed to load created challenges",
      });
    }
  }
);

// Complete a challenge task
// Complete the current challenge task
app.post("/api/challenges/:challengeId/tasks/:taskId/complete",
  authenticateToken,
  async (req, res) => {
    try {
      const { challengeId, taskId } = req.params;
      const userId = req.user.userId;

      const challenge = await Challenge.findById(challengeId);

      if (!challenge) {
        return res.status(404).json({
          message: "Challenge not found",
        });
      }

      // Find user's active participation
      const participation =
        await ChallengeParticipation.findOne({
          challengeId,
          userId,
          status: "active",
        });

      if (!participation) {
        return res.status(403).json({
          message: "You must join this challenge first",
        });
      }

      // Challenge must have started
      const now = new Date();
      const startDate = new Date(challenge.startDate);
      const endDate = new Date(challenge.endDate);

      if (now < startDate) {
        return res.status(400).json({
          message: "This challenge has not started yet",
        });
      }

      if (now > endDate) {
        return res.status(400).json({
          message: "This challenge has ended",
        });
      }

      // Find requested task
      const task = challenge.tasks.id(taskId);

      if (!task) {
        return res.status(404).json({
          message: "Challenge task not found",
        });
      }

      // Integrated tasks must be completed through their
      // corresponding Sukoon activity.
      if (task.taskType !== "custom") {
        return res.status(400).json({
          message:
            "This task is completed automatically through the related Sukoon activity.",
        });
      }

      // Calculate today's challenge day
      const startOfChallengeDay = new Date(startDate);
      startOfChallengeDay.setHours(0, 0, 0, 0);

      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const differenceInMilliseconds =
        startOfToday.getTime() -
        startOfChallengeDay.getTime();

      const currentChallengeDay =
        Math.floor(
          differenceInMilliseconds / (1000 * 60 * 60 * 24)
        ) + 1;

      // Only the current challenge day can be completed
      if (task.day !== currentChallengeDay) {
        if (task.day < currentChallengeDay) {
          return res.status(400).json({
            message: "This challenge task is from a previous day",
          });
        }

        return res.status(400).json({
          message: "This challenge task is not available yet",
        });
      }

      // Make sure previous days are completed
      if (task.day > 1) {
        const previousDay = task.day - 1;

        if (
          !participation.completedDays.includes(previousDay)
        ) {
          return res.status(400).json({
            message:
              "Complete the previous challenge day first",
          });
        }
      }

      // Check duplicate completion
      const existingActivity =
        await ChallengeActivity.findOne({
          challengeId,
          userId,
          taskId,
        });

      if (existingActivity) {
        return res.status(400).json({
          message: "This task has already been completed",
        });
      }

      // Record completion
      const activity = new ChallengeActivity({
        challengeId,
        userId,
        taskId,
        day: task.day,
        completedAt: new Date(),
      });

      await activity.save();

      // Update participation
      if (!participation.completedDays.includes(task.day)) {
        participation.completedDays.push(task.day);
      }

      participation.completedDays.sort((a, b) => a - b);

      participation.completionPercentage =
        Math.round(
          (participation.completedDays.length /
            challenge.duration) *
            100
        );

      participation.currentDay =
        Math.min(
          task.day + 1,
          challenge.duration
        );

      // Challenge completed
      if (
        participation.completedDays.length >=
        challenge.duration
      ) {
        participation.currentDay = challenge.duration;
        participation.status = "completed";
      }

      participation.lastActivityAt = new Date();

      await participation.save();

      res.status(200).json({
        message: "Task completed successfully",

        progress: {
          completedDays: participation.completedDays,
          currentDay: participation.currentDay,
          completionPercentage:
            participation.completionPercentage,
          status: participation.status,
        },
      });
    } catch (error) {
      console.error(
        "Complete challenge task error:",
        error
      );

      if (error.code === 11000) {
        return res.status(400).json({
          message: "This task has already been completed",
        });
      }

      res.status(500).json({
        message: "Failed to complete challenge task",
      });
    }
  }
);

// Challenge Progress
app.get("/api/challenges/:challengeId/progress"
  ,authenticateToken,
  async (req, res) => {
    try {
      const { challengeId } = req.params;

      const challenge = await Challenge.findById(
        challengeId
      ).populate("creatorId", "fullName");

      if (!challenge) {
        return res.status(404).json({
          message: "Challenge not found.",
        });
      }

      // Only participants and creator can view group progress
      const participation =
        await ChallengeParticipation.findOne({
          challengeId,
          userId: req.user.userId,
          status: "active",
        });

      const isCreator =
        challenge.creatorId._id.toString() ===
        req.user.userId.toString();

      if (!participation && !isCreator) {
        return res.status(403).json({
          message:
            "You must be a participant to view this challenge progress.",
        });
      }

      const participations =
        await ChallengeParticipation.find({
          challengeId,
          status: { $in: ["active", "completed"] },
        }).populate("userId", "fullName");

      const participants = participations.map(
        (item) => ({
          userId: item.userId?._id,
          fullName:
            item.userId?.fullName || "User",
          completionPercentage:
            item.completionPercentage,
          completedDays:
            item.completedDays.length,
          status: item.status,
        })
      );

      const participantCount =
        participants.length;

      const totalCompletion = participants.reduce(
        (sum, item) =>
          sum + item.completionPercentage,
        0
      );

      const groupCompletionPercentage =
        participantCount > 0
          ? Math.round(
              totalCompletion /
                participantCount
            )
          : 0;

      const completedParticipants =
        participants.filter(
          (item) =>
            item.status === "completed"
        ).length;

      res.status(200).json({
        challengeId: challenge._id,
        challengeTitle: challenge.title,
        participantCount,
        completedParticipants,
        groupCompletionPercentage,
        participants,
      });
    } catch (error) {
      console.error(
        "Challenge progress error:",
        error
      );

      res.status(500).json({
        message:
          "Error retrieving challenge progress.",
      });
    }
  }
);

// Challenge Participants
app.get("/api/challenges/:challengeId/participants",
  authenticateToken,
  async (req, res) => {
    try {
      const { challengeId } = req.params;

      const challenge = await Challenge.findById(
        challengeId
      );

      if (!challenge) {
        return res.status(404).json({
          message: "Challenge not found.",
        });
      }

      // Only active participants and the creator can view participants
      const participation =
        await ChallengeParticipation.findOne({
          challengeId,
          userId: req.user.userId,
          status: "active",
        });

      const isCreator =
        challenge.creatorId.toString() ===
        req.user.userId.toString();

      if (!participation && !isCreator) {
        return res.status(403).json({
          message:
            "You must be a participant to view challenge participants.",
        });
      }

      const participations =
        await ChallengeParticipation.find({
          challengeId,
          status: {
            $in: ["active", "completed"],
          },
        })
          .populate("userId", "fullName")
          .sort({ joinedAt: 1 });

      const participants =
        participations.map((item) => ({
          userId: item.userId?._id,
          fullName:
            item.userId?.fullName || "User",
          completionPercentage:
            item.completionPercentage,
          completedDays:
            item.completedDays.length,
          status: item.status,
          joinedAt: item.joinedAt,
        }));

      res.status(200).json({
        challengeId: challenge._id,
        challengeTitle: challenge.title,
        participantCount:
          participants.length,
        participants,
      });
    } catch (error) {
      console.error(
        "Challenge participants error:",
        error
      );

      res.status(500).json({
        message:
          "Error retrieving challenge participants.",
      });
    }
  }
);

async function checkJournalChallengeCompletion(userId, journalCreatedAt) {
  try {
    console.log("=== JOURNAL CHALLENGE CHECK ===");
    console.log("User:", userId);
    console.log("Journal date:", journalCreatedAt);
    const activityDate = new Date(journalCreatedAt);

    // Find active challenge participation for this user
    const participations = await ChallengeParticipation.find({
      userId,
      status: "active",
    });

    console.log(
  "Active challenge participations:",
  participations.length
);

    for (const participation of participations) {
      const challenge = await Challenge.findById(
        participation.challengeId
      );
      console.log(
  "Checking challenge:",
  challenge?._id,
  challenge?.title,
  challenge?.status
);

      if (!challenge) continue;

      // Challenge must currently be active
      if (challenge.status !== "active") continue;

      const startDate = new Date(challenge.startDate);
      const endDate = new Date(challenge.endDate);

      // Activity must fall inside the challenge period
      if (activityDate < startDate || activityDate > endDate) {
        continue;
      }

      // Calculate which challenge day the journal belongs to
      const challengeStart = new Date(startDate);
      challengeStart.setHours(0, 0, 0, 0);

      const activityDay = new Date(activityDate);
      activityDay.setHours(0, 0, 0, 0);

      const differenceInMilliseconds =
        activityDay.getTime() -
        challengeStart.getTime();

      const challengeDay =
        Math.floor(
          differenceInMilliseconds /
            (1000 * 60 * 60 * 24)
        ) + 1;

      // Find the journal task for this day
      const task = challenge.tasks.find(
        (item) =>
          item.day === challengeDay &&
          item.taskType === "journal"
      );

      if (!task) continue;

      // Make sure this is the user's current challenge day
      if (participation.currentDay !== challengeDay) {
        continue;
      }

      // Check if task was already completed
      const existingActivity =
        await ChallengeActivity.findOne({
          challengeId: challenge._id,
          userId,
          taskId: task._id,
        });

      if (existingActivity) continue;

      // Record automatic completion
      await ChallengeActivity.create({
        challengeId: challenge._id,
        userId,
        taskId: task._id,
        day: task.day,
        completedAt: activityDate,
      });

      // Update participation
      if (
        !participation.completedDays.includes(
          challengeDay
        )
      ) {
        participation.completedDays.push(
          challengeDay
        );
      }

      participation.completedDays.sort(
        (a, b) => a - b
      );

      participation.completionPercentage =
        Math.round(
          (participation.completedDays.length /
            challenge.duration) *
            100
        );

      participation.currentDay = Math.min(
        challengeDay + 1,
        challenge.duration
      );

      if (
        participation.completedDays.length >=
        challenge.duration
      ) {
        participation.currentDay =
          challenge.duration;

        participation.status = "completed";
      }

      participation.lastActivityAt = activityDate;

      await participation.save();

      console.log(
        `Challenge journal task completed automatically for user ${userId}`
      );
    }
  } catch (error) {
    console.error(
      "Journal challenge integration error:",
      error
    );
  }
}

async function checkMoodChallengeCompletion(userId, moodTimestamp) {
  try {
    const activityDate = new Date(moodTimestamp);

    const participations = await ChallengeParticipation.find({
      userId,
      status: "active",
    });

    for (const participation of participations) {
      const challenge = await Challenge.findById(
        participation.challengeId
      );

      if (!challenge) continue;

      if (challenge.status !== "active") continue;

      const startDate = new Date(challenge.startDate);
      const endDate = new Date(challenge.endDate);

      if (activityDate < startDate || activityDate > endDate) {
        continue;
      }

      const challengeStart = new Date(startDate);
      challengeStart.setHours(0, 0, 0, 0);

      const activityDay = new Date(activityDate);
      activityDay.setHours(0, 0, 0, 0);

      const differenceInMilliseconds =
        activityDay.getTime() -
        challengeStart.getTime();

      const challengeDay =
        Math.floor(
          differenceInMilliseconds /
            (1000 * 60 * 60 * 24)
        ) + 1;

      const task = challenge.tasks.find(
        (item) =>
          item.day === challengeDay &&
          item.taskType === "mood"
      );

      if (!task) continue;

      if (participation.currentDay !== challengeDay) {
        continue;
      }

      const existingActivity =
        await ChallengeActivity.findOne({
          challengeId: challenge._id,
          userId,
          taskId: task._id,
        });

      if (existingActivity) continue;

      await ChallengeActivity.create({
        challengeId: challenge._id,
        userId,
        taskId: task._id,
        day: task.day,
        completedAt: activityDate,
      });

      if (
        !participation.completedDays.includes(
          challengeDay
        )
      ) {
        participation.completedDays.push(
          challengeDay
        );
      }

      participation.completedDays.sort(
        (a, b) => a - b
      );

      participation.completionPercentage =
        Math.round(
          (participation.completedDays.length /
            challenge.duration) *
            100
        );

      participation.currentDay = Math.min(
        challengeDay + 1,
        challenge.duration
      );

      if (
        participation.completedDays.length >=
        challenge.duration
      ) {
        participation.currentDay =
          challenge.duration;

        participation.status = "completed";
      }

      participation.lastActivityAt = activityDate;

      await participation.save();

      console.log(
        `Challenge mood task completed automatically for user ${userId}`
      );
    }
  } catch (error) {
    console.error(
      "Mood challenge integration error:",
      error
    );
  }
}

async function checkGuidedReflectionChallengeCompletion(  
  userId,
  reflectionCompletedAt
) {
  try {
    const activityDate = new Date(reflectionCompletedAt);

    const participations = await ChallengeParticipation.find({
      userId,
      status: "active",
    });

    for (const participation of participations) {
      const challenge = await Challenge.findById(
        participation.challengeId
      );

      if (!challenge) continue;

      if (challenge.status !== "active") continue;

      const startDate = new Date(challenge.startDate);
      const endDate = new Date(challenge.endDate);

      if (activityDate < startDate || activityDate > endDate) {
        continue;
      }

      const challengeStart = new Date(startDate);
      challengeStart.setHours(0, 0, 0, 0);

      const activityDay = new Date(activityDate);
      activityDay.setHours(0, 0, 0, 0);

      const differenceInMilliseconds =
        activityDay.getTime() -
        challengeStart.getTime();

      const challengeDay =
        Math.floor(
          differenceInMilliseconds /
            (1000 * 60 * 60 * 24)
        ) + 1;

      const task = challenge.tasks.find(
        (item) =>
          item.day === challengeDay &&
          item.taskType === "guidedReflection"
      );

      if (!task) continue;

      if (participation.currentDay !== challengeDay) {
        continue;
      }

      const existingActivity =
        await ChallengeActivity.findOne({
          challengeId: challenge._id,
          userId,
          taskId: task._id,
        });

      if (existingActivity) continue;

      await ChallengeActivity.create({
        challengeId: challenge._id,
        userId,
        taskId: task._id,
        day: task.day,
        completedAt: activityDate,
      });

      if (
        !participation.completedDays.includes(
          challengeDay
        )
      ) {
        participation.completedDays.push(
          challengeDay
        );
      }

      participation.completedDays.sort(
        (a, b) => a - b
      );

      participation.completionPercentage =
        Math.round(
          (participation.completedDays.length /
            challenge.duration) *
            100
        );

      participation.currentDay = Math.min(
        challengeDay + 1,
        challenge.duration
      );

      if (
        participation.completedDays.length >=
        challenge.duration
      ) {
        participation.currentDay =
          challenge.duration;

        participation.status = "completed";
      }

      participation.lastActivityAt = activityDate;

      await participation.save();

      console.log(
        `Challenge guided reflection task completed automatically for user ${userId}`
      );
    }
  } catch (error) {
    console.error(
      "Guided reflection challenge integration error:",
      error
    );
  }
}

async function checkStressAwarenessChallengeCompletion(
  userId,
  stressTimestamp
) {
  try {
    console.log("=== STRESS AWARENESS CHALLENGE CHECK ===");
    console.log("User:", userId);
    console.log("Stress date:", stressTimestamp);

    const participations = await ChallengeParticipation.find({
      userId,
      status: "active",
    });

    console.log(
      "Active challenge participations:",
      participations.length
    );

    for (const participation of participations) {
      const challenge = await Challenge.findById(
        participation.challengeId
      );

      if (!challenge || challenge.status !== "active") {
        continue;
      }

      console.log(
        "Checking challenge:",
        challenge._id,
        challenge.title,
        challenge.status
      );

      const activityDate = new Date(stressTimestamp);
      const startDate = new Date(challenge.startDate);
      const endDate = new Date(challenge.endDate);

      if (
        activityDate < startDate ||
        activityDate > endDate
      ) {
        continue;
      }

      const challengeDay =
        Math.floor(
          (
            new Date(
              activityDate.getFullYear(),
              activityDate.getMonth(),
              activityDate.getDate()
            ) -
            new Date(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate()
            )
          ) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      if (
        challengeDay < 1 ||
        challengeDay > challenge.duration
      ) {
        continue;
      }

      const task = challenge.tasks.find(
        (item) =>
          item.day === challengeDay &&
          item.taskType === "stressAwareness"
      );

      if (!task) {
        continue;
      }

      if (participation.currentDay !== challengeDay) {
        continue;
      }

      const alreadyCompleted =
        await ChallengeActivity.findOne({
          challengeId: challenge._id,
          userId,
          taskId: task._id,
        });

      if (alreadyCompleted) {
        continue;
      }

      await ChallengeActivity.create({
        challengeId: challenge._id,
        userId,
        taskId: task._id,
        day: challengeDay,
        completedAt: new Date(),
      });

      if (
        !participation.completedDays.includes(
          challengeDay
        )
      ) {
        participation.completedDays.push(challengeDay);
      }

      participation.completionPercentage =
        Math.round(
          (
            participation.completedDays.length /
            challenge.duration
          ) * 100
        );

      participation.currentDay =
        challengeDay + 1 <= challenge.duration
          ? challengeDay + 1
          : challengeDay;

      if (
        participation.completionPercentage >= 100
      ) {
        participation.completionPercentage = 100;
        participation.status = "completed";
      }

      participation.lastActivityAt = new Date();

      await participation.save();

      console.log(
        `Challenge stress awareness task completed automatically for user ${userId}`
      );
    }
  } catch (error) {
    console.error(
      "Stress awareness challenge integration error:",
      error
    );
  }
}

// ==================== RESOURCE HUB ====================

// Get all active resources
app.get("/api/resources", authenticateToken, async (req, res) => {
  try {
    const resources = await Resource.find({
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({ resources });
  } catch (error) {
    console.error("Get resources error:", error);
    res.status(500).json({
      message: "Error fetching resources",
    });
  }
});

// Get a single resource
app.get("/api/resources/:resourceId",
  authenticateToken,
  async (req, res) => {
    try {
      const resource = await Resource.findOne({
        _id: req.params.resourceId,
        isActive: true,
      });

      if (!resource) {
        return res.status(404).json({
          message: "Resource not found",
        });
      }

      res.json({ resource });
    } catch (error) {
      console.error("Get resource error:", error);
      res.status(500).json({
        message: "Error fetching resource",
      });
    }
  }
);

// TEMPORARY: Seed Resource Hub data
app.post("/api/resources/seed", authenticateToken, async (req, res) => {
  try {
    const existingCount = await Resource.countDocuments();

    if (existingCount > 0) {
      return res.status(400).json({
        message: "Resources already exist.",
        count: existingCount,
      });
    }

    const resources = [
      {
        title: "5-Minute Breathing Exercise",
        description:
          "A short breathing exercise to help you pause, slow down, and reconnect with the present moment.",
        category: "Stress Management",
        resourceType: "Exercise",
        content:
          "Sit comfortably and take a slow breath in through your nose. Hold briefly, then slowly breathe out. Repeat for five minutes while keeping your attention on your breathing.",
        source: "Sukoon",
      },

      {
        title: "Understanding Emotional Wellbeing",
        description:
          "Learn how recognizing and understanding emotions can support everyday wellbeing.",
        category: "Emotional Wellbeing",
        resourceType: "Guide",
        content:
          "Emotional wellbeing involves noticing emotions, understanding what may be contributing to them, and responding to them in healthy ways. Regular reflection can help build greater emotional awareness.",
        source: "Sukoon",
      },

      {
        title: "A Simple Mindfulness Practice",
        description:
          "A short mindfulness activity that can be practiced during a busy workday.",
        category: "Mindfulness",
        resourceType: "Exercise",
        content:
          "Pause for a few moments. Notice five things you can see, four things you can touch, three things you can hear, two things you can smell, and one thing you can taste.",
        source: "Sukoon",
      },

      {
        title: "Sleep and Recovery",
        description:
          "Practical guidance for creating healthier recovery routines around sleep.",
        category: "Sleep & Recovery",
        resourceType: "Guide",
        content:
          "Try to maintain a consistent sleep routine when possible. Create a comfortable sleep environment and allow yourself time to wind down before sleeping, especially after demanding shifts.",
        source: "Sukoon",
      },

      {
        title: "Reflective Journaling",
        description:
          "Use guided writing to understand your experiences, emotions, and needs.",
        category: "Journaling",
        resourceType: "Exercise",
        content:
          "Take a few minutes to write about what happened today, how it made you feel, what you needed in that moment, and one thing you would like to carry forward.",
        source: "Sukoon",
      },

      {
        title: "Self-Care During Demanding Workdays",
        description:
          "Simple self-care ideas for professionals working through demanding schedules.",
        category: "Workplace Wellbeing",
        resourceType: "Guide",
        content:
          "Use short breaks when possible, stay hydrated, notice signs of physical tension, and give yourself a transition period after demanding work before returning to personal responsibilities.",
        source: "Sukoon",
      },
    ];

    const createdResources = await Resource.insertMany(resources);

    res.status(201).json({
      message: "Resource Hub seeded successfully",
      count: createdResources.length,
      resources: createdResources,
    });
  } catch (error) {
    console.error("Seed resources error:", error);

    res.status(500).json({
      message: "Error seeding resources",
    });
  }
});

// Create a resource
app.post("/api/resources", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      resourceType,
      content,
      externalUrl,
      source,
    } = req.body;

    if (!title || !description || !category || !resourceType) {
      return res.status(400).json({
        message:
          "Title, description, category, and resource type are required.",
      });
    }

    const resource = await Resource.create({
      title: title.trim(),
      description: description.trim(),
      category,
      resourceType,
      content: content?.trim() || "",
      externalUrl: externalUrl?.trim() || "",
      source: source?.trim() || "",
      isActive: true,
    });

    res.status(201).json({
      message: "Resource created successfully",
      resource,
    });
  } catch (error) {
    console.error("Create resource error:", error);

    res.status(500).json({
      message: "Error creating resource",
    });
  }
});

// Update a resource
app.patch("/api/resources/:resourceId",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        resourceType,
        content,
        externalUrl,
        source,
        isActive,
      } = req.body;

      const updateData = {};

      if (title !== undefined) {
        updateData.title = title.trim();
      }

      if (description !== undefined) {
        updateData.description = description.trim();
      }

      if (category !== undefined) {
        updateData.category = category;
      }

      if (resourceType !== undefined) {
        updateData.resourceType = resourceType;
      }

      if (content !== undefined) {
        updateData.content = content.trim();
      }

      if (externalUrl !== undefined) {
        updateData.externalUrl = externalUrl.trim();
      }

      if (source !== undefined) {
        updateData.source = source.trim();
      }

      if (isActive !== undefined) {
        updateData.isActive = isActive;
      }

      const resource = await Resource.findByIdAndUpdate(
        req.params.resourceId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!resource) {
        return res.status(404).json({
          message: "Resource not found",
        });
      }

      res.json({
        message: "Resource updated successfully",
        resource,
      });
    } catch (error) {
      console.error("Update resource error:", error);

      res.status(500).json({
        message: "Error updating resource",
      });
    }
  }
);

// Delete a resource
app.delete("/api/resources/:resourceId",
  authenticateToken,
  async (req, res) => {
    try {
      const resource = await Resource.findByIdAndDelete(
        req.params.resourceId
      );

      if (!resource) {
        return res.status(404).json({
          message: "Resource not found",
        });
      }

      res.json({
        message: "Resource deleted successfully",
      });
    } catch (error) {
      console.error("Delete resource error:", error);

      res.status(500).json({
        message: "Error deleting resource",
      });
    }
  }
);
