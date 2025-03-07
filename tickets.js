const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ChannelType,
    PermissionsBitField,
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

const tickets = {};

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!tickets') {
        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle('🎟️ פתיחת טיקט')
            .setDescription('בחר את סוג הטיקט למטה')
            .setFooter({ text: 'מערכת טיקטים' });

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_select')
                .setPlaceholder('בחר סוג טיקט')
                .addOptions([
                    { label: 'בחינה לצוות', value: 'בחינה', emoji: '📃' },
                    { label: 'זכייה', value: 'זכיה', emoji: '🎁' },
                    { label: 'תמיכה', value: 'תמיכה', emoji: '🔧' },
                ])
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId === 'ticket_select') {
        const guild = interaction.guild;
        const userId = interaction.user.id;
        const ticketType = interaction.values[0];

        if (tickets[userId]) {
            return interaction.reply({ content: 'כבר יש לך טיקט פתוח!', ephemeral: true });
        }

        try {
            const ticketChannel = await guild.channels.create({
                name: `ticket-${interaction.user.username}-${ticketType}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: guild.roles.everyone.id, deny: ['ViewChannel'] },
                    { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
                ],
            });

            tickets[userId] = ticketChannel.id;
            const embed = new EmbedBuilder()
                .setTitle('🎟️ טיקט פתוח')
                .setDescription(`ברוך הבא ${interaction.user}, זה הטיקט שלך **${ticketType}**!`)
                .setColor('#2b2d31');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('🗑️ סגור טיקט')
                    .setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({ embeds: [embed], components: [row] });
            interaction.reply({ content: `הטיקט שלך נוצר: ${ticketChannel}`, ephemeral: true });
        } catch (error) {
            interaction.reply({ content: 'שגיאה ביצירת הטיקט.', ephemeral: true });
        }
    }

    if (interaction.customId === 'close_ticket') {
        const channelId = interaction.channel.id;
        const ticketOwner = Object.keys(tickets).find((key) => tickets[key] === channelId);

        if (ticketOwner) {
            await interaction.reply({ content: '🗑️ הטיקט נסגר.', ephemeral: true });
            setTimeout(async () => {
                await interaction.channel.delete();
                delete tickets[ticketOwner];
            }, 3000);
        } else {
            interaction.reply({ content: '❌ זה לא ערוץ טיקט!', ephemeral: true });
        }
    }
});

client.login('your_bot_token_here');
