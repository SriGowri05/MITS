const backendUrl = "https://mits-backend.onrender.com";

// Application Form
document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  try {
    const res = await fetch(`${backendUrl}/api/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();
    alert(data.message || "Application submitted!");
    document.getElementById("applicationForm").reset();
  } catch (err) {
    console.error(err);
    alert("Error submitting application.");
  }
});

// Offer Letter Generation
document.getElementById("offerForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const studentName = document.getElementById("studentName").value.trim();
  const position = document.getElementById("position").value.trim();
  const email = document.getElementById("offerEmail").value.trim();
  console.log("Offer Form Data:", { studentName, position, email });

  if (!studentName || !position || !email) {
    alert("Please fill all fields!");
    return;
  }

  try {
    const res = await fetch(`${backendUrl}/api/offer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentName, position, email })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Offer generation failed.");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${studentName.replace(/ /g, "_")}_Offer_Letter.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    document.getElementById("offerForm").reset();
  } catch (err) {
    console.error(err);
    alert(err.message || "Error generating offer letter.");
  }
});
