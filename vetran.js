const { Client, GatewayIntentBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField } = require('discord.js');
const TOKEN = 'your_bot_token_here';
const ROLE_ID = 'vetran_role_id_here'; 
const COMMAND_CHANNEL_ID = 'command_channel_id_here'; 
const VETERAN_MIN_AGE = 4 * 30 * 24 * 60 * 60 * 1000; 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== COMMAND_CHANNEL_ID) return;
    if (message.content === '!vt') {
        const text = "your_vetran_messge_here"
        
        const button = new ButtonBuilder()
            .setCustomId('veteran_check')
            .setLabel('בדוק זכאות לווטרן')
            .setStyle(ButtonStyle.Primary);
        
        const row = new ActionRowBuilder().addComponents(button);
        
        await message.channel.send({ content: text, components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'veteran_check') return;

    const member = interaction.member;
    const joinTimestamp = member.joinedTimestamp;
    const currentTime = Date.now();
    const isVeteran = (currentTime - joinTimestamp) >= VETERAN_MIN_AGE;

    if (isVeteran) {
        await interaction.reply({ content: 'אתה זכאי לרול ווטרן, הרול יינתן לך בשניות הקרובות.', ephemeral: true });
        await member.roles.add(ROLE_ID).catch(console.error);
    } else {
        await interaction.reply({ content: 'אתה לא זכאי לרול ווטרן', ephemeral: true });
    }
});

client.login(TOKEN);
