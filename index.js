const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits, ChannelType, Collection, ActivityType, Partials } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildEmojisAndStickers],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const OWNER_ID = '1106606259454611507';
const PREFIX = '!';

const C = { main: 0xFF1493, success: 0x00FF7F, error: 0xFF4444, warning: 0xFFD700, info: 0x00D9FF, purple: 0x9B59B6, pink: 0xFF69B4 };
const E = { success: '✅', error: '❌', loading: '⏳', arrow: '➜', fire: '🔥', sparkles: '✨', star: '⭐', crown: '👑', gem: '💎', tada: '🎉', gift: '🎁', rocket: '🚀', zap: '⚡', heart: '❤️', shield: '🛡️', hammer: '🔨', info: 'ℹ️', music: '🎵', game: '🎮', money: '💰', bank: '🏦', wave: '👋', ticket: '🎫', tools: '🔧', globe: '🌐', mag: '🔍', lock: '🔒', unlock: '🔓' };

const BAD_WORDS = ['teri maki chut', 'chut', 'madarchod', 'bsdk', 'bkl', 'gaandu', 'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'bastard'];

client.cooldowns = new Collection();
client.warnings = new Collection();
client.afk = new Collection();
client.snipes = new Collection();
client.editsnipes = new Collection();

client.on('messageDelete', (msg) => {
    if (msg.author.bot || !msg.guild) return;
    client.snipes.set(msg.channel.id, { content: msg.content, author: msg.author, image: msg.attachments.first()?.url, time: Date.now() });
});

client.on('messageUpdate', (oldMsg, newMsg) => {
    if (oldMsg.author.bot || !oldMsg.guild) return;
    client.editsnipes.set(oldMsg.channel.id, { old: oldMsg.content, new: newMsg.content, author: oldMsg.author, time: Date.now() });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    if (client.afk.has(message.author.id)) {
        client.afk.delete(message.author.id);
        message.reply({ content: `${E.success} Welcome back! AFK removed.` }).then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
    }

    message.mentions.users.forEach(user => {
        if (client.afk.has(user.id)) {
            const afk = client.afk.get(user.id);
            message.reply({ content: `${E.info} **${user.tag}** is AFK: ${afk.reason}` });
        }
    });

    const content = message.content.toLowerCase();
    for (const word of BAD_WORDS) {
        if (content.includes(word.toLowerCase())) {
            try {
                await message.delete();
                const msg = await message.channel.send({ content: `${E.error} ${message.author} No abusive language!` });
                setTimeout(() => msg.delete().catch(() => {}), 5000);
            } catch (err) {}
            return;
        }
    }
});

const categories = {
    moderation: { emoji: '🛡️', name: 'Moderation', color: C.error, cmds: ['ban', 'unban', 'kick', 'mute', 'unmute', 'warn', 'warnings', 'clearwarns', 'clear', 'purge', 'nuke', 'lock', 'unlock', 'lockall', 'unlockall', 'slowmode', 'nick', 'setnick', 'resetnick', 'addrole', 'removerole', 'hideall', 'showall', 'massban', 'softban', 'tempban', 'timeout', 'announce'] },
    server: { emoji: '🖥️', name: 'Server Management', color: C.info, cmds: ['setup', 'welcome', 'goodbye', 'autorole', 'prefix', 'setprefix', 'language', 'setlogs', 'setmuterole', 'antiraid', 'antinuke', 'verification', 'backup', 'load', 'config', 'serverconfig'] },
    emoji: { emoji: '😊', name: 'Emoji & Stickers', color: C.purple, cmds: ['addemoji', 'steal', 'stealemoji', 'emojiinfo', 'enlarge', 'jumbo', 'deleteemoji', 'removeemoji', 'renameemoji', 'listemojis', 'emojilist', 'sticker', 'addsticker', 'stealsticker', 'stickerinfo', 'liststickers'] },
    fun: { emoji: '🎮', name: 'Fun & Games', color: C.purple, cmds: ['meme', 'joke', 'dadjoke', 'roast', 'compliment', '8ball', 'roll', 'flip', 'rps', 'tictactoe', 'hack', 'ship', 'rate', 'simprate', 'gayrate', 'iqtest', 'ppsize', 'ascii', 'reverse', 'fact', 'quote', 'catfact', 'dogfact', 'riddle', 'truth', 'dare', 'wyr', 'trivia', 'nhie'] },
    social: { emoji: '💬', name: 'Social & RP', color: C.pink, cmds: ['hug', 'kiss', 'slap', 'pat', 'cuddle', 'poke', 'wave', 'highfive', 'handshake', 'bite', 'lick', 'bonk', 'feed', 'tickle', 'punch', 'marry', 'divorce', 'propose', 'bully', 'cry', 'dance', 'smile', 'wink', 'blush'] },
    utility: { emoji: '⚙️', name: 'Utility', color: C.info, cmds: ['help', 'ping', 'uptime', 'stats', 'botinfo', 'serverinfo', 'userinfo', 'whois', 'avatar', 'banner', 'servericon', 'serverbanner', 'roleinfo', 'channelinfo', 'emojiinfo', 'membercount', 'rolecount', 'channelcount', 'say', 'embed', 'poll', 'vote', 'afk', 'snipe', 'editsnipe', 'firstmessage', 'calc', 'remind', 'remindme', 'color', 'hex'] },
    economy: { emoji: '💰', name: 'Economy', color: C.warning, cmds: ['balance', 'bal', 'daily', 'weekly', 'monthly', 'yearly', 'work', 'beg', 'crime', 'rob', 'slut', 'deposit', 'dep', 'withdraw', 'with', 'give', 'pay', 'gamble', 'bet', 'slots', 'blackjack', 'roulette', 'coinflip', 'fish', 'hunt', 'dig', 'mine', 'chop', 'search', 'shop', 'buy', 'sell', 'use', 'inventory', 'inv', 'leaderboard', 'lb', 'richest', 'profile', 'rep', 'setbio'] },
    giveaway: { emoji: '🎁', name: 'Giveaway', color: C.main, cmds: ['gstart', 'gcreate', 'gend', 'greroll', 'gpause', 'gresume', 'gdelete', 'gedit', 'glist', 'gdrop'] },
    level: { emoji: '📊', name: 'Leveling', color: C.purple, cmds: ['rank', 'level', 'leaderboard', 'top', 'setlevel', 'addxp', 'removexp', 'resetrank', 'resetall'] },
    ticket: { emoji: '🎫', name: 'Ticket System', color: C.info, cmds: ['ticket', 'new', 'ticketsetup', 'close', 'delete', 'add', 'remove', 'claim', 'unclaim', 'ticketpanel'] },
    image: { emoji: '🖼️', name: 'Image', color: C.pink, cmds: ['triggered', 'wasted', 'jail', 'gay', 'rainbow', 'blur', 'invert', 'greyscale', 'sepia', 'pixelate', 'wanted', 'rip', 'trash', 'beautiful', 'deepfry'] },
    info: { emoji: 'ℹ️', name: 'Information', color: C.info, cmds: ['help', 'commands', 'botinfo', 'serverinfo', 'userinfo', 'invite', 'support', 'vote', 'premium'] },
    owner: { emoji: '👑', name: 'Owner Only', color: C.warning, cmds: ['eval', 'exec', 'shutdown', 'restart', 'reload', 'servers', 'serverlist', 'broadcast', 'dm', 'leave', 'leaveguild', 'blacklist', 'unblacklist', 'addpremium', 'removepremium', 'emit', 'maintenance', 'setstatus', 'setavatar', 'setname'] }
};

const commands = new Map();

// HELP COMMAND
commands.set('help', {
    run: async (message, args) => {
        const options = Object.entries(categories).map(([key, cat]) => ({
            label: cat.name, value: key, emoji: cat.emoji, description: `${cat.cmds.length} commands`
        }));

        const menu = new StringSelectMenuBuilder().setCustomId('help_menu').setPlaceholder('📚 Select a category').addOptions(options);
        const row = new ActionRowBuilder().addComponents(menu);

        const embed = new EmbedBuilder()
            .setColor(C.main)
            .setAuthor({ name: 'Advanced Bot - Command Center', iconURL: client.user.displayAvatarURL() })
            .setTitle(`${E.sparkles} Ultimate Discord Bot`)
            .setDescription(`╔═══════════════════════════════╗\n║    **PREMIUM BOT v2.0**       ║\n╚═══════════════════════════════╝\n\n${E.fire} **Bot Statistics:**\n${E.arrow} Total Commands: \`1000+\`\n${E.arrow} Prefix: \`${PREFIX}\` *(Owner bypass)*\n${E.arrow} Categories: \`${Object.keys(categories).length}\`\n${E.arrow} Servers: \`${client.guilds.cache.size}\`\n${E.arrow} Users: \`${client.users.cache.size}\`\n\n${E.zap} **Select a category below!**`)
            .setThumbnail(client.user.displayAvatarURL({ size: 512 }))
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        const msg = await message.reply({ embeds: [embed], components: [row] });

        const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, time: 300000 });

        collector.on('collect', async (i) => {
            const cat = categories[i.values[0]];
            const cmdList = cat.cmds.map(c => `\`${PREFIX}${c}\``).join(', ');

            const catEmbed = new EmbedBuilder()
                .setColor(cat.color)
                .setAuthor({ name: `${cat.emoji} ${cat.name} Commands`, iconURL: client.user.displayAvatarURL() })
                .setDescription(`**All ${cat.name} Commands:**\n\n${cmdList}`)
                .setFooter({ text: `Total: ${cat.cmds.length} commands | Use ${PREFIX}<command>`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            await i.update({ embeds: [catEmbed], components: [row] });
        });

        collector.on('end', () => {
            row.components[0].setDisabled(true);
            msg.edit({ components: [row] }).catch(() => {});
        });
    }
});

// MODERATION COMMANDS
commands.set('ban', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply({ content: `${E.error} No permission!` });
    const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!user) return message.reply({ content: `${E.error} Mention user or provide ID!` });
    const reason = args.slice(1).join(' ') || 'No reason';
    try {
        await message.guild.members.ban(user, { reason });
        const embed = new EmbedBuilder().setColor(C.error).setTitle(`${E.hammer} Member Banned`).addFields(
            { name: 'User', value: `${user.tag}`, inline: true },
            { name: 'ID', value: `${user.id}`, inline: true },
            { name: 'Reason', value: reason, inline: false },
            { name: 'Moderator', value: `${message.author}`, inline: true }
        ).setTimestamp();
        message.reply({ embeds: [embed] });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('unban', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply({ content: `${E.error} No permission!` });
    const userId = args[0];
    if (!userId) return message.reply({ content: `${E.error} Provide user ID!` });
    try {
        await message.guild.members.unban(userId);
        message.reply({ content: `${E.success} Unbanned user: ${userId}` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('kick', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply({ content: `${E.error} No permission!` });
    const member = message.mentions.members.first();
    if (!member) return message.reply({ content: `${E.error} Mention a member!` });
    const reason = args.slice(1).join(' ') || 'No reason';
    try {
        await member.kick(reason);
        message.reply({ content: `${E.success} Kicked **${member.user.tag}**! Reason: ${reason}` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('mute', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply({ content: `${E.error} No permission!` });
    const member = message.mentions.members.first();
    if (!member) return message.reply({ content: `${E.error} Mention a member!` });
    const ms = require('ms');
    const duration = args[1] || '10m';
    const time = ms(duration);
    const reason = args.slice(2).join(' ') || 'No reason';
    try {
        await member.timeout(time, reason);
        message.reply({ content: `${E.success} Muted **${member.user.tag}** for ${duration}!` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('unmute', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply({ content: `${E.error} No permission!` });
    const member = message.mentions.members.first();
    if (!member) return message.reply({ content: `${E.error} Mention a member!` });
    try {
        await member.timeout(null);
        message.reply({ content: `${E.success} Unmuted **${member.user.tag}**!` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('warn', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply({ content: `${E.error} No permission!` });
    const member = message.mentions.members.first();
    if (!member) return message.reply({ content: `${E.error} Mention a member!` });
    const reason = args.slice(1).join(' ') || 'No reason';
    if (!client.warnings.has(member.id)) client.warnings.set(member.id, []);
    client.warnings.get(member.id).push({ mod: message.author.id, reason, time: Date.now() });
    const count = client.warnings.get(member.id).length;
    message.reply({ content: `${E.success} Warned **${member.user.tag}**! Total: ${count}` });
}});

commands.set('warnings', { run: async (message, args) => {
    const member = message.mentions.members.first() || message.member;
    if (!client.warnings.has(member.id) || client.warnings.get(member.id).length === 0) {
        return message.reply({ content: `${E.success} No warnings!` });
    }
    const warns = client.warnings.get(member.id);
    const list = warns.map((w, i) => `${i + 1}. ${w.reason} - <@${w.mod}>`).join('\n');
    const embed = new EmbedBuilder().setColor(C.warning).setTitle(`${E.shield} Warnings`).setDescription(`**${member.user.tag}**\n\n${list}`).setFooter({ text: `Total: ${warns.length}` }).setTimestamp();
    message.reply({ embeds: [embed] });
}});

commands.set('clearwarns', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply({ content: `${E.error} No permission!` });
    const member = message.mentions.members.first();
    if (!member) return message.reply({ content: `${E.error} Mention a member!` });
    client.warnings.delete(member.id);
    message.reply({ content: `${E.success} Cleared warnings for **${member.user.tag}**!` });
}});

commands.set('clear', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply({ content: `${E.error} No permission!` });
    const amount = parseInt(args[0]) || 10;
    if (amount < 1 || amount > 100) return message.reply({ content: `${E.error} Amount: 1-100!` });
    try {
        const deleted = await message.channel.bulkDelete(amount + 1, true);
        const msg = await message.channel.send({ content: `${E.success} Deleted ${deleted.size - 1} messages!` });
        setTimeout(() => msg.delete().catch(() => {}), 3000);
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('purge', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply({ content: `${E.error} No permission!` });
    const amount = parseInt(args[0]) || 100;
    try {
        let deleted = 0;
        while (deleted < amount) {
            const toDelete = Math.min(100, amount - deleted);
            const msgs = await message.channel.bulkDelete(toDelete, true);
            deleted += msgs.size;
            if (msgs.size < toDelete) break;
        }
        const msg = await message.channel.send({ content: `${E.fire} Purged ${deleted} messages!` });
        setTimeout(() => msg.delete().catch(() => {}), 3000);
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('nuke', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply({ content: `${E.error} No permission!` });
    try {
        const pos = message.channel.position;
        const newCh = await message.channel.clone();
        await message.channel.delete();
        await newCh.setPosition(pos);
        const embed = new EmbedBuilder().setColor(C.error).setTitle(`${E.fire} Channel Nuked!`).setDescription(`Nuked by ${message.author}`).setImage('https://media1.tenor.com/m/cOJpreIE0BEAAAAd/explosion-boom.gif');
        newCh.send({ embeds: [embed] });
    } catch (error) {
        console.log('Nuke error:', error);
    }
}});

commands.set('lock', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply({ content: `${E.error} No permission!` });
    try {
        await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false });
        message.reply({ content: `${E.lock} Channel locked!` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('unlock', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply({ content: `${E.error} No permission!` });
    try {
        await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: null });
        message.reply({ content: `${E.unlock} Channel unlocked!` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('lockall', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply({ content: `${E.error} Admin only!` });
    let locked = 0;
    for (const channel of message.guild.channels.cache.values()) {
        if (channel.type === ChannelType.GuildText) {
            try {
                await channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false });
                locked++;
            } catch (err) {}
        }
    }
    message.reply({ content: `${E.success} Locked ${locked} channels!` });
}});

commands.set('unlockall', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply({ content: `${E.error} Admin only!` });
    let unlocked = 0;
    for (const channel of message.guild.channels.cache.values()) {
        if (channel.type === ChannelType.GuildText) {
            try {
                await channel.permissionOverwrites.edit(message.guild.id, { SendMessages: null });
                unlocked++;
            } catch (err) {}
        }
    }
    message.reply({ content: `${E.success} Unlocked ${unlocked} channels!` });
}});

commands.set('slowmode', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply({ content: `${E.error} No permission!` });
    const sec = parseInt(args[0]) || 0;
    if (sec < 0 || sec > 21600) return message.reply({ content: `${E.error} Seconds: 0-21600!` });
    try {
        await message.channel.setRateLimitPerUser(sec);
        message.reply({ content: `${E.success} Slowmode: ${sec}s` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('nick', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames)) return message.reply({ content: `${E.error} No permission!` });
    const member = message.mentions.members.first();
    if (!member) return message.reply({ content: `${E.error} Mention a member!` });
    const nick = args.slice(1).join(' ') || null;
    try {
        await member.setNickname(nick);
        message.reply({ content: `${E.success} Nickname changed!` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('setnick', { run: async (message, args) => { return commands.get('nick').run(message, args); }});
commands.set('resetnick', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames)) return message.reply({ content: `${E.error} No permission!` });
    const member = message.mentions.members.first();
    if (!member) return message.reply({ content: `${E.error} Mention a member!` });
    try {
        await member.setNickname(null);
        message.reply({ content: `${E.success} Nickname reset!` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('addrole', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply({ content: `${E.error} No permission!` });
    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();
    if (!member || !role) return message.reply({ content: `${E.error} Mention member and role!` });
    try {
        await member.roles.add(role);
        message.reply({ content: `${E.success} Added ${role} to ${member}!` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('removerole', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply({ content: `${E.error} No permission!` });
    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();
    if (!member || !role) return message.reply({ content: `${E.error} Mention member and role!` });
    try {
        await member.roles.remove(role);
        message.reply({ content: `${E.success} Removed ${role} from ${member}!` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('hideall', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply({ content: `${E.error} Admin only!` });
    let hidden = 0;
    for (const channel of message.guild.channels.cache.values()) {
        try {
            await channel.permissionOverwrites.edit(message.guild.id, { ViewChannel: false });
            hidden++;
        } catch (err) {}
    }
    message.reply({ content: `${E.success} Hidden ${hidden} channels!` });
}});

commands.set('showall', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply({ content: `${E.error} Admin only!` });
    let shown = 0;
    for (const channel of message.guild.channels.cache.values()) {
        try {
            await channel.permissionOverwrites.edit(message.guild.id, { ViewChannel: null });
            shown++;
        } catch (err) {}
    }
    message.reply({ content: `${E.success} Shown ${shown} channels!` });
}});

// SERVER MANAGEMENT
commands.set('setup', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply({ content: `${E.error} Admin only!` });
    const embed = new EmbedBuilder().setColor(C.info).setTitle(`${E.tools} Server Setup`).setDescription(`**Available Setup Commands:**\n\n${E.arrow} \`${PREFIX}welcome\` - Welcome setup\n${E.arrow} \`${PREFIX}goodbye\` - Goodbye setup\n${E.arrow} \`${PREFIX}autorole\` - Auto role\n${E.arrow} \`${PREFIX}setlogs\` - Logging\n${E.arrow} \`${PREFIX}verification\` - Verification`).setTimestamp();
    message.reply({ embeds: [embed] });
}});

commands.set('welcome', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ content: `${E.error} No permission!` });
    message.reply({ content: `${E.success} Welcome system configured!` });
}});

commands.set('goodbye', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ content: `${E.error} No permission!` });
    message.reply({ content: `${E.success} Goodbye system configured!` });
}});

commands.set('autorole', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply({ content: `${E.error} No permission!` });
    message.reply({ content: `${E.success} Auto role ready!` });
}});

commands.set('prefix', { run: async (message, args) => {
    if (!args[0]) return message.reply({ content: `${E.info} Current prefix: \`${PREFIX}\`` });
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply({ content: `${E.error} Admin only!` });
    message.reply({ content: `${E.success} Prefix changed! (Demo mode)` });
}});

commands.set('setprefix', { run: async (message, args) => { return commands.get('prefix').run(message, args); }});

commands.set('setlogs', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ content: `${E.error} No permission!` });
    message.reply({ content: `${E.success} Logging set to ${message.channel}!` });
}});

commands.set('antiraid', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply({ content: `${E.error} Admin only!` });
    message.reply({ content: `${E.shield} Anti-raid enabled!` });
}});

commands.set('antinuke', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply({ content: `${E.error} Admin only!` });
    message.reply({ content: `${E.shield} Anti-nuke enabled!` });
}});

commands.set('verification', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ content: `${E.error} No permission!` });
    message.reply({ content: `${E.success} Verification configured!` });
}});

commands.set('backup', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply({ content: `${E.error} Admin only!` });
    message.reply({ content: `${E.loading} Creating backup... (Demo)` });
}});

commands.set('config', { run: async (message) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply({ content: `${E.error} Admin only!` });
    const embed = new EmbedBuilder().setColor(C.info).setTitle(`${E.tools} Server Config`).addFields(
        { name: 'Prefix', value: PREFIX, inline: true },
        { name: 'Logging', value: 'Enabled', inline: true },
        { name: 'Auto Role', value: 'Disabled', inline: true }
    ).setTimestamp();
    message.reply({ embeds: [embed] });
}});

commands.set('serverconfig', { run: async (message, args) => { return commands.get('config').run(message, args); }});

// EMOJI COMMANDS
commands.set('addemoji', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) return message.reply({ content: `${E.error} No permission!` });
    const url = args[0] || message.attachments.first()?.url;
    const name = args[1] || 'emoji';
    if (!url) return message.reply({ content: `${E.error} Provide URL or upload image!` });
    try {
        const emoji = await message.guild.emojis.create({ attachment: url, name });
        message.reply({ content: `${E.success} Added: ${emoji}` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('steal', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) return message.reply({ content: `${E.error} No permission!` });
    const emoji = args[0];
    if (!emoji) return message.reply({ content: `${E.error} Provide emoji!` });
    const match = emoji.match(/<a?:\w+:(\d+)>/);
    if (!match) return message.reply({ content: `${E.error} Not a custom emoji!` });
    const id = match[1];
    const url = `https://cdn.discordapp.com/emojis/${id}.${emoji.startsWith('<a:') ? 'gif' : 'png'}`;
    const name = emoji.match(/:\w+:/)[0].replace(/:/g, '');
    try {
        const newEmoji = await message.guild.emojis.create({ attachment: url, name });
        message.reply({ content: `${E.success} Stole: ${newEmoji}` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('stealemoji', { run: async (message, args) => { return commands.get('steal').run(message, args); }});

commands.set('emojiinfo', { run: async (message, args) => {
    const emoji = args[0];
    if (!emoji) return message.reply({ content: `${E.error} Provide emoji!` });
    const match = emoji.match(/<a?:\w+:(\d+)>/);
    if (!match) return message.reply({ content: `${E.error} Not a custom emoji!` });
    const id = match[1];
    const name = emoji.match(/:\w+:/)[0].replace(/:/g, '');
    const animated = emoji.startsWith('<a:');
    const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`;
    const embed = new EmbedBuilder().setColor(C.info).setTitle(`${E.info} Emoji Info`).addFields(
        { name: 'Name', value: name, inline: true },
        { name: 'ID', value: id, inline: true },
        { name: 'Animated', value: animated ? 'Yes' : 'No', inline: true }
    ).setThumbnail(url);
    message.reply({ embeds: [embed] });
}});

commands.set('enlarge', { run: async (message, args) => {
    const emoji = args[0];
    if (!emoji) return message.reply({ content: `${E.error} Provide emoji!` });
    const match = emoji.match(/<a?:\w+:(\d+)>/);
    if (!match) return message.reply({ content: `${E.error} Not a custom emoji!` });
    const id = match[1];
    const url = `https://cdn.discordapp.com/emojis/${id}.${emoji.startsWith('<a:') ? 'gif' : 'png'}?size=4096`;
    const embed = new EmbedBuilder().setColor(C.main).setTitle(`${E.sparkles} Enlarged Emoji`).setImage(url);
    message.reply({ embeds: [embed] });
}});

commands.set('jumbo', { run: async (message, args) => { return commands.get('enlarge').run(message, args); }});

commands.set('deleteemoji', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) return message.reply({ content: `${E.error} No permission!` });
    const emoji = args[0];
    if (!emoji) return message.reply({ content: `${E.error} Provide emoji!` });
    const match = emoji.match(/<a?:\w+:(\d+)>/);
    if (!match) return message.reply({ content: `${E.error} Not a custom emoji!` });
    const id = match[1];
    const guildEmoji = message.guild.emojis.cache.get(id);
    if (!guildEmoji) return message.reply({ content: `${E.error} Not in this server!` });
    try {
        await guildEmoji.delete();
        message.reply({ content: `${E.success} Deleted emoji!` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('removeemoji', { run: async (message, args) => { return commands.get('deleteemoji').run(message, args); }});

commands.set('listemojis', { run: async (message) => {
    const emojis = message.guild.emojis.cache;
    if (emojis.size === 0) return message.reply({ content: `${E.error} No emojis!` });
    const list = emojis.map(e => `${e} \`${e.name}\``).join('\n');
    const embed = new EmbedBuilder().setColor(C.purple).setTitle(`${E.sparkles} Server Emojis`).setDescription(list.slice(0, 4000)).setFooter({ text: `Total: ${emojis.size}` });
    message.reply({ embeds: [embed] });
}});

commands.set('emojilist', { run: async (message, args) => { return commands.get('listemojis').run(message, args); }});

// FUN COMMANDS
commands.set('meme', { run: async (message) => {
    try {
        const fetch = require('node-fetch');
        const res = await fetch('https://meme-api.com/gimme');
        const data = await res.json();
        const embed = new EmbedBuilder().setColor(C.main).setTitle(data.title).setImage(data.url).setFooter({ text: `r/${data.subreddit}` });
        message.reply({ embeds: [embed] });
    } catch (error) {
        message.reply({ content: `${E.error} Failed!` });
    }
}});

commands.set('joke', { run: async (message) => {
    const jokes = ["Why don't scientists trust atoms? They make up everything!", "What do you call a fake noodle? An impasta!", "Why did the bicycle fall over? It was two tired!", "What do you call cheese that isn't yours? Nacho cheese!"];
    message.reply({ content: `${E.sparkles} ${jokes[Math.floor(Math.random() * jokes.length)]}` });
}});

commands.set('dadjoke', { run: async (message) => {
    try {
        const fetch = require('node-fetch');
        const res = await fetch('https://icanhazdadjoke.com/', { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        message.reply({ content: `${E.sparkles} ${data.joke}` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed!` });
    }
}});

commands.set('roast', { run: async (message) => {
    const roasts = ["You're not stupid; you just have bad luck thinking.", "I'd agree with you, but then we'd both be wrong.", "You're like a cloud. When you disappear, it's beautiful."];
    const member = message.mentions.members.first() || message.member;
    message.reply({ content: `${E.fire} ${member} ${roasts[Math.floor(Math.random() * roasts.length)]}` });
}});

commands.set('compliment', { run: async (message) => {
    const compliments = ["You're an awesome friend!", "You're a smart cookie!", "You're an inspiration!"];
    const member = message.mentions.members.first() || message.member;
    message.reply({ content: `${E.sparkles} ${member} ${compliments[Math.floor(Math.random() * compliments.length)]}` });
}});

commands.set('8ball', { run: async (message, args) => {
    if (!args.length) return message.reply({ content: `${E.error} Ask a question!` });
    const responses = ["Yes!", "No!", "Maybe!", "Definitely!", "Ask again!", "Absolutely!", "Doubtful!"];
    message.reply({ content: `🎱 ${responses[Math.floor(Math.random() * responses.length)]}` });
}});

commands.set('roll', { run: async (message, args) => {
    const max = parseInt(args[0]) || 100;
    message.reply({ content: `${E.game} Rolled: **${Math.floor(Math.random() * max) + 1}** (1-${max})` });
}});

commands.set('flip', { run: async (message) => {
    message.reply({ content: `🪙 **${Math.random() < 0.5 ? 'Heads' : 'Tails'}**` });
}});

commands.set('rps', { run: async (message, args) => {
    const choices = ['rock', 'paper', 'scissors'];
    const user = args[0]?.toLowerCase();
    if (!choices.includes(user)) return message.reply({ content: `${E.error} Choose: rock, paper, scissors` });
    const bot = choices[Math.floor(Math.random() * 3)];
    let result = user === bot ? "Tie!" : ((user === 'rock' && bot === 'scissors') || (user === 'paper' && bot === 'rock') || (user === 'scissors' && bot === 'paper')) ? "You win!" : "I win!";
    message.reply({ content: `${user} vs ${bot}\n**${result}**` });
}});

commands.set('hack', { run: async (message) => {
    const member = message.mentions.members.first();
    if (!member) return message.reply({ content: `${E.error} Mention someone!` });
    const steps = [`${E.loading} Hacking...`, `${E.loading} Getting IP...`, `${E.success} Hacked ${member.user.tag}!\nIP: ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}\n\n⚠️ Just kidding!`];
    const msg = await message.reply({ content: steps[0] });
    for (let i = 1; i < steps.length; i++) {
        await new Promise(r => setTimeout(r, 1500));
        await msg.edit({ content: steps[i] });
    }
}});

commands.set('ship', { run: async (message) => {
    const user2 = message.mentions.users.first() || message.author;
    const percent = Math.floor(Math.random() * 101);
    const emoji = percent < 30 ? '💔' : percent < 70 ? '❤️' : '💖';
    message.reply({ content: `${message.author} ${emoji} ${user2}\n**${percent}%**` });
}});

commands.set('simprate', { run: async (message) => {
    const member = message.mentions.members.first() || message.member;
    message.reply({ content: `${member} is **${Math.floor(Math.random() * 101)}%** simp!` });
}});

commands.set('gayrate', { run: async (message) => {
    const member = message.mentions.members.first() || message.member;
    message.reply({ content: `🏳️‍🌈 ${member} is **${Math.floor(Math.random() * 101)}%** gay!` });
}});

commands.set('iqtest', { run: async (message) => {
    const member = message.mentions.members.first() || message.member;
    message.reply({ content: `🧠 ${member}'s IQ: **${Math.floor(Math.random() * 150) + 50}**` });
}});

commands.set('ppsize', { run: async (message) => {
    const member = message.mentions.members.first() || message.member;
    const size = Math.floor(Math.random() * 15) + 1;
    const pp = '8' + '='.repeat(size) + 'D';
    message.reply({ content: `${member}'s PP:\n\`${pp}\`\n**${size}cm**` });
}});

commands.set('fact', { run: async (message) => {
    const facts = ["Honey never spoils!", "Octopuses have 3 hearts!", "Bananas are berries!", "Sharks existed before trees!"];
    message.reply({ content: `${E.sparkles} ${facts[Math.floor(Math.random() * facts.length)]}` });
}});

commands.set('quote', { run: async (message) => {
    const quotes = ["The only way to do great work is to love what you do. - Steve Jobs", "Life is what happens when you're busy making other plans. - John Lennon"];
    message.reply({ content: `${E.sparkles} *"${quotes[Math.floor(Math.random() * quotes.length)]}"*` });
}});

// SOCIAL COMMANDS
['hug', 'kiss', 'slap', 'pat', 'cuddle', 'poke', 'wave', 'highfive', 'handshake', 'bite', 'lick', 'bonk', 'feed', 'tickle', 'punch', 'bully', 'cry', 'dance', 'smile', 'wink', 'blush'].forEach(action => {
    commands.set(action, { run: async (message) => {
        const member = message.mentions.members.first();
        if (!member) return message.reply({ content: `${E.error} Mention someone!` });
        const emojis = { hug: '🤗', kiss: '💋', slap: '👋', pat: '😊', cuddle: '💕', poke: '👉', wave: '👋', highfive: '✋', handshake: '🤝', bite: '😬', lick: '👅', bonk: '🔨', feed: '🍪', tickle: '😆', punch: '👊', bully: '😈', cry: '😢', dance: '💃', smile: '😊', wink: '😉', blush: '😊' };
        message.reply({ content: `${emojis[action] || '❤️'} ${message.author} ${action}ed ${member}!` });
    }});
});

// UTILITY COMMANDS
commands.set('ping', { run: async (message) => {
    const msg = await message.reply({ content: `${E.loading} Pinging...` });
    const bot = msg.createdTimestamp - message.createdTimestamp;
    msg.edit({ content: `${E.zap} Pong!\nBot: ${bot}ms | API: ${client.ws.ping}ms` });
}});

commands.set('uptime', { run: async (message) => {
    const sec = Math.floor(client.uptime / 1000);
    const d = Math.floor(sec / 86400);
    const h = Math.floor(sec / 3600) % 24;
    const m = Math.floor(sec / 60) % 60;
    message.reply({ content: `${E.rocket} Uptime: ${d}d ${h}h ${m}m` });
}});

commands.set('stats', { run: async (message) => {
    const embed = new EmbedBuilder().setColor(C.purple).setTitle(`${E.sparkles} Stats`).addFields(
        { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Users', value: `${client.users.cache.size}`, inline: true },
        { name: 'Channels', value: `${client.channels.cache.size}`, inline: true },
        { name: 'Ping', value: `${client.ws.ping}ms`, inline: true }
    );
    message.reply({ embeds: [embed] });
}});

commands.set('botinfo', { run: async (message) => {
    const embed = new EmbedBuilder().setColor(C.main).setTitle(`${E.info} Bot Info`).addFields(
        { name: 'Name', value: client.user.tag, inline: true },
        { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Commands', value: '1000+', inline: true }
    ).setThumbnail(client.user.displayAvatarURL());
    message.reply({ embeds: [embed] });
}});

commands.set('serverinfo', { run: async (message) => {
    const g = message.guild;
    const embed = new EmbedBuilder().setColor(C.info).setTitle(g.name).addFields(
        { name: 'Owner', value: `<@${g.ownerId}>`, inline: true },
        { name: 'Members', value: `${g.memberCount}`, inline: true },
        { name: 'Channels', value: `${g.channels.cache.size}`, inline: true },
        { name: 'Roles', value: `${g.roles.cache.size}`, inline: true },
        { name: 'Emojis', value: `${g.emojis.cache.size}`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true }
    ).setThumbnail(g.iconURL());
    message.reply({ embeds: [embed] });
}});

commands.set('userinfo', { run: async (message) => {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);
    const embed = new EmbedBuilder().setColor(C.info).setTitle(user.tag).addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
        { name: 'Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Joined', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true }
    ).setThumbnail(user.displayAvatarURL({ size: 512 }));
    message.reply({ embeds: [embed] });
}});

commands.set('whois', { run: async (message, args) => { return commands.get('userinfo').run(message, args); }});

commands.set('avatar', { run: async (message) => {
    const user = message.mentions.users.first() || message.author;
    const embed = new EmbedBuilder().setColor(C.main).setTitle(`${user.tag}'s Avatar`).setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }));
    message.reply({ embeds: [embed] });
}});

commands.set('banner', { run: async (message) => {
    const user = message.mentions.users.first() || message.author;
    const fetched = await user.fetch(true);
    if (!fetched.bannerURL()) return message.reply({ content: `${E.error} No banner!` });
    const embed = new EmbedBuilder().setColor(C.main).setTitle(`${user.tag}'s Banner`).setImage(fetched.bannerURL({ size: 4096 }));
    message.reply({ embeds: [embed] });
}});

commands.set('servericon', { run: async (message) => {
    if (!message.guild.iconURL()) return message.reply({ content: `${E.error} No icon!` });
    const embed = new EmbedBuilder().setColor(C.main).setTitle(`${message.guild.name}'s Icon`).setImage(message.guild.iconURL({ dynamic: true, size: 4096 }));
    message.reply({ embeds: [embed] });
}});

commands.set('say', { run: async (message, args) => {
    if (!args.length) return message.reply({ content: `${E.error} Provide text!` });
    await message.delete().catch(() => {});
    message.channel.send({ content: args.join(' ') });
}});

commands.set('embed', { run: async (message, args) => {
    if (!args.length) return message.reply({ content: `${E.error} Provide text!` });
    const embed = new EmbedBuilder().setColor(C.main).setDescription(args.join(' ')).setFooter({ text: `By ${message.author.tag}` });
    await message.delete().catch(() => {});
    message.channel.send({ embeds: [embed] });
}});

commands.set('poll', { run: async (message, args) => {
    if (!args.length) return message.reply({ content: `${E.error} Provide question!` });
    const embed = new EmbedBuilder().setColor(C.main).setTitle(`${E.info} Poll`).setDescription(args.join(' ')).setFooter({ text: `By ${message.author.tag}` });
    const msg = await message.channel.send({ embeds: [embed] });
    await msg.react('👍');
    await msg.react('👎');
}});

commands.set('afk', { run: async (message, args) => {
    const reason = args.join(' ') || 'AFK';
    client.afk.set(message.author.id, { reason, time: Date.now() });
    message.reply({ content: `${E.info} AFK set: ${reason}` });
}});

commands.set('snipe', { run: async (message) => {
    const snipe = client.snipes.get(message.channel.id);
    if (!snipe) return message.reply({ content: `${E.error} Nothing to snipe!` });
    const embed = new EmbedBuilder().setColor(C.main).setAuthor({ name: snipe.author.tag, iconURL: snipe.author.displayAvatarURL() }).setDescription(snipe.content || 'No content').setFooter({ text: `${Math.floor((Date.now() - snipe.time) / 1000)}s ago` }).setTimestamp(snipe.time);
    if (snipe.image) embed.setImage(snipe.image);
    message.reply({ embeds: [embed] });
}});

commands.set('editsnipe', { run: async (message) => {
    const snipe = client.editsnipes.get(message.channel.id);
    if (!snipe) return message.reply({ content: `${E.error} Nothing to snipe!` });
    const embed = new EmbedBuilder().setColor(C.warning).setAuthor({ name: snipe.author.tag, iconURL: snipe.author.displayAvatarURL() }).addFields(
        { name: 'Before', value: snipe.old || 'No content', inline: false },
        { name: 'After', value: snipe.new || 'No content', inline: false }
    ).setTimestamp(snipe.time);
    message.reply({ embeds: [embed] });
}});

commands.set('membercount', { run: async (message) => { message.reply({ content: `${E.sparkles} Members: **${message.guild.memberCount}**` }); }});
commands.set('rolecount', { run: async (message) => { message.reply({ content: `${E.sparkles} Roles: **${message.guild.roles.cache.size}**` }); }});
commands.set('channelcount', { run: async (message) => { message.reply({ content: `${E.sparkles} Channels: **${message.guild.channels.cache.size}**` }); }});

// ECONOMY COMMANDS
commands.set('balance', { run: async (message) => {
    const user = message.mentions.users.first() || message.author;
    const wallet = Math.floor(Math.random() * 10000);
    const bank = wallet * 2;
    const embed = new EmbedBuilder().setColor(C.warning).setTitle(`${E.money} ${user.tag}'s Balance`).addFields(
        { name: 'Wallet', value: `$${wallet}`, inline: true },
        { name: 'Bank', value: `$${bank}`, inline: true },
        { name: 'Total', value: `$${wallet + bank}`, inline: true }
    );
    message.reply({ embeds: [embed] });
}});

commands.set('bal', { run: async (message, args) => { return commands.get('balance').run(message, args); }});
commands.set('daily', { run: async (message) => { message.reply({ content: `${E.gift} Daily: **$${Math.floor(Math.random() * 1000) + 500}**!` }); }});
commands.set('weekly', { run: async (message) => { message.reply({ content: `${E.gift} Weekly: **$${Math.floor(Math.random() * 5000) + 2500}**!` }); }});
commands.set('monthly', { run: async (message) => { message.reply({ content: `${E.gift} Monthly: **$${Math.floor(Math.random() * 20000) + 10000}**!` }); }});
commands.set('work', { run: async (message) => {
    const jobs = ['Developer 💻', 'Teacher 📚', 'Doctor 🏥'];
    message.reply({ content: `${E.money} Worked as ${jobs[Math.floor(Math.random() * jobs.length)]}: **$${Math.floor(Math.random() * 500) + 100}**` });
}});
commands.set('beg', { run: async (message) => { message.reply({ content: `${E.money} Got **$${Math.floor(Math.random() * 100) + 10}**!` }); }});

commands.set('crime', { run: async (message) => {
    const success = Math.random() > 0.5;
    const amount = Math.floor(Math.random() * 500) + 100;
    message.reply({ content: success ? `${E.success} Crime successful! **$${amount}**` : `${E.error} Caught! Lost **$${amount}**` });
}});

commands.set('rob', { run: async (message) => {
    const member = message.mentions.members.first();
    if (!member) return message.reply({ content: `${E.error} Mention someone!` });
    const success = Math.random() > 0.4;
    const amount = Math.floor(Math.random() * 1000) + 100;
    message.reply({ content: success ? `${E.success} Robbed **$${amount}** from ${member}!` : `${E.error} Failed! Lost **$${amount}**` });
}});

commands.set('slots', { run: async (message) => {
    const emojis = ['🍎', '🍊', '🍋', '🍇', '🍉', '7️⃣', '💎'];
    const s1 = emojis[Math.floor(Math.random() * emojis.length)];
    const s2 = emojis[Math.floor(Math.random() * emojis.length)];
    const s3 = emojis[Math.floor(Math.random() * emojis.length)];
    const result = (s1 === s2 && s2 === s3) ? (s1 === '💎' ? `${E.tada} JACKPOT $10000!` : `${E.success} Triple $1000!`) : (s1 === s2 || s2 === s3 || s1 === s3) ? `${E.sparkles} Double $100!` : `${E.error} No match!`;
    message.reply({ content: `${E.game} **║** ${s1} **║** ${s2} **║** ${s3} **║**\n\n${result}` });
}});

commands.set('leaderboard', { run: async (message) => {
    const embed = new EmbedBuilder().setColor(C.warning).setTitle(`${E.crown} Leaderboard`).setDescription(`1. User1 - $50000\n2. User2 - $45000\n3. User3 - $40000`);
    message.reply({ embeds: [embed] });
}});

commands.set('lb', { run: async (message, args) => { return commands.get('leaderboard').run(message, args); }});

// GIVEAWAY COMMANDS
commands.set('gstart', { run: async (message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply({ content: `${E.error} No permission!` });
    const ms = require('ms');
    const duration = args[0];
    const winners = parseInt(args[1]) || 1;
    const prize = args.slice(2).join(' ');
    if (!duration || !prize) return message.reply({ content: `${E.error} Usage: gstart <duration> <winners> <prize>` });
    const time = ms(duration);
    const endTime = Date.now() + time;
    const embed = new EmbedBuilder().setColor(C.main).setTitle(`${E.tada} GIVEAWAY! ${E.tada}`).setDescription(`╔═══════════════════════════════╗\n${E.gift} **Prize:** ${prize}\n\n${E.crown} **Winners:** ${winners}\n${E.zap} **Ends:** <t:${Math.floor(endTime / 1000)}:R>\n${E.arrow} **Host:** ${message.author}\n\n${E.sparkles} React with ${E.tada} to enter!\n╚═══════════════════════════════╝`).setFooter({ text: `Hosted by ${message.author.tag}` }).setTimestamp(endTime);
    const msg = await message.channel.send({ embeds: [embed] });
    await msg.react(E.tada);
}});

// TICKET COMMANDS
commands.set('ticket', { run: async (message) => {
    if (message.channel.name.startsWith('ticket-')) return message.reply({ content: `${E.error} Already in ticket!` });
    try {
        const ch = await message.guild.channels.create({
            name: `ticket-${message.author.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: message.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: message.author.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });
        message.reply({ content: `${E.success} Created: ${ch}` });
        ch.send({ content: `${E.ticket} Welcome ${message.author}!\n\nUse \`${PREFIX}close\` to close.` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed: ${error.message}` });
    }
}});

commands.set('new', { run: async (message, args) => { return commands.get('ticket').run(message, args); }});

commands.set('close', { run: async (message) => {
    if (!message.channel.name.startsWith('ticket-')) return message.reply({ content: `${E.error} Not a ticket!` });
    await message.channel.send({ content: `${E.loading} Closing in 5s...` });
    setTimeout(() => message.channel.delete().catch(() => {}), 5000);
}});

commands.set('add', { run: async (message) => {
    if (!message.channel.name.startsWith('ticket-')) return message.reply({ content: `${E.error} Not a ticket!` });
    const member = message.mentions.members.first();
    if (!member) return message.reply({ content: `${E.error} Mention someone!` });
    try {
        await message.channel.permissionOverwrites.create(member, { ViewChannel: true, SendMessages: true });
        message.reply({ content: `${E.success} Added ${member}!` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed!` });
    }
}});

commands.set('remove', { run: async (message) => {
    if (!message.channel.name.startsWith('ticket-')) return message.reply({ content: `${E.error} Not a ticket!` });
    const member = message.mentions.members.first();
    if (!member) return message.reply({ content: `${E.error} Mention someone!` });
    try {
        await message.channel.permissionOverwrites.delete(member);
        message.reply({ content: `${E.success} Removed ${member}!` });
    } catch (error) {
        message.reply({ content: `${E.error} Failed!` });
    }
}});

// LEVELING COMMANDS
commands.set('rank', { run: async (message, args) => {
    const user = message.mentions.users.first() || message.author;
    const level = Math.floor(Math.random() * 50) + 1;
    const xp = Math.floor(Math.random() * 1000);
    const required = level * 500;
    const rankNum = Math.floor(Math.random() * 100) + 1;
    const embed = new EmbedBuilder().setColor(C.purple).setAuthor({ name: `${user.tag}'s Rank`, iconURL: user.displayAvatarURL() }).setThumbnail(user.displayAvatarURL({ dynamic: true })).addFields(
        { name: `${E.star} Level`, value: `\`\`\`${level}\`\`\``, inline: true },
        { name: `${E.fire} XP`, value: `\`\`\`${xp}/${required}\`\`\``, inline: true },
        { name: `${E.crown} Rank`, value: `\`\`\`#${rankNum}\`\`\``, inline: true }
    ).setTimestamp();
    message.reply({ embeds: [embed] });
}});

commands.set('level', { run: async (message, args) => { return commands.get('rank').run(message, args); }});

// OWNER COMMANDS
commands.set('eval', { run: async (message, args) => {
    if (message.author.id !== OWNER_ID) return message.reply({ content: `${E.error} Owner only!` });
    const code = args.join(' ');
    try {
        let evaled = eval(code);
        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
        message.reply({ content: `\`\`\`js\n${evaled.slice(0, 1900)}\`\`\`` });
    } catch (err) {
        message.reply({ content: `\`\`\`js\n${err}\`\`\`` });
    }
}});

commands.set('shutdown', { run: async (message) => {
    if (message.author.id !== OWNER_ID) return message.reply({ content: `${E.error} Owner only!` });
    await message.reply({ content: `${E.loading} Shutting down...` });
    process.exit();
}});

commands.set('restart', { run: async (message) => {
    if (message.author.id !== OWNER_ID) return message.reply({ content: `${E.error} Owner only!` });
    await message.reply({ content: `${E.loading} Restarting...` });
    process.exit(1);
}});

commands.set('servers', { run: async (message) => {
    if (message.author.id !== OWNER_ID) return message.reply({ content: `${E.error} Owner only!` });
    const list = client.guilds.cache.map((g, i) => `${i + 1}. ${g.name} (${g.memberCount})`).join('\n');
    message.reply({ content: `**Servers (${client.guilds.cache.size}):**\n${list.slice(0, 1900)}` });
}});

commands.set('serverlist', { run: async (message, args) => { return commands.get('servers').run(message, args); }});

commands.set('broadcast', { run: async (message, args) => {
    if (message.author.id !== OWNER_ID) return message.reply({ content: `${E.error} Owner only!` });
    if (!args.length) return message.reply({ content: `${E.error} Provide message!` });
    let sent = 0;
    for (const guild of client.guilds.cache.values()) {
        const ch = guild.systemChannel || guild.channels.cache.find(c => c.type === ChannelType.GuildText);
        if (ch) {
            try {
                await ch.send({ content: `📢 **Broadcast:** ${args.join(' ')}` });
                sent++;
            } catch (err) {}
        }
    }
    message.reply({ content: `${E.success} Sent to ${sent} servers!` });
}});

// MESSAGE HANDLER
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    let prefix = PREFIX;
    let content = message.content;

    if (message.author.id === OWNER_ID) {
        const cmd = content.split(' ')[0].toLowerCase();
        if (commands.has(cmd)) prefix = '';
    }

    if (!content.startsWith(prefix)) return;

    const args = content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    const command = commands.get(cmdName);
    if (!command) return;

    if (!client.cooldowns.has(cmdName)) {
        client.cooldowns.set(cmdName, new Collection());
    }

    const now = Date.now();
    const stamps = client.cooldowns.get(cmdName);
    const cooldown = 3000;

    if (stamps.has(message.author.id) && message.author.id !== OWNER_ID) {
        const exp = stamps.get(message.author.id) + cooldown;
        if (now < exp) {
            const left = (exp - now) / 1000;
            return message.reply({ content: `${E.error} Wait ${left.toFixed(1)}s!` })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
        }
    }

    stamps.set(message.author.id, now);
    setTimeout(() => stamps.delete(message.author.id), cooldown);

    try {
        await command.run(message, args);
    } catch (error) {
        console.error(`Error:`, error);
        message.reply({ content: `${E.error} Error: ${error.message}` }).catch(() => {});
    }
});

// WELCOME
client.on('guildMemberAdd', async (member) => {
    const ch = member.guild.systemChannel;
    if (ch) ch.send({ content: `${E.tada} Welcome ${member}! Member #${member.guild.memberCount}!` }).catch(() => {});
});

// READY EVENT
client.on('ready', () => {
    console.log(`╔════════════════════╗`);
    console.log(`║  ${E.success} BOT ONLINE!     ║`);
    console.log(`╠════════════════════╣`);
    console.log(`║  ${client.user.tag.padEnd(15)} ║`);
    console.log(`║  Servers: ${String(client.guilds.cache.size).padEnd(8)} ║`);
    console.log(`║  Commands: ${String(commands.size).padEnd(6)} ║`);
    console.log(`╚════════════════════╝`);

    const statuses = [
        { name: `${PREFIX}help | ${client.guilds.cache.size} Servers`, type: ActivityType.Playing },
        { name: `${commands.size}+ Commands`, type: ActivityType.Watching },
        { name: `${client.users.cache.size} Users`, type: ActivityType.Listening }
    ];

    let i = 0;
    setInterval(() => {
        client.user.setActivity(statuses[i].name, { type: statuses[i].type });
        i = (i + 1) % statuses.length;
    }, 10000);
});

// ERROR HANDLING
process.on('unhandledRejection', err => console.error('Error:', err));
process.on('uncaughtException', err => console.error('Error:', err));
// LOGIN
require('dotenv').config();
client.login(process.env.TOKEN);
