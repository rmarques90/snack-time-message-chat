require('dotenv').config();
const {initializeFirebase, publishMessage} = require('./Firebase');

initializeFirebase();

const messages = [
    "msg1",
    "msg2"
]

new Promise(async (resolve, reject) => {
    for (let i = 0; i < messages.length; i++) {
        await publishMessage(messages[i]);
    }
    resolve();
}).then(() => {
    console.log('messages published');
    process.exit(1);
});