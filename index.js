const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { Resend } = require("resend");

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 MongoDB connection (still needed if you use it elsewhere)
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// 🔹 Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/sendmail", async (req, res) => {
  try {
    const { msg, emaillist } = req.body;

    if (!msg || msg.trim() === "" || !emaillist || emaillist.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Enter message and upload excel file first!"
      });
    }

    // 🔹 Send mails one by one
    for (let i = 0; i < emaillist.length; i++) {
      await resend.emails.send({
        from: "onboarding@resend.dev", // default test sender
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});