const restify = require('restify');
const { BotFrameworkAdapter, MemoryStorage, ConversationState } = require('botbuilder');
const { Translate } = require('@google-cloud/translate').v2;
require('dotenv').config();

const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
adapter.use(conversationState);

const translate = new Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY });

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${server.name} listening to ${server.url}`);
});

server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type === 'message') {
            const text = context.activity.text;
            let targetLang = 'vi';
            if (context.activity.locale === 'vi') {
                targetLang = 'zh-TW';
            }

            try {
                const [translation] = await translate.translate(text, targetLang);
                await context.sendActivity(translation);
            } catch (error) {
                console.error('ERROR:', error);
                await context.sendActivity('Sorry, something went wrong with the translation.');
            }
        }
    });
});
