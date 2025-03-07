const { 
    Client, 
    GatewayIntentBits, 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder, 
    ComponentType 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const TOKEN = 'your_bot_token_here';
const STAFF_ROLE_ID = 'your_staff_role_id_here';

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    if (message.content.startsWith('!h')) {
        const args = message.content.split(' ').slice(1);
        const reason = args.length ? `📝 **סיבה:**\`${args.join(' ')}\`` : '`סיבה:`לא צווינה סיבה';

        const voiceChannel = message.member.voice.channel;
        const voiceStatus = voiceChannel 
            ? `🔊 **המשתמש נמצא בוויס:** \`${voiceChannel.name}\``
            : '⛔ **המשתמש לא נמצא בוויס**';

        const handleButton = new ButtonBuilder()
            .setCustomId('handle_ticket')
            .setLabel('טפל')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(handleButton);

        const response = await message.channel.send({
        content: `🚨 **צריך את עזרתכם!** | ${message.author} | <@&${STAFF_ROLE_ID}>\n${voiceStatus}\n${reason}`,
            components: [row]
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 24 * 60 * 60 * 1000
        });

        collector.on('collect', async (interaction) => {
            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                await interaction.reply({
                    content: '❌ **רק חברי צוות יכולים לעשות זאת.**',
                    ephemeral: true
                });
                return;
            }

            const handledButton = new ButtonBuilder()
                .setCustomId('handled_ticket')
                .setLabel(`מטופל על ידי ${interaction.user.username}`)
                .setStyle(ButtonStyle.Success)
                .setDisabled(true);

            const newRow = new ActionRowBuilder().addComponents(handledButton);

            await interaction.update({ components: [newRow] });

            collector.stop();
        });
    }
});

client.login(TOKEN);
