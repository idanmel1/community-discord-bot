const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!kick') || message.content.startsWith('!ban') || message.content.startsWith('!mute')) {
        if (!message.member.roles.cache.has(STAFF_ROLE_ID)) {
            return message.reply('רק חברי צוות יכולים להשתמש בפקודות אלה.');
        }

        const args = message.content.split(' ');
        const target = message.mentions.members.first();

        if (!target) {
            return message.reply('אנא ציין משתמש לפעולה.');
        }

        if (message.content.startsWith('!kick')) {
            try {
                await target.kick('Moderation kick');
                message.reply(`${target.user.tag} kicked from the server.`);
            } catch (error) {
                message.reply('לא ניתן לגרש את המשתמש.');
            }
        }

        if (message.content.startsWith('!ban')) {
            try {
                await target.ban({ reason: 'Moderation ban' });
                message.reply(`${target.user.tag} banned from the server.`);
            } catch (error) {
                message.reply('לא ניתן לאסור את המשתמש.');
            }
        }

        if (message.content.startsWith('!mute')) {
            let muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
            if (!muteRole) {
                try {
                    muteRole = await message.guild.roles.create({
                        name: 'Muted',
                        permissions: [],
                    });

                    message.guild.channels.cache.forEach(async (channel) => {
                        await channel.permissionOverwrites.create(muteRole, {
                            SEND_MESSAGES: false,
                            ADD_REACTIONS: false,
                        });
                    });
                } catch (error) {
                    return message.reply('Error creating mute role.');
                }
            }

            try {
                await target.roles.add(muteRole);
                message.reply(`${target.user.tag} has been muted.`);
            } catch (error) {
                message.reply('לא ניתן להשתיק את המשתמש.');
            }
        }
    }  
});

client.login(YOUR_BOT_TOKEN_HERE);

