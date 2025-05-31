// Application Form Submission
document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  try {
    const res = await fetch("http://localhost:3000/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();
    alert(data.message || "Application submitted successfully!");

    // Optional: Reset the form
    document.getElementById("applicationForm").reset();
  } catch (err) {
    console.error("Error:", err);
    alert("Something went wrong while submitting application.");
  }
});

// Offer Letter Generation and Download
document.getElementById("offerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const studentName = document.getElementById("studentName").value.trim();
  const position = document.getElementById("position").value.trim();

  try {
    const res = await fetch("http://localhost:3000/api/offer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentName, position })
    });

    if (!res.ok || res.status !== 200) {
      throw new Error("Failed to generate offer letter");
    }

    // Trigger download of PDF
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${studentName.replace(/ /g, "_")}_Offer_Letter.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    // Optional: Reset the form
    document.getElementById("offerForm").reset();
  } catch (err) {
    console.error("Error:", err);
    alert("Something went wrong while generating the offer letter.");
  }
});
