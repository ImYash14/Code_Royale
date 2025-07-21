const express = require("express");
const cors = require("cors");
const { admin, db } = require("./firebaseAdmin");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/profile", async (req, res) => {
  const idToken = req.headers.authorization;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, name, email } = {
      uid: decoded.uid,
      name: decoded.name,
      email: decoded.email
    };

    // Check if user already exists
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid,
        name,
        email,
        joinedAt: new Date(),
        rating: 1200,
        battlesPlayed: 0
      });
    }

    res.json({ message: `Hello ${name}!`, email });
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.post("/queue", async (req, res) => {
  const authHeader = req.headers.authorization;
  const decoded = await admin.auth().verifyIdToken(authHeader);
  const uid = decoded.uid;

  const userDoc = await db.collection("users").doc(uid).get();
  const userData = userDoc.data();

  // Add to matchmaking queue
  await db.collection("matchQueue").doc(uid).set({
    uid,
    name: userData.name,
    email: userData.email,
    joinedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  res.json({ message: "Added to matchmaking queue" });
});

app.listen(3001, () => console.log("✅ Backend running on http://localhost:3001"));
