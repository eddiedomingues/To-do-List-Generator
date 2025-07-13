// This code runs in a secure server environment, NOT in the browser.
// This is to update custom properties of a user account, this is how I set displayNames for users
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = process.argv[2];
const variable = process.argv[3];
const value = process.argv[4];

let dataToUpdate = {};
dataToUpdate[variable] = value;
admin
  .auth()
  .updateUser(uid, dataToUpdate)
  .then((userRecord) => {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log("Successfully updated user", userRecord.toJSON());
  })
  .catch((error) => {
    console.log("Error updating user:", error);
  });
