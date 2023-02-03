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
    if (message.content.includes('https://twitter.com/'))
    {        
        let name = '';
        let guild = client.guilds.cache.get(message.guildId);
        guild.members
            .fetch(message.author)
            .then(data => name = data.nickname + ' (' + data.user.username + ')');

        let tweetId = message.content.match(/\/status\/(\d+)/)[1];
        if (await TweetContainsVideo(tweetId))
        {
            message.delete();
            message.channel.send(name + ' posted: ' + message.content.replace('twitter.com', 'vxtwitter.com'));
        }
    }
});

async function TweetContainsVideo(id)
{
    const twitter = new Client(process.env.TWITTER_TOKEN);
    const tweet = await twitter.tweets.findTweetById(id,
    {
        'expansions':
        [
            'attachments.media_keys',
            'referenced_tweets.id'
        ]
    });

    for (let reference in tweet.data.referenced_tweets)
    {
        if (tweet.data.referenced_tweets[reference].type === 'quoted')
        {
            const quoteTweet = await twitter.tweets.findTweetById(tweet.data.referenced_tweets[reference].id,
            {
                'expansions':
                [
                    'attachments.media_keys'
                ]
            });

            for (let i in quoteTweet.includes.media)
            {
                if (quoteTweet.includes.media[i].type === 'video')
                {
                    return true;
                }
            }
        }
    }

    for (let i in tweet.includes?.media)
    {
        if (tweet.includes.media[i].type === 'video')
        {
            return true;
        }
    }
    return false;
}
