// server.js
const admin = require('firebase-admin');
const webpush = require('web-push');

// 1. IMPORTANT: Replace with your actual Firebase Admin SDK Service Account JSON file path
const serviceAccount = require('./serviceAccountKey.json');

// 2. These keys MUST match the ones in your HTML file!
const publicVapidKey = 'BGIg5Qt9He3uHEIDBbige7V1u1sL-fh9MQXhtPlUwcgJ_DHO5ogKAFI_Efsrv4cx1jYDaPP-2yYbFbB1plpRX58';
const privateVapidKey = 'd0m31uE-iXkY7WpA17Zk6-P51hM0N4jJ2VqH9yQp0Q0'; // KEEP THIS SECRET

webpush.setVapidDetails('mailto:admin@bumblebee.com', publicVapidKey, privateVapidKey);

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// IMPORTANT: Make sure this matches your HTML Firebase path exactly
const appId = "1:1096819067201:web:57c08fd4072accce93f9c0"; 
const bookingsRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('bookings');
const adminsRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('admin_users');

console.log("Bumblebee Push Notification Server Started...");

// Monitor Database for changes
bookingsRef.onSnapshot(async (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
        // If a booking is modified to be in 'overtime' state, trigger push!
        if (change.type === 'modified') {
            const data = change.doc.data();
            
            // Checking if session just ended/entered overtime
            if (data.isOvertime && !data.sessionEnded && !data.invoiced) {
                console.log(`Sending Push Notification for Station: ${data.stationId}`);

                // Fetch all admins to get their Push Subscriptions
                const adminsSnapshot = await adminsRef.get();
                
                adminsSnapshot.forEach(adminDoc => {
                    const adminData = adminDoc.data();
                    
                    if (adminData.pushSubscription) {
                        try {
                            const sub = JSON.parse(adminData.pushSubscription);
                            
                            const payload = JSON.stringify({
                                title: `🚨 Station Time Up!`,
                                body: `User ${data.username} time has ended!`,
                                url: '/'
                            });

                            webpush.sendNotification(sub, payload).catch(err => {
                                console.error('Error pushing to admin:', adminData.username, err.statusCode);
                            });

                        } catch(e) {
                            console.error('Invalid subscription format for', adminData.username);
                        }
                    }
                });
            }
        }
    });
}, err => {
    console.log(`Encountered error: ${err}`);
});

### How to start the Node.js Backend
1. Install Node.js on your computer or server.
2. Open your terminal in the new folder and run:
   ```bash
   npm init -y
   npm install firebase-admin web-push
   3. Go to your **Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key**. Save that JSON file in your folder and name it `serviceAccountKey.json`.
4. Start the server by running:
   ```bash
   node server.js
