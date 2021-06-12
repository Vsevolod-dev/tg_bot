const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const Koa = require('koa');
const mongoose  = require('mongoose');
const Router  = require('koa-router');
const config = require('./config');
const childProcess = require('child_process');

const token = config.token;
const bot = new TelegramBot(token);
bot.setWebHook(`${config.url}/bot`);

const app = new  Koa();

const router = Router();
router.post('/bot', ctx => {
    console.log(ctx);
    ctx.status = 200;
});

app.use(router.routes())

const PORT = config.port;
const now = new Date();
const milliSeconds = now.getTime();
const milliSeconds_plus_5min = milliSeconds + 300000;
const headers = config.auth;

function execProcess (comand) {
    childProcess.exec(comand, (error, stdout, stderr) => {
        console.log(`stdout: ${stdout}`);
        console.log(`stdout: ${stderr}`);

        if(error !== null) {
            console.log(`error: ${error}`)
        }
    })
}

async function start() {
    try {
        await connect('mongodb://localhost/telegramDB', {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
            .then(() => console.log("MongoDB has startes"))
            .catch(e => console.log(e))
        app.listen(PORT, () => {
            console.log(`Server has been started on ${PORT}`)
        });

        const userSchema = Schema({
            _id: Number,
            chatId: Number,
            name: String,
        });

        const Users = model('users', userSchema);

        bot.on('message', (msg, match) => {

            const chatId = msg.chat.id;
            
            //это добавление, работает, не трогать
            // const users = new Users({
            //     _id: 155255523,
            //     chatId: 45651,
            //     name: "saSAsasAASsda"
            // })
            // users.save()
            //     .then(user => {
            //         console.log(user)
            //     })
            //     .catch(e => console.log(e))
            
            if (msg.text === '/start') {
            Users.find({chatId: chatId})
                .then(users => {
                    bot.sendMessage(chatId, 'Привет, ' + users[0].name + ', ты есть в списке, добро пожаловать');
                    bot.sendMessage(chatId, 'Выберите действие', {
                        reply_markup: {
                            keyboard: [
                                ['Аварии на данный момент', 'Мониторинг'],
                                ['Инциденты/триггеры', 'Флаг аварии']
                            ]
                        }
                    });
                })
                .catch(e => {
                    bot.sendMessage(chatId, 'Ваш chatId = ' + msg.from.id + ', попросите администратора добавить вас в список, и продолжите работу с ботом');
                });
            }

            if (msg.text === 'Назад') {
                bot.sendMessage(chatId, 'Выберите действие', {
                    reply_markup: {
                        keyboard: [
                            ['Аварии на данный момент', 'Мониторинг'],
                                ['Инциденты/триггеры', 'Флаг аварии']
                        ]
                    }                    
                });
            }

            if (msg.text === 'Аварии на данный момент') {
                const url;
                Users.find({name: msg.text})
                .then(dashboard => {
                    url = dashboard.link;
                })
                const r = request.get(url = url, verify=False);
                const answ = r.json().incident_list[0];
                bot.sendMessage(chatId, `
Аварии на данный момент:
    ${answ}`);
            }

            if (msg.text === 'Инциденты/триггеры') {
                const url;
                Users.find({name: msg.text})
                .then(dashboard => {
                    url = dashboard.link;
                })
                const r = get(url = url, headers = headers, verify=False);
                const exp_conf = json().panels.dutyInfo.properties.count.incident.exp[0];
                const spd_conf = json().panels.dutyInfo.properties.count.incident.spd[0];
                const sys_conf = json().panels.dutyInfo.properties.count.incident.sys[0];

                const exp_not_conf = json().panels.dutyInfo.properties.count.incident.exp[1];
                const spd_not_conf = json().panels.dutyInfo.properties.count.incident.spd[1];
                const sys_not_conf = json().panels.dutyInfo.properties.count.incident.sys[1];

                bot.sendMessage(chatId, `
                Отдел эксплуатации:
Подтверждено: ${exp_conf}, Не подтверждено: ${exp_not_conf}
Отдел СПД:
Подтверждено: ${spd_conf}, Не подтверждено: ${spd_not_conf}
Отдел администрирования:
Подтверждено: ${sys_conf}, Не подтверждено: ${sys_not_conf}
                `);
            }

            if (msg.text === 'Флаг аварии') {
                bot.sendMessage(chatId, 'Напишите название аварии или сервиса' /*+ subprocess.check_output('pwd', shell = True)*/);
                //subprocess.check_output(`echo 123`, shell=True)
            }

            if (msg.text === 'Мониторинг') {
                bot.sendMessage(chatId, 'Выберите экран', {
                    reply_markup: {
                        keyboard: [
                            ['Ошибки облака', 'Очереди'],
                            ['Контроль состояний виртуальных платформ', 'Контроль сервисов БД'],
                            ['Назад']
                        ]
                    }
                });
            }

            if (msg.text === 'Ошибки облака') {
                const url;
                Users.find({name: msg.text})
                .then(dashboard => {
                    url = dashboard.link;
                })
                execProcess(`wget -O 1.png '${url}?orgId=1&refresh=10s&from=${milliSeconds}&to=${milliSeconds_plus_5min}'`)
                bot.sendPhoto(chatId, './img/1.png');
                execProcess('rm 1.png')
            }

            if (msg.text === 'Очереди') {
                const url;
                Users.find({name: msg.text})
                .then(dashboard => {
                    url = dashboard.link;
                })
                execProcess(`wget -O 2.png '${url}?orgId=1&refresh=60s&from=${milliSeconds}&to=${milliSeconds_plus_5min}&var-contur=prod&var-bl=All'`)
                bot.sendPhoto(chatId, './img/2.png');
                execProcess('rm 2.png')
            }

            if (msg.text === 'Контроль состояний виртуальных платформ') {
                const url;
                Users.find({name: msg.text})
                .then(dashboard => {
                    url = dashboard.link;
                })
                execProcess(`wget -O 3.png '${url}?orgId=1&refresh=60s&from=${milliSeconds}&to=${milliSeconds_plus_5min}&var-contur=prod&var-bl=All'`)
                bot.sendPhoto(chatId, './img/3.png');
                execProcess('rm 3.png')
            }

            if (msg.text === 'Контроль сервисов БД') {
                const url;
                Users.find({name: msg.text})
                .then(dashboard => {
                    url = dashboard.link;
                })
                execProcess(`wget -O 4.png '${url}?orgId=1&refresh=10s&from=${milliSeconds}&to=${milliSeconds_plus_5min}'`)
                bot.sendPhoto(chatId, './img/4.png');
                execProcess('rm 4.png')
            }

          });

          bot.on("polling_error", (m) => console.log(m));

    } catch (e) {
        console.log(e.message);
    }
}

start()