const axios = require('axios');
const scheduler = require('node-schedule');

const {initializeFirebase, getNextMessage} = require('./Firebase');

require('dotenv').config();

const BOT_WEBHOOK_URL = process.env.BOT_WEBHOOK_URL;

if (!BOT_WEBHOOK_URL) {
    console.log('BOT url not defined');
    process.exit(1);
}

initializeFirebase();

let cronString = process.env.CRON_STRING || '0 0 16 * * *';

console.log(`App initiated with cron string: ${cronString}`);

const publishToGoogleChat = async (msg) => {
    try {
        await axios({
            method: 'POST',
            url: BOT_WEBHOOK_URL,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            data: JSON.stringify({
                "cards": [
                    {
                        "header": {
                            "title": "Snack Time",
                            "subtitle": "snack@time.com.br",
                            "imageUrl": "https://goo.gl/aeDtrS",
                            "imageStyle": "IMAGE"
                        },
                        "sections": [
                            {
                                "widgets": [
                                    {
                                        "keyValue": {
                                            "topLabel": "Atenção @todos",
                                            "content": "Tá na hora do <b>lanche</b>!!! :D"
                                        }
                                    }
                                ]
                            },
                            {
                                "widgets": [
                                    {
                                        "textParagraph": {
                                            "text": (msg ? `<b>Frase do dia:</b> ${msg}` : 'Sorry :/ sem frase do dia...' )
                                        }
                                    }
                                ]
                            },
                            {
                                "widgets": [
                                    {
                                        "keyValue": {
                                            "topLabel": "G(old)",
                                            "content": "Ta tudo rápido e funcionando aqui!"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            })
        })
        console.log("Publiquei!");
    } catch (e) {
        console.error("error sending message", e);
    }
}

let snackJob = scheduler.scheduleJob(cronString, async () => {
    const messageRetrivied = await getNextMessage();

    await publishToGoogleChat(messageRetrivied);
});

console.log("Iniciado com sucesso!");