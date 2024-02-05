require('dotenv').config();

const discord = require('discord.js');
const DiscordClient = discord.Client;
const GatewayIntentBits = discord.GatewayIntentBits;
const { Client } = require('twitter-api-sdk');

const client = new DiscordClient
(
    {
        intents: 
        [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ]
    }
);

client.login(process.env.DISCORD_TOKEN);

client.on('messageCreate', async function (message)
{
    const ADRESS_TO_CHANGE_TO = "vxtwitter.com";
    let messageContent = message?.content ?? "";
    let repostTweet = false;

    // switch to vxtwitter

    if(messageContent.includes('https://twitter.com/')) {
        messageContent = messageContent.replace('twitter.com', ADRESS_TO_CHANGE_TO);
        repostTweet = true;
    } 
    else if (messageContent.includes('https://x.com/')) 
    {
        messageContent = messageContent.replace('x.com', ADRESS_TO_CHANGE_TO);
        repostTweet = true;
    }

    // should be a !repost tweet + return statment but I can't test in this environment
    if(repostTweet) 
    {
        // strip tracking link
        if (messageContent.match(/\?t=/gm) != null) {
            messageContent = messageContent.match(/.+?(?=\?t=)/gm)?.[0] ?? messageContent;
        }

        let guild = client.guilds.cache.get(message.guildId);
        guild.members
            .fetch(message.author)
            .then(data => RepostMessage(message, data.nickname + ' (' + data.user.username + ')', messageContent));
    }
});

function RepostMessage(message, name, messageText)
{
    message.delete();
    message.channel.send(name + ' posted: ' + messageText);
}
