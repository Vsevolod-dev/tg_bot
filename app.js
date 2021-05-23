const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const express = require('express')
const mongoose = require('mongoose');
const json = require('json');

// const Router = require('express-router')
// const router = Router()
// router.post('/bot', ctx => {
//     console.log(ctx)
//     ctx.status = 200
// })

const app = express() 

const PORT = process.env.PORT || 3000

const token = '1887316818:AAFi4mGQMyr3X0-y8U8blHX-0VeYo1Uri_E';
const bot = new TelegramBot(token, {
    // webHook: {
    //     port: PORT
    // }
    polling: true
});

const now = new Date();
const milliSeconds = now.getTime();
const milliSeconds_plus_5min = milliSeconds + 300000
const headers = {'Authorization': 'Bearer eyJrIjoiT0tTcG1pUlY2RnVKZTFVaDFsNFZXdE9ZWmNrMkZYbk'}


async function start() {
    try {
        await mongoose.connect('mongodb://localhost/telegramDB', {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
            .then(() => console.log("MongoDB has startes"))
            .catch(e => console.log(e))
        bot.setWebHook(`35.238.97.90/bot`, () => {
            console.log('WebHook has been started')
        })
        app.listen(PORT, () => {
            console.log('Server has been started')
        })

        const userSchema = mongoose.Schema({
            _id: Number,
            chatId: Number,
            name: String,
        });

        const Users = mongoose.model('users', userSchema) 

        bot.on('message', (msg, match) => {

            const chatId = msg.chat.id;
            
            //это добавление, работает, не трогай
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
                })
            }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if (msg.text === 'Аварии на данный момент') {
                const url =  'http://exp-tools.unix.tensor.ru/queues/';
                const r = request.get(url = url, verify=False);
                const answ = r.json().incident_list[0];

                bot.sendMessage(chatId, answ);
            }

            if (msg.text === 'Инциденты/триггеры') {
                // const url =  `https://monitor.sbis.ru/d/b9DogIvGz/intsidenty?orgId=1&refresh=30s&from=${milliSeconds}&to=${milliSeconds_plus_5min}&viewPanel=4`;
                // const r = request.get(url = url, headers = headers, verify=False);

                // const exp_conf = request.json().panels.dutyInfo.properties.count.incident.exp[0];
                // const spd_conf = request.json().panels.dutyInfo.properties.count.incident.spd[0];
                // const sys_conf = request.json().panels.dutyInfo.properties.count.incident.sys[0];

                // const exp_not_conf = request.json().panels.dutyInfo.properties.count.incident.exp[1];
                // const spd_not_conf = request.json().panels.dutyInfo.properties.count.incident.spd[1];
                // const sys_not_conf = request.json().panels.dutyInfo.properties.count.incident.sys[1];

                bot.sendMessage(chatId, `
                Отдел эксплуатации:
Подтверждено: 11, Не подтверждено: 0
Отдел СПД:
Подтверждено: 13, Не подтверждено: 0
Отдел администрирования:
Подтверждено: 40, Не подтверждено: 0
                `);
            }

            if (msg.text === 'Флаг аварии') {
                bot.sendMessage(chatId, 'Напишите название аварии или сервиса');
            }

            if (msg.text === 'Мониторинг') {
                bot.sendMessage(chatId, 'Выберите экран', {
                    reply_markup: {
                        keyboard: [
                            ['Ошибки облака', 'Очереди'],
                            ['Контроль состояний виртуальных платформ', 'Контроль сервисов БД']
                        ]
                    }
                });
            }

            if (msg.text === 'Ошибки облака') {
                // wget -O 1.svg `https://monitor.sbis.ru/d/000000125/pch-tsod-oshibki-oblaka?orgId=1&refresh=10s&from=${milliSeconds}&to=${milliSeconds_plus_5min}`
                
                // const img = 
                bot.sendPhoto(chatId, './img/1');
            }

            if (msg.text === 'Очереди') {
                bot.sendMessage(chatId, 'Очереди график');
            }

            if (msg.text === 'Контроль состояний виртуальных платформ') {
                bot.sendMessage(chatId, 'Виртуальные платформы график');
            }

            if (msg.text === 'Контроль сервисов БД') {
                bot.sendMessage(chatId, 'Контроль сервисов БД график');
            }

          });

          bot.on("polling_error", (m) => console.log(m));

    } catch (e) {
        console.log(e.message)
    }
}

start()

// const request = require('request');
// const json = require('json');

// server = 'https://monitor.sbis.ru/d/Nx4A5nmmz/'

// const url = server + 'api/dashboards/uid' + uid

// https://monitor.sbis.ru/d/b9DogIvGz/intsidenty?orgId=1&refresh=30s&from=1621716327028&to=1621716627028

// const headers = {'Authorization': 'Bearer eyJrIjoiT0tTcG1pUlY2RnVKZTFVaDFsNFZXdE9ZWmNrMkZYbk'}
// curl -H "Authorization: Bearer eyJrIjoiYU9KZVFDaFMwakNIb3QzN1F0aTdFVUQ2ZjA3Qzh3eTAiLCJuIjoiZmlyc3RfdGVzdCIsImlkIjoxfQ==" http://34.71.93.17:3000/api/dashboards/home


// const r = request.get(url = url, headers = headers, verify=True)
// console.log(r.json())

// console.log(dsa( 'google.com'))