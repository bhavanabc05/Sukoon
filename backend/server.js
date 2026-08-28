const User = require("./models/User");

const express=require('express')
const mongoose=require('mongoose')
const cors=require('cors')
const dotenv=require('dotenv')
 
dotenv.config()

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

const PORT=5000;
app.listen(PORT,()=>{
    console.log(`Sukoon backend running on http://localhost:${PORT}`)
})