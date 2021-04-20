const admin = require("firebase-admin");

const serviceAccount = require("../firebase-serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = {
  async sendNotification(token, message) {
    message.token = token;
    return await admin.messaging().send(message);
  },
};
