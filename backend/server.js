const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { admin, db } = require("./firebase");


const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post("/signup", async (req, res) => {

  console.log("Received:", req.body);

  const { firstname, lastname, email, contact, address, password, proofOfResidency} = req.body;

  try {

    const user = await admin.auth().createUser({
      email: email,
      password: password
    });

    await db.collection("residents").doc(user.uid).set({
      firstname,
      lastname,
      email,
      contact,
      address,
      role: "resident",
      proofOfResidency,
      acceptedTerms: false,
      isverified: false,
      createdAt: new Date().toLocaleDateString()
    });

    res.status(200).json({
      message: "User registered successfully"
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

app.post("/report", async (req, res) => {
  const { category, location, description, proofofReport, uid } = req.body;

  try {

    // get resident info
    const residentDoc = await db.collection("residents").doc(uid).get();

    if (!residentDoc.exists) {
      return res.status(404).json({
        message: "Resident not found"
      });
    }

    const residentData = residentDoc.data();

    const reportData = {
      category,
      location,
      description,
      proofofReport,
      reportedBy: uid,
      residentName: residentData.firstname + " " + residentData.lastname,
      status: "pending",
      reportedAt: new Date().toLocaleString()
    };

    const reportRef = await db.collection("reports").add(reportData);

      console.log("Report received:", req.body);
      
    res.status(200).json({
      message: "Report submitted successfully",
      reportId: reportRef.id
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.get("/pending-residents", async (req, res) => {
  try {

    const snapshot = await db
      .collection("residents")
      .where("isverified", "==", false)
      .get();

    const residents = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    res.json(residents);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/approve-resident/:uid", async (req, res) => {

  const { uid } = req.params;

  try {

    await db.collection("residents").doc(uid).update({
      isverified: true
    });

    res.json({ message: "Resident approved successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

app.get("/staffs", async (req, res) => {
  try {

    const snapshot = await db
      .collection("residents")
      .where("role", "==", "admin")
      .get();

    const staffs = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    res.json(staffs);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/residents", async (req, res) => {
  try {

    const snapshot = await db
      .collection("residents")
      .where("role", "==", "resident")
      .where("isverified", "==", true)
      .get();

    const residents = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    res.json(residents);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});