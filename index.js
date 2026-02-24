const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://survesh354:Survesh%40354@cluster0.5aihays.mongodb.net/passkey?appName=Cluster0")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const credential = mongoose.model("credential", {}, "bulkmail");

app.post("/sendmail", async (req, res) => {
  try {
    const { msg, emaillist } = req.body;

    if (!msg || msg.trim() === "" || !emaillist || emaillist.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Enter message and upload excel file first!"
      });
    }

    // 🔹 Fetch credentials from DB
    const data = await credential.find();

    if (!data.length) {
      return res.status(500).json({
        success: false,
        message: "No email credentials found in database"
      });
    }

    // 🔹 Create transporter dynamically
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].toJSON().user,
        pass: data[0].toJSON().pass,
      },
    });

    // 🔹 Send mails one by one
    for (let i = 0; i < emaillist.length; i++) {
      await transporter.sendMail({
        from: data[0].toJSON().user,
        to: emaillist[i],
        subject: "Greetings",
        text: msg,
      });
    }

    res.json({ success: true, message: "Emails sent successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to send emails" });
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});