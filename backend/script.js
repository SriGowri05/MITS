const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect("mongodb+srv://internshipapplication:123456mits@cluster0.mbjqjel.mongodb.net/mits", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Schemas
const Application = mongoose.model("Application", new mongoose.Schema({
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
}));

const Offer = mongoose.model("Offer", new mongoose.Schema({
  studentName: String,
  position: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
}));

// ✅ Application Submission
app.post("/api/apply", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    await new Application({ name, email }).save();
    res.status(200).json({ message: "Application submitted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while saving application" });
  }
});

// ✅ Updated Offer Letter Generation with improved field checks and error handling
app.post("/api/offer", async (req, res) => {
  const { studentName, position, email } = req.body;

  if (!studentName || !position || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Look for application with exact name and email match
    const applied = await Application.findOne({ name: studentName, email });
    if (!applied) {
      return res.status(400).json({ message: "No application found for the given name and email." });
    }

    // Save the offer info in DB
    await Offer.create({ studentName, position, email });

    // Generate PDF offer letter
    const doc = new PDFDocument({ margin: 50 });
    const filename = `${studentName.replace(/ /g, "_")}_Offer_Letter.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    doc
      .fontSize(20)
      .fillColor("#004080")
      .text("MITS Internship Office", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(14)
      .fillColor("#333333")
      .text("Madanapalle Institute of Technology & Science", { align: "center" })
      .moveDown(1.5);

    const today = new Date().toLocaleDateString();
    doc.fontSize(12).fillColor("black").text(`Date: ${today}`).moveDown(1);
    doc.text(`Dear ${studentName},`).moveDown(1);
    doc.text(`We are pleased to offer you the role of `, { continued: true })
      .font("Helvetica-Bold").text(`${position}`, { continued: true })
      .font("Helvetica").text(` as an intern at our institution.`).moveDown();

    doc.text(`Your internship is scheduled to commence soon. We believe this opportunity will aid in your academic and professional journey. Please consider this letter as official confirmation of your internship offer.`, {
      align: "justify", lineGap: 4
    }).moveDown();

    doc.text("Sincerely,", { lineGap: 2 });
    doc.text("Internship Coordinator");
    doc.text("MITS");

    doc.moveDown(3);
    doc.strokeColor("#CCCCCC").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc
      .fontSize(10)
      .fillColor("gray")
      .text("This is a system-generated letter. No signature is required.", 50, doc.y + 5, { align: "center" });

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating offer letter" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
