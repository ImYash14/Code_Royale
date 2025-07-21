// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const admin = require("../firebaseAdmin");

const db = admin.firestore();

router.post("/profile", async (req, res) => {
  const idToken = req.headers.authorization;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, name, email } = decodedToken;

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      // New user → create in Firestore
      await userRef.set({
        uid,
        name,
        email,
        rating: 1000,
        battlesPlayed: 0
      });
    }

    res.json({ uid, name, email });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
