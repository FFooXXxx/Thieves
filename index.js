const Discord = require("discord.js");
const bot = new Discord.Client();

const express = require("express");
const app = express();
const requests = require("requests");

let token = process.env.TOKEN;
let prefix = "*";

const url = process.env.DBURL;
const dbname = "islands";
const Interface = require("./interface");
let database = new Interface(url, dbname);

app.get("/", (req, res) => {
  res.send("Bot is runnig");
});

// Heroku request
setInterval(() => {
  requests("https://gmodbot.herokuapp.com").on("data", (chunk) => {});
}, 600000);

bot.on("ready", () => {
  console.log(`Let's dig some treasures with ${bot.user.username}`);
  bot.generateInvite(["ADMINISTRATOR"]).then((link) => {
    console.log(link);
  });

  bot.user.setActivity("*help");
});

bot.on("message", (message) => {
  if (message.author.id == bot.user.id) {
    return;
  }

  // Help message
  if (message.content.startsWith(prefix + "help")) {
    help(message);
    return;
  }

  // Islands commands
  if (message.content.startsWith(prefix + "find")) {
    findWraepper(message);
    return;
  }
  if (message.content.startsWith(prefix + "forpost")) {
    forpost(message);
    return;
  }
  if (message.content.startsWith(prefix + "fort")) {
    fort(message);
    return;
  }
  if (message.content.startsWith(prefix + "store")) {
    store(message);
    return;
  }

  // Tall Tales commands
  if (message.content.startsWith(prefix + "tales")) {
    tales(message);
    return;
  }

  // Game commands
  if (message.content.startsWith(prefix + "guess")) {
    guess(message);
    return;
  }
  if (message.content.startsWith(prefix + "profile")) {
    profile(message);
    return;
  }

  // Developer commands
  if (message.content.startsWith(prefix + "test")) {
    if (message.author.id == "208583885666254849") {
      total(message);
    } else {
      message.channel.send("Недостаточно прав");
    }
    return;
  }

  if (message.content == prefix + "channel") {
    if (message.author.id == "208583885666254849") {
      let embed = new Discord.MessageEmbed();
      let guilds = "";
      let limit = 5;
      let j = 0;
      let guildcount = 0;
      for (let i of bot.guilds.cache) {
        j++;
        if (j > limit) {
        } else {
          guilds += `${j}. **${i[1].name}**\n`;
        }
        guildcount++;
      }
      embed.setTitle("Tunes Info");
      embed.addFields({
        name: "Channels",
        value: guildcount,
      });
      embed.setDescription(`**First 5 guilds:**\n${guilds}`);
      embed.setColor("#0CCE6B");
      message.channel.send(embed);
    }
  }
});

const help = async (message) => {
  let params = message.content.split(" ");
  if (!params[1] || params[1] == "ru") {
    let embed = new Discord.MessageEmbed()
      .setColor(`#0CCE6B`)
      .setDescription(`**Описание команд**:`)
      .addFields(
        {
          name: "Islands",
          value:
            "*find **(Name | Coordiantes)** - **Найти остров по имени | координатам** :island:\n*store - **Показать все лавки с координатами** :coin:\n*fort - **Показать все форты с координатами** :crossed_swords:\n*forpost - **Показать все форпосты с координатами** :triangular_flag_on_post:",
        },
        {
          name: "Games",
          value:
            "*guess - **Угадай остров по картинке** :game_die:\n*profile - **Посмотреть совой профиль игры бота**\n*profile (**Ping | Id**) - **Посмотреть аккаунт другого игорока игры бота**",
        },
        {
          name: "Tall Tales",
          value:
            "*tale - **Показать все доступные Tall Tales приключения** :pirate_flag:\n*tale **(Name)** - **Показать информацию про приключение** :fire:",
        }
      )
      .setAuthor("Thieves Bot", "https://i.imgur.com/ng9MUbX.png", "");
    message.channel.send(embed);
  } else if (params[1] == "eng") {
    let embed = new Discord.MessageEmbed()
      .setColor(`#0CCE6B`)
      .setDescription(`**Описание команд**:`)
      .addFields(
        {
          name: "Islands",
          value:
            "*find **(Name | Coordiantes)** - **Find island by name | coordinates** :island:\n*store - **Show all stores with coordinates** :coin:\n*fort - **Show all forts with coordinates** :crossed_swords:\n*forpost - **Show all outpost with coordinates** :triangular_flag_on_post:",
        },
        {
          name: "Games",
          value:
            "*guess - **Guess the island by image** :game_die:\n*profile - **See your current bot game profile**\n*profile (**Ping | Id**) - **See another users bot game profile**",
        },
        {
          name: "Tall Tales",
          value:
            "*tale - **Show all Tall Tales** :pirate_flag:\n*tale **(Name)** - **Show info about Tall Tale** :fire:",
        }
      )
      .setAuthor("Thieves Bot", "https://i.imgur.com/ng9MUbX.png", "");
    message.channel.send(embed);
  }
  return;
};

const tales = async (message) => {
  let params = message.content.split(" ");
  let taleNameRaw = message.content.replace("*tales ", "").toLowerCase();
  let taleName = pretty(taleNameRaw);
  if (!params[1]) {
    let names = "";
    await database.find("talltale", {}).then((data) => {
      for (let i = 0; i < data.length; i++) {
        names += `${i}. **${data[i].name_rus}**\n`;
      }
    });

    let embed = new Discord.MessageEmbed()
      .setColor(`#1B998B`)
      .setDescription(names)
      .setAuthor("Tall Tales", "https://i.imgur.com/SRm8Vtz.png", "");
    message.channel.send(embed);
    return;
  }

  await database.findOne("talltale", { name_rus: taleName }).then((data) => {
    let embed = new Discord.MessageEmbed()
      .setColor(`#1B998B`)
      .setThumbnail(data.image)
      .addFields(
        { name: "Где начать", value: data.start_rus },
        { name: "Описание", value: data.description_rus },
        { name: "Награда", value: data.reward }
      )
      .setImage(data.reward_image)
      .setAuthor(data.name_rus, "https://i.imgur.com/SRm8Vtz.png", "");

    if (data.additional) {
      embed.addFields({ name: "Дополнительно", value: data.additional });
    }
    message.channel.send(embed);
    return;
  });

  return;
};

const getId = (ping) => {
  let str = "";
  for (let i = 0; i < ping.length; i++) {
    if (ping[i].match(/[0-9]/)) {
      str += ping[i];
    }
  }
  return str;
};

const createUser = async (user) => {
  let DBuser = {
    name: user.tag,
    score: "0",
    lastScore: "0",
    try: "0",
    avatar: user.avatarURL({ format: "png" }),
    guild: "none",
    tag: "none",
    id: user.id,
    color: "#E97D29",
  };

  await database.insertOne("users", DBuser);

  return DBuser;
};

const profile = async (message) => {
  let params = message.content.split(" ");
  if (!params[1]) {
    await database
      .findOne("users", { id: message.author.id })
      .then(async (data) => {
        if (!data) {
          let user = createUser(message.author);
          let embed = new Discord.MessageEmbed()
            .setColor(data.color)
            .addFields(
              { name: "Top Score", value: `${user.score} :game_die:` },
              { name: "Last Score", value: `${data.lastScore} :game_die:` },
              { name: "Attempts", value: `${user.try} :skull:` }
            )
            .setAuthor(user.name, user.avatar, "");
          message.channel.send(embed);
        } else {
          let embed = new Discord.MessageEmbed()
            .setColor(data.color)
            .addFields(
              { name: "Top Score", value: `${data.score} :game_die:` },
              { name: "Last Score", value: `${data.lastScore} :game_die:` },
              { name: "Attempts", value: `${data.try} :skull:` }
            )
            .setAuthor(
              message.author.tag,
              message.author.avatarURL({ format: "png" }),
              ""
            );
          message.channel.send(embed);
        }
      });
  } else if (params[1] != "edit") {
    let id = getId(params[1]);
    console.log(id);

    await database.findOne("users", { id: id }).then(async (data) => {
      if (data) {
        let embed = new Discord.MessageEmbed()
          .setColor(data.color)
          .addFields(
            { name: "Top Score", value: `${data.score} :game_die:` },
            { name: "Last Score", value: `${data.lastScore} :game_die:` },
            { name: "Attempts", value: `${data.try} :skull:` }
          )
          .setAuthor(
            message.author.tag,
            message.author.avatarURL({ format: "png" }),
            ""
          );
        message.channel.send(embed);
      } else {
        let embed = new Discord.MessageEmbed()
          .setColor("#D33F49")
          .setDescription("Looks like this player hasnt played any guess game");
        message.channel.send(embed);
      }
    });
  }
  return;
};

const guess = async (message) => {
  await database.findOne("users", { id: message.author.id }).then((data) => {
    if (!data) createUser(message.author);
  });

  let answer;
  let variant1;
  let variant2;
  let currentIsle;
  let currentScore = 0;
  let inGame = true;

  await message.channel.messages.fetch({ limit: 1 }).then((messages) => {
    message.channel.bulkDelete(messages);
  });

  while (inGame) {
    let isle = Math.floor(Math.random() * 90);
    let isle2 = Math.floor(Math.random() * 90);
    let isle3 = Math.floor(Math.random() * 90);

    await database.find("island", {}).then((data) => {
      currentIsle = data[isle];
      answer = data[isle].name_rus;
      variant1 = data[isle2].name_rus;
      variant2 = data[isle3].name_rus;
    });

    let embed = new Discord.MessageEmbed()
      .setColor(`#0CCE6B`)
      .setTitle("Guess Game")
      .setAuthor("Thieves Bot", "https://i.imgur.com/ng9MUbX.png", "")
      .addFields({ name: "Score", value: currentScore })
      .setImage(currentIsle.image_topView);

    let int = Math.floor(Math.random() * 3);
    console.log(int);
    if (int == 0) {
      embed.addFields({
        name: "Variants",
        value: `${answer}\n${variant2}\n${variant1}`,
      });
    } else if (int == 1) {
      embed.addFields({
        name: "Variants",
        value: `${variant1}\n${variant2}\n${answer}`,
      });
    } else if (int == 2) {
      embed.addFields({
        name: "Variants",
        value: `${variant1}\n${answer}\n${variant2}`,
      });
    }

    message.channel.send(embed);

    filter = (m) => m.author.id == message.author.id;
    let choose = await message.channel.awaitMessages(filter, {
      max: 1,
      time: 150000,
    });

    if (!choose.first().content || choose.first().content != answer) {
      await database
        .findOne("users", { id: message.author.id })
        .then(async (data) => {
          if (!data) {
            createUser(message.author);
            console.log("suka");
            return;
          }
          let dataScore = data.score;
          let dataTry = data.try;

          if (dataScore < currentScore) {
            await database.updateOne(
              "users",
              { id: message.author.id },
              {
                score: currentScore,
                try: Number(dataTry) + 1,
                lastScore: currentScore,
              }
            );
            console.log(dataScore, currentScore);
          } else {
            await database.updateOne(
              "users",
              { id: message.author.id },
              { try: Number(dataTry) + 1, lastScore: currentScore }
            );
            console.log(dataScore, currentScore);
          }
        });

      let embed2 = new Discord.MessageEmbed()
        .setColor(`#D33F49`)
        .setTitle("Guess Game")
        .setAuthor("Thieves Bot", "https://i.imgur.com/ng9MUbX.png", "")
        .addFields({ name: "Score", value: currentScore })
        .setDescription("Game ended!");
      message.channel.send(embed2);
      isGame = false;
      return;
    }

    currentScore++;

    await message.channel.messages.fetch({ limit: 2 }).then((messages) => {
      message.channel.bulkDelete(messages);
    });
  }
  return;
};

const total = async (message) => {
  await database.find("island", {}).then((data) => {
    let embed = new Discord.MessageEmbed()
      .setTitle(`Total count`)
      .setColor(`#c0ffee`)
      .setDescription(`**Total islands in DB**\n${data.length}`);
    message.channel.send(embed);
    return;
  });
  return;
};

const store = async (message) => {
  let outs = "";

  await database.find("island", { store: "true" }).then((data) => {
    for (let i = 0; i < data.length; i++) {
      outs += `${data[i].name_rus} | **${data[i].coords}**\n`;
    }

    let embed = new Discord.MessageEmbed()
      .setTitle(`Лавки`)
      .setColor(`#FFBA08`)
      .setDescription(outs);
    message.channel.send(embed);
    return;
  });
  return;
};

const fort = async (message) => {
  let outs = "";

  await database.find("island", { fort: "true" }).then((data) => {
    for (let i = 0; i < data.length; i++) {
      outs += `${data[i].name_rus} | **${data[i].coords}**\n`;
    }

    let embed = new Discord.MessageEmbed()
      .setTitle(`Крепости`)
      .setColor(`#E97D29`)
      .setDescription(outs);
    message.channel.send(embed);
    return;
  });
  return;
};

const forpost = async (message) => {
  let outs = "";

  await database.find("island", { forpost: "true" }).then((data) => {
    for (let i = 0; i < data.length; i++) {
      outs += `${data[i].name_rus} | **${data[i].coords}**\n`;
    }

    let embed = new Discord.MessageEmbed()
      .setTitle(`Форпосты`)
      .setColor(`#FAE1DF`)
      .setDescription(outs);
    message.channel.send(embed);
    return;
  });
  return;
};

const findWraepper = (message) => {
  let request = message.content.replace("*find ", "").toLowerCase();
  if (request.match(/[a-z][0-9]+/)) {
    coords(message);
  } else if (request.match(/[а-я]/)) {
    find(message);
  } else if (request.match(/[a-z]/)) {
    find_eng(message);
  } else {
    let embed = new Discord.MessageEmbed()
      .setTitle(`Неправильный запрос`)
      .setColor(`#2E282A`);
    message.channel.send(embed);
  }
  return;
};

const coords = async (message) => {
  let paramss = message.content.replace("*find ", "").toUpperCase();
  let embed;
  let isFinded = false;

  await database.find("island", {}).then((data) => {
    for (let i = 0; i < data.length; i++) {
      let coords = data[i].coords.split(" ");
      if (coords.includes(paramss)) {
        embed = new Discord.MessageEmbed()
          .setTitle(`${data[i].name_rus}`)
          .setColor(`#3F88C5`)
          .addFields({ name: "Координаты", value: data[i].coords })
          .setImage(data[i].image_topView)
          .setThumbnail(data[i].image);

        if (data[i].forpost) {
          embed.addFields({
            name: "Дополнительно",
            value: "Форпост :triangular_flag_on_post:",
          });
        } else if (data[i].fort) {
          embed.addFields({
            name: "Дополнительно",
            value: "Форт :crossed_swords:",
          });
        } else if (data[i].store) {
          embed.addFields({ name: "Дополнительно", value: "Лавка :coin:" });
        }

        isFinded = true;
        message.channel.send(embed);
        return;
      } else {
        isFinded = false;
      }
    }
  });

  if (!isFinded) {
    embed = new Discord.MessageEmbed()
      .setTitle(`Ничего не найдено`)
      .setColor(`#D33F49`)
      .setDescription(
        "Координаты острова: **" + paramss + "** написаны правильно?"
      );
    message.channel.send(embed);
  }

  return;
};

const find = async (message) => {
  let paramss = message.content.replace("*find ", "").toLowerCase();
  let params = pretty(paramss);
  let embed;

  await database.findOne("island", { name_rus: params }).then((data) => {
    if (!data) {
      embed = new Discord.MessageEmbed()
        .setTitle(`Ничего не найдено`)
        .setColor(`#D33F49`)
        .setDescription("Имя острова: **" + params + "** написано правильно?");
    } else {
      embed = new Discord.MessageEmbed()
        .setTitle(`${data.name_rus}`)
        .setColor(`#3F88C5`)
        .addFields({ name: "Координаты", value: data.coords })
        .setImage(data.image_topView)
        .setThumbnail(data.image);

      if (data.forpost) {
        embed.addFields({
          name: "Дополнительно",
          value: "Форпост :triangular_flag_on_post:",
        });
      } else if (data.fort) {
        embed.addFields({
          name: "Дополнительно",
          value: "Форт :crossed_swords:",
        });
      } else if (data.store) {
        embed.addFields({ name: "Дополнительно", value: "Лавка :coin:" });
      }
    }
    message.channel.send(embed);
    return;
  });
  return;
};

const find_eng = async (message) => {
  let paramss = message.content.replace("*find ", "").toLowerCase();
  let params = pretty(paramss);
  console.log(params);
  let embed;

  await database.findOne("island", { name_eng: params }).then((data) => {
    if (!data) {
      embed = new Discord.MessageEmbed()
        .setTitle(`Nothing found`)
        .setColor(`#D33F49`)
        .setDescription("Is name: **" + params + "** are correcct?");
    } else {
      embed = new Discord.MessageEmbed()
        .setTitle(`${data.name_eng}`)
        .setColor(`#3F88C5`)
        .addFields({ name: "Coordinates", value: data.coords })
        .setImage(data.image_topView)
        .setThumbnail(data.image);

      if (data.forpost) {
        embed.addFields({
          name: "Additional",
          value: "Outpost :triangular_flag_on_post:",
        });
      } else if (data.fort) {
        embed.addFields({ name: "Additional", value: "Fort :crossed_swords:" });
      } else if (data.store) {
        embed.addFields({ name: "Additional", value: "Store :coin:" });
      }
    }

    message.channel.send(embed);
    return;
  });
  return;
};

const pretty = (param) => {
  let elems = param.split("");
  elems[0] = elems[0].toUpperCase();
  let str = "";
  let newStr = "";
  for (let i = 0; i < elems.length; i++) {
    str += elems[i];
  }
  for (let j = 0; j < str.length; j++) {
    if (str[j] == "'") {
    } else newStr += str[j];
  }
  console.log(newStr);
  return newStr;
};

app.listen(process.env.PORT, () => {
  bot.login(token);
});
