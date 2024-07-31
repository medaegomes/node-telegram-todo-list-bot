const token = process.env.TOKEN; // To pull the environment variables from the .env file, replace the line with “ const env = require(‘./.env’) ”
const Telegraf = require("telegraf");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const bot = new Telegraf(token);

// Start mongoose
const mongoose = require("mongoose");
main().catch((err) => console.log(err));
async function main() {
  try {
    await mongoose.connect(process.env.MONGO_TOKEN);
    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

// mongoose Schema
const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  lista: { type: [String], default: [] },
});

const User = mongoose.model("User", userSchema);

// Search or create a user
async function findOrCreateUser(userId) {
  let user = await User.findOne({ userId });
  if (!user) {
    user = new User({ userId });
    await user.save();
  }
  return user;
}

// Generates buttons with the items in the list
const gerarBotoes = (lista) =>
  Extra.markup(
    Markup.inlineKeyboard(
      lista.map((item) => Markup.callbackButton(item, `delete ${item}`)),
      { columns: 1 }
    )
  );

// Start Bot
bot.start(async (ctx) => {
  // Identifying users and saving their information in constants
  const userId = ctx.update.message.from.id;
  await findOrCreateUser(userId);
  const name = ctx.update.message.from.first_name;

  // Feedback to the user
  await ctx.reply(`Hi, ${name}!`);
  await ctx.reply("Ready to start your list?");
  await ctx.reply(
    "To add an item to the list, just type it in and send it to me!"
  );
  await ctx.reply("To remove it, click on it");
  await ctx.replyWithHTML(
    '<a href="https://linktr.ee/daegomes">Click here</a> to meet my creator.',
    { disable_web_page_preview: true }
  );
});

bot.on("text", async (ctx) => {
  // If the message starts with “/” it will be ignored
  if (ctx.update.message.text.startsWith("/")) {
    return;
  }

  // Identifying users and saving their information in constants
  const userId = ctx.update.message.from.id;
  const user = await findOrCreateUser(userId);

  // Saves the list item in the database
  user.lista.push(ctx.update.message.text);
  await user.save();

  // Feedback to the user
  await ctx.replyWithHTML(
    `<code>${ctx.update.message.text} added! ✅</code>`,
    gerarBotoes(user.lista)
  );
});

bot.action(/delete (.+)/, async (ctx) => {
  // Identifying users and saving their information in constants
  const userId = ctx.update.callback_query.from.id;
  const itemToDelete = ctx.match[1];
  const user = await findOrCreateUser(userId);

  // delete an item from the list
  user.lista = user.lista.filter((item) => item !== itemToDelete);
  await user.save();

  // Feedback to the user
  await ctx.replyWithHTML(
    `<code>${itemToDelete} done! 🗑</code>`,
    gerarBotoes(user.lista)
  );
  ctx.answerCbQuery();
});

bot.startPolling();
