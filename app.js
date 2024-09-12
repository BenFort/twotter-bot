require('dotenv').config();

const { Client, Events, GatewayIntentBits } = require('discord.js');

const DELETE_REACT = String.fromCharCode(0x274C);
const TWITTER_ADDRESS_TO_CHANGE_TO = "fxtwitter.com";
const REDDIT_ADDRESS_TO_CHANGE_TO = "rxddit.com";
const TIKTOK_ADDRESS_TO_CHANGE_TO = "tnktok.com";
const INSTAGRAM_ADDRESS_TO_CHANGE_TO = "ddinstagram.com";

const client = new Client
(
    {
        intents:
        [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMessageReactions
        ]
    }
);

let clientUserId = 0;

client.login(process.env.DISCORD_TOKEN);

client.on(Events.ClientReady, async () =>
{
    clientUserId = client.user.id;
});

client.on(Events.MessageCreate, async function (message)
{
    let messageContent = message?.content ?? "";
    let isTweet = false;
    let repostMessage = false;

    // switch to vxtwitter
    if (messageContent.includes('https://twitter.com/'))
    {
        messageContent = messageContent.replace('twitter.com', TWITTER_ADDRESS_TO_CHANGE_TO);
        isTweet = true;
        repostMessage = true;
    } 
    else if (messageContent.includes('https://x.com/'))
    {
        messageContent = messageContent.replace('x.com', TWITTER_ADDRESS_TO_CHANGE_TO);
        isTweet = true;
        repostMessage = true;
    }
    else if (messageContent.includes('reddit.com/'))
    {
        messageContent = messageContent.replace('reddit.com', REDDIT_ADDRESS_TO_CHANGE_TO);
        repostMessage = true;
    }
    else if (messageContent.includes('tiktok.com/'))
    {
        messageContent = messageContent.replace('tiktok.com', TIKTOK_ADDRESS_TO_CHANGE_TO);
        repostMessage = true;
    }
    else if (messageContent.includes('https://www.instagram.com/') || messageContent.includes('https://instagram.com/'))
    {
        messageContent = messageContent.replace('instagram.com', INSTAGRAM_ADDRESS_TO_CHANGE_TO);
        repostMessage = true;
    }

    if (isTweet)
    {
        // strip tracking link
        if (messageContent.match(/\?t=/gm) != null)
        {
            messageContent = messageContent.match(/.+?(?=\?t=)/gm)?.[0] ?? messageContent;
        }
    }
    
    if (repostMessage)
    {
        let guild = client.guilds.cache.get(message.guildId);
        let member = await guild.members.fetch(message.author)
        RepostMessage(message, member.user.username + ' (' + member.nickname + ')', messageContent);
    }
});

client.on(Events.MessageReactionAdd, (reaction, user) =>
{
    if (reaction.message.author.id === clientUserId)
    {
        let text = reaction.message.content;
        let originalAuthor = text.substring(0, text.indexOf(' '));

        if (reaction._emoji.name === DELETE_REACT)
        {
            if (user.username === originalAuthor)
            {
                reaction.message.delete();
            }
            else if (user.id !== clientUserId)
            {
                reaction.users.remove(user);
            }
        }
    }
});

function RepostMessage(message, name, messageText)
{
    message.delete();
    message.channel.send(name + ' posted: ' + messageText).then(message => message.react(DELETE_REACT));
}
