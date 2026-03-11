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

app.get("/reports/:uid", async (req, res) => {

  const { uid } = req.params;

  try {

    const snapshot = await db
      .collection("reports")
      .where("reportedBy", "==", uid)
      .get();

    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(reports);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

app.get("/resident/:uid", async (req, res) => {

  const { uid } = req.params;

  try {

    const doc = await db.collection("residents").doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Resident not found" });
    }

    res.json({
      uid: doc.id,
      ...doc.data()
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});


app.put("/update-account/:uid", async (req, res) => {

const { uid } = req.params;

const {
firstname,
lastname,
email,
contact,
address,
profileImage
} = req.body;

try {

await admin.auth().updateUser(uid,{
email
});

await db.collection("residents").doc(uid).update({

firstname,
lastname,
email,
contact,
address,
profileImage

});

res.json({
message:"Account updated successfully"
});

}catch(error){

res.status(500).json({
error:error.message
});

}

});

app.delete("/delete-account/:uid", async (req, res) => {

  const { uid } = req.params;

  try {

    await admin.auth().deleteUser(uid);

    await db.collection("residents").doc(uid).delete();

    res.json({
      message: "Account deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

app.get("/admin/reports", async (req, res) => {

  const { search = "", status = "" } = req.query;

  try {

    const snapshot = await db.collection("reports").get();

    const reports = await Promise.all(
      snapshot.docs.map(async (doc) => {

        const report = doc.data();

        const residentDoc = await db
          .collection("residents")
          .doc(report.reportedBy)
          .get();

        const resident = residentDoc.data();

        return {
          id: doc.id,
          ...report,
          email: resident?.email || "",
          contact: resident?.contact || ""
        };

      })
    );

    let filtered = reports;

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.residentName.toLowerCase().includes(s) ||
        r.category.toLowerCase().includes(s)
      );
    }

    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }

    res.json(filtered);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

app.get("/admin/my-cases/:adminId", async (req, res) => {

  const { adminId } = req.params;

  try {

    const snapshot = await db
      .collection("reports")
      .where("assignedTo", "==", adminId)
      .get();

    const reports = await Promise.all(
      snapshot.docs.map(async (doc) => {

        const report = doc.data();

        const residentDoc = await db
          .collection("residents")
          .doc(report.reportedBy)
          .get();

        const resident = residentDoc.data();

        return {
          id: doc.id,
          ...report,
          email: resident?.email || "",
          contact: resident?.contact || ""
        };

      })
    );

    res.json(reports);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

app.put("/admin/assign-report/:id", async (req, res) => {

  const { id } = req.params;
  const { adminId } = req.body;

  try {

    await db.collection("reports").doc(id).update({
      status: "reviewing",
      assignedTo: adminId
    });

    res.json({ message: "Report assigned successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

app.put("/admin/review-report/:id", async (req, res) => {

  const { id } = req.params;
  const { message } = req.body;

  try {

    await db.collection("reports").doc(id).update({
      status: "ongoing",
      adminMessage: message
    });

    res.json({ message: "Report moved to ongoing" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

app.put("/admin/resolve-report/:id", async (req, res) => {

  const { id } = req.params;
  const { message, media } = req.body;

  try {

    await db.collection("reports").doc(id).update({
      status: "resolved",
      resolutionMessage: message,
      resolutionMedia: media
    });

    res.json({ message: "Report resolved successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});