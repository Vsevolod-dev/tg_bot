const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const express = require('express')
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000
const app = express()

const token = '1765547135:AAFH8jT27hH0haFqy3eQ2YUFQA40CdAjg0k';
const bot = new TelegramBot(token, {polling: true});

// const tg_usaers = {
//     390869132: "каменовский",
//     123: "topeopr",
//     14324: "demid"
// }

async function start() {
    try {
        await mongoose.connect('mongodb://localhost/telegramDB', {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
            .then(() => console.log("MongoDB has startes"))
            .catch(e => console.log(e))
        app.listen(PORT, () => {
            console.log('Server has benn started')
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

            if (msg.text !== '/start') {
                bot.sendMessage(chatId, 'Выберите действие', {
                    reply_markup: {
                        keyboard: [
                            ['Ошибки облака', 'Очереди'],
                            ['Контроль состояний виртуальных платформ', 'Контроль сервисов БД']
                        ]
                    }
                });
            }
            // Users.find({}).then(users => {
            //     console.log(users)
            // })
          //   проверка чат ид или имени в бд
          //   если норм => список кнопок
          //   не норм => обратитесь к администратору
          });

          bot.on("polling_error", (m) => console.log(m));

    } catch (e) {
        console.log(e.message)
    }
}

start()