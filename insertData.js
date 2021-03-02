const url = 'mongodb+srv://WilyFox:10100202Mongo@cluster0.if44r.mongodb.net/notepads?retryWrites=true&w=majority';
const dbname = 'islands';
const Interface = require('./interface');
let database = new Interface(url, dbname);

database.getName().then(data => {
    console.log(data);
})

let object = [
    {
        "name_rus": "Морская душа",
        "name_eng": "The seabound soul",
        "image": "https://i.imgur.com/9hryvb4.png",
        "description_eng": "The Seabound Soul is a standalone Tall Tale",
        "description_rus": "Морская душа это отдельное приключение из серии Tall Tale",
        "start_eng": "Shipwreck bay",
        "start_rus": "Залив затонувших кораблей",
        "reward": "8000 :coin:",
        "reward_image": "https://i.imgur.com/4J17gL2.png",
    },
    {
        "name_rus": "Сердце огня",
        "name_eng": "Heart of fire",
        "image": "https://i.imgur.com/RDfiqA3.png",
        "description_eng": "Heart of Fire is a standalone Tall Tale",
        "description_rus": "Сердце огня это отдельное приключение из серии Tall Tale",
        "start_eng": "Morrows peak outpost",
        "start_rus": "Форпост скала морроу",
        "reward": "8000 :coin:",
        "reward_image": "https://i.imgur.com/z2PTKK6.png",
    },
];

database.insertMany('talltale', object).then(data => {
    console.log(data);
});