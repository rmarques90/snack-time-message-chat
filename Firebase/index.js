const firebaseCfg = require('./firebase-cfg.json');

const firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/firestore");

let firestore;

const msgCollection = 'messages';

const initializeFirebase = () => {

    if (!firebaseCfg) {
        console.error('FirebaseCfg is not defined');
        process.exit(1);
    }

    console.log("initializing firebase conn...");

    firebase.initializeApp(firebaseCfg);

    firestore = firebase.firestore();
}

const getNextMessage = async () => {
    let response = await firestore.collection(msgCollection)
    .where('used', '==', false)
    .limit(1)
    .get();

    if (response && !response.empty) {
        let messageObj;
        response.forEach(async doc => {
            messageObj = doc.data();

            //lets flag it as used
            await firestore.collection(msgCollection).doc(doc.id).update({
                used: true
            });
        })

        return messageObj.message;
    }
}

module.exports = {
    initializeFirebase, getNextMessage
}