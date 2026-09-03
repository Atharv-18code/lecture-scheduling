const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const User = require("./models/user");


const seedUsers = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");


    // Remove existing users
    await User.deleteMany({});


    // Hash passwords
    const adminPassword = await bcrypt.hash(
      "Admin@123",
      10
    );

    const instructorPassword = await bcrypt.hash(
      "Rahul@123",
      10
    );


    // Create users
    await User.create([
      {
        name: "Admin User",
        email: "admin@test.com",
        password: adminPassword,
        role: "admin"
      },

      {
        name: "Rahul Sharma",
        email: "rahul@test.com",
        password: instructorPassword,
        role: "instructor"
      },

      {
        name: "Amit Patil",
        email: "amit@test.com",
        password: instructorPassword,
        role: "instructor"
      },

      {
        name: "Priya Shah",
        email: "priya@test.com",
        password: instructorPassword,
        role: "instructor"
      }
    ]);


    console.log("Users seeded successfully");

    process.exit();

  } catch (error) {

    console.error("Seeding failed:", error);

    process.exit(1);
  }
};


seedUsers();