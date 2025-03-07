const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});


let userStats = new Map();
    

function initUserStats(userId) {
    if (!userStats.has(userId)) {
        userStats.set(userId, {
            messageCount: 0,
            voiceTime: 0,
            voiceJoinTimestamp: null
        });
    }
}


function scheduleDaily() {
    const now = new Date();
    const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0
    );
    const msToMidnight = night.getTime() - now.getTime();

    setTimeout(() => {
        userStats.clear();
        scheduleDaily();
    }, msToMidnight);
}


function updateVoiceTimes() {
    setInterval(() => {
        const now = Date.now();
        userStats.forEach((stats, userId) => {
            if (stats.voiceJoinTimestamp) {
                stats.voiceTime += now - stats.voiceJoinTimestamp;
                stats.voiceJoinTimestamp = now;
            }
        });
    }, 2 * 60 * 60 * 1000); 
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    scheduleDaily();
    updateVoiceTimes();
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    
    initUserStats(message.author.id);
    userStats.get(message.author.id).messageCount++;

    if (message.content === '!stats') {
        const stats = userStats.get(message.author.id);
        const voiceTimeHours = Math.floor(stats.voiceTime / (1000 * 60 * 60));
        const voiceTimeMinutes = Math.floor((stats.voiceTime % (1000 * 60 * 60)) / (1000 * 60));

        const statsEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Stats for ${message.author.username}`)
            .addFields(
                { name: 'Messages Sent', value: stats.messageCount.toString(), inline: true },
                { name: 'Voice Time', value: `${voiceTimeHours}h ${voiceTimeMinutes}m`, inline: true }
            )
            .setTimestamp();

        message.reply({ embeds: [statsEmbed] });
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    const userId = newState.member.user.id;
    initUserStats(userId);
    
    if (!oldState.channelId && newState.channelId) {
     
        userStats.get(userId).voiceJoinTimestamp = Date.now();
    } else if (oldState.channelId && !newState.channelId) {
     
        const stats = userStats.get(userId);
        if (stats.voiceJoinTimestamp) {
            stats.voiceTime += Date.now() - stats.voiceJoinTimestamp;
            stats.voiceJoinTimestamp = null;
        }
    }
});

client.login(YOUR_BOT_TOKEN_HERE);
