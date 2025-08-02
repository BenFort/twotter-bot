require('dotenv').config();

const { Client, Events, GatewayIntentBits } = require('discord.js');
const URI = require('urijs');

const DELETE_REACT = String.fromCharCode(0x274C);

// Maps a domain to its embed-friendly replacement.
//
// Note that a domain is only the TLD + 2LD (Top-Level Domain + 2nd-Level Domain).
// E.g. in the URL "https://account.tumblr.com/my-account", the domain is "tumblr.com".
// For more information:
//      https://medialize.github.io/URI.js/about-uris.html#components
const DOMAIN_MAPPING = {
    'twitter.com': 'xcancel.com',
    'x.com': 'xcancel.com',
    'reddit.com': 'rxddit.com',
    'tiktok.com': 'tnktok.com',
    'instagram.com': 'instagramez.com',
    'pixiv.net': 'phixiv.net',
    'bsky.app': 'bskyx.app',
    'tumblr.com': 'tpmblr.com'
}

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
    if (message.author.id === clientUserId)
    {
        return;
    }

    let messageContent = message?.content ?? "";
    let repostMessage = false;

    messageContent = URI.withinString(messageContent, function(url, start, end, source)
	{
        // Don't do anything if the url is wrapped in Discord's non-embed syntax
        if (source[start-1] === '<' && source[end] === '>')
		{
            return url;
        }

        let uri = URI(url);
        const domain = uri.domain();

        RemoveTrackingParameters(uri);

        // Replace domain with its embed-friendly version (if it has one)
        if (DOMAIN_MAPPING.hasOwnProperty(domain))
        {
            uri.domain(DOMAIN_MAPPING[domain]);
        }

        // Only repost if a URL has actually changed
        if (!uri.equals(url))
        {
            repostMessage = true;
        }
        return uri.toString();
    })

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

/**
 * Returns whether `domain` equals any of `matching_domains` (or their embed-friendly versions).
 */
function DomainMatches(domain, ...matching_domains)
{
    let matches = [];
    for (const d of matching_domains)
    {
        matches.push(d, DOMAIN_MAPPING[d]);
    }
    return matches.includes(domain);
}

/**
 * Strips tracking/fingerprinting query parameters from `uri`.
 */
function RemoveTrackingParameters(uri)
{
    const domain = uri.domain();

    if (DomainMatches(domain, 'twitter.com', 'x.com'))
    {
        uri.removeQuery(['t', 's']);
    }
    else if (DomainMatches(domain, 'youtube.com', 'youtu.be'))
    {
        uri.removeQuery('si');
    }
	else if (DomainMatches(domain, 'reddit.com'))
    {
        uri.removeQuery(['utm_source', 'utm_medium', 'utm_name', 'utm_term', 'utm_content']);
    }

}

function RepostMessage(message, name, messageText)
{
    message.delete();
    message.channel.send(name + ' posted: ' + messageText).then(message => message.react(DELETE_REACT));
}
