const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nexorasims.firebaseio.com"
});

const db = admin.firestore();
console.log('Firebase initialized!');
module.exports = db;
