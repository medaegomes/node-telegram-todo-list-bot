// Acessar a variável de ambiente diretamente
const token = process.env.TOKEN; // 'TOKEN' é o nome da variável de ambiente definida no Railway | para puxar do arquivo .env substitua para > const env = require('./.env') <
const bot = new Telegraf(token);
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

// Iniciando mongoose
    const mongoose = require('mongoose');
    main().catch(err => console.log(err)); // Caso a conexão falhe, retorna o erro

    async function main() {
        try {
        await mongoose.connect('mongodb+srv://medaegomes:545wxexIlW4ddZUo@telegram-todolistbot.ytnowgt.mongodb.net/?retryWrites=true&w=majority&appName=Telegram-todolistbot');
        console.log('Connected to MongoDB successfully!');
        } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        }}

// Schema do mongoose
    const userSchema = new mongoose.Schema({
        userId: { type: Number, required: true, unique: true },
        lista: { type: [String], default: [] }
    })

    const User = mongoose.model('User', userSchema)

// Busca ou cria um usuário
    async function findOrCreateUser(userId) {
        let user = await User.findOne({ userId })
        if (!user) {
            user = new User({ userId })
            await user.save()
        }
        return user
    }


// Gera botoes com os itens da lista
    const gerarBotoes = (lista) => Extra.markup(
        Markup.inlineKeyboard(
            lista.map(item => Markup.callbackButton(item, `delete ${item}`)),
            { columns: 3 }
        )
    )

// Iniciando Bot
    bot.start(async ctx => {
        // Identificando usuário e salvando suas informações em constantes
        const userId = ctx.update.message.from.id
        await findOrCreateUser(userId)
        const name = ctx.update.message.from.first_name

        // Retorno para o usuário
        await ctx.reply(`Oii, ${name}!`)
        await ctx.reply('Pronto para começar a sua lista?')
        await ctx.reply('Para adicionar um item na lista, basta digitar e me enviar!')
        await ctx.reply('Para remover clique sobre ele')
        await ctx.replyWithHTML('<a href="https://linktr.ee/daegomes">Clique aqui</a> para conhecer meu criador.', { disable_web_page_preview: true })
    })

    bot.on('text', async ctx => {
        // Caso a mensagem comece com "/" será ignorada
        if (ctx.update.message.text.startsWith('/')) {
            return;
        }

        // Identificando usuário e salvando suas informações em constantes
        const userId = ctx.update.message.from.id
        const user = await findOrCreateUser(userId)

        // Salva o item da lista no banco de dados
        user.lista.push(ctx.update.message.text)
        await user.save()

        // Retorno para o usuário
        await ctx.replyWithHTML(`<code>${ctx.update.message.text} adicionado! ✅</code>`, gerarBotoes(user.lista))
    })



    bot.action(/delete (.+)/, async ctx => {
        // Identificando usuário e salvando suas informações em constantes
        const userId = ctx.update.callback_query.from.id
        const itemToDelete = ctx.match[1]
        const user = await findOrCreateUser(userId)

        // deleta um item da lista
        user.lista = user.lista.filter(item => item !== itemToDelete)
        await user.save()

        // Retorno para o usuário
        await ctx.replyWithHTML(`<code>${itemToDelete} deletado! 🗑</code>`, gerarBotoes(user.lista))
        ctx.answerCbQuery()
    })

    bot.startPolling()