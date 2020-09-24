const axios = require('axios');
const scheduler = require('node-schedule');

require('dotenv').config();

const BOT_WEBHOOK_URL = process.env.BOT_WEBHOOK_URL;

if (!BOT_WEBHOOK_URL) {
    console.log('BOT url not defined');
    process.exit(1);
}

let cronString = process.env.CRON_STRING || '0 0 16 * * *';

console.log(`App initiated with cron string: ${cronString}`);


const getQuote = async () => {
    try {
        let response = await axios({
            method: 'GET',
            url: 'https://api.paperquotes.com/apiv1/qod/?lang=pt',
            headers: {
                'Authorization': 'Token ' + process.env.QUOTE_TOKEN,
                'Content-Type': 'application/json'
            }
        })
        // console.log("response", response.data);
        if (response && response.data && response.data.quote) {
            return response.data.quote;
        }
    } catch (e) {
        console.error("Error requesting quote", e);
    }
}

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
    let quoteOfDay = await getQuote();
    await publishToGoogleChat(quoteOfDay);
});

console.log("Iniciado!");