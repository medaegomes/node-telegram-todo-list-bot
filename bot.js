const env = require('./.env')
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const bot = new Telegraf(env.token)

let lista = []

const gerarBotoes = () => Extra.markup(
    Markup.inlineKeyboard(
        lista.map(item => Markup.callbackButton(item, `delete ${item}`)),
        { columns: 3 }
    )
)

bot.start(async ctx => {
    const name = ctx.update.message.from.first_name
    await ctx.reply(`Oii, ${name}!`)
    await ctx.reply('Pronto para começar a sua lista?')
    await ctx.reply('Para adicionar um item na lista, basta digitar e me enviar!')
    await ctx.reply('Para remover clique sobre ele')
    await ctx.replyWithHTML('<a href="https://linktr.ee/daegomes">Clique aqui</a> para conhecer meu criador.', { disable_web_page_preview: true })
})

bot.on('text',async ctx => {
    if (ctx.update.message.text.startsWith('/')) {
        return;
    }

    lista.push(ctx.update.message.text)
    await ctx.replyWithHTML(`<code>${ctx.update.message.text} adicionado! ✅</code>`, gerarBotoes())
})

bot.action(/delete (.+)/, ctx => {
    const itemToDelete = ctx.match[1]
    lista = lista.filter(item => item !== itemToDelete)
    ctx.replyWithHTML(`<code>${itemToDelete} deletado! 🗑</code>`, gerarBotoes())
    ctx.answerCbQuery()
})

bot.startPolling()