// functions/set-role.js
// This function is to set custom roles to users, only ran on the terminal
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = process.argv[2];
const role = process.argv[3];

if (!uid || !role) {
  console.error("Usage: node set-role.js <uid> <role>");
  process.exit(1);
}

// Set the custom claim { role: '...' } on the user
admin
  .auth()
  .setCustomUserClaims(uid, { role: role })
  .then(() => {
    console.log(`Success! User ${uid} has been given the role of '${role}'.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error setting custom claim:", error);
    process.exit(1);
  });
