const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect(
  "mongodb+srv://internshipapplication:123456mits@cluster0.mbjqjel.mongodb.net/mits?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Application Schema & Model
const ApplicationSchema = new mongoose.Schema({
  name: String,
  email: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Application = mongoose.model("Application", ApplicationSchema);

// ✅ Offer Schema & Model
const OfferSchema = new mongoose.Schema({
  studentName: String,
  position: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Offer = mongoose.model("Offer", OfferSchema);

// ✅ Route: Internship Application
// ✅ Route: Generate Offer Letter PDF (Professional Version)
app.post("/api/offer", async (req, res) => {
  const { studentName, position } = req.body;

  try {
    await Offer.create({ studentName, position });

    const doc = new PDFDocument({ margin: 50 });
    const filename = `${studentName.replace(/ /g, "_")}_Offer_Letter.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // Header
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

    doc
      .fontSize(12)
      .text(`Dear ${studentName},`)
      .moveDown(1);

    doc
      .text(`We are pleased to offer you the role of `, { continued: true })
      .font("Helvetica-Bold")
      .text(`${position}`, { continued: true })
      .font("Helvetica")
      .text(` as an intern at our institution.`)
      .moveDown();

    doc.text(
      `Your internship is scheduled to commence soon, and we believe this experience will be valuable to your academic and professional growth. Please treat this as an official confirmation of your offer.`,
      { align: "justify", lineGap: 4 }
    ).moveDown();

    doc.text("Sincerely,", { lineGap: 2 });
    doc.text("Internship Coordinator");
    doc.text("MITS");

    doc.moveDown(3);
    doc
      .strokeColor("#CCCCCC")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc
      .fontSize(10)
      .fillColor("gray")
      .text("This is a system-generated letter. No signature is required.", 50, doc.y + 5, {
        align: "center",
      });

    doc.end();
  } catch (err) {
    console.error("❌ Error generating offer letter:", err);
    res.status(500).json({ message: "Error generating offer letter" });
  }
});


// ✅ Route: Generate Offer Letter PDF
app.post("/api/offer", async (req, res) => {
  const { studentName, position } = req.body;

  try {
    await Offer.create({ studentName, position });

    const doc = new PDFDocument();
    const filename = `${studentName.replace(/ /g, "_")}_Offer_Letter.pdf`;

    // Set headers
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    // Stream PDF to response
    doc.pipe(res);

    // PDF content
    doc.fontSize(20).text("Internship Offer Letter", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Dear ${studentName},`);
    doc.moveDown();
    doc.text(`We are pleased to offer you the position of ${position} as an intern at our organization.`);
    doc.moveDown();
    doc.text("Congratulations! We look forward to working with you.");
    doc.moveDown();
    doc.text("Best regards,");
    doc.text("The Internship Team");

    doc.end();
  } catch (err) {
    console.error("❌ Error generating offer letter:", err);
    res.status(500).json({ message: "Error generating offer letter" });
  }
});

// ✅ Start Server
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
