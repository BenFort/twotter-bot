# twotter-bot

A discord bot that reposts messages containing various social media links to replace them with embed-safe versions so
that they are able to be viewed within Discord.

## Development Setup

- Set up your own tester bot. Follow the instructions in the [discordjs guide](https://discordjs.guide/legacy/preparations/app-setup)
  for *Application Setup*. This will also show you how to generate a token, which will be used later.
- In the **Installation** tab in the Discord Developer Portal for your bot, under the **Default Install Settings** >
  **Guild Install** section, add the `bot` Scope and the following Permissions:
  - Add Reactions
  - Manage Messages
  - Send Messages
  - Send Messages in Threads
- In the **Bot** tab in the Discord Developer Portal for your bot, check the *Message Content Intent* slider to enable
  it.
- Make a `.env` file with your bot's token from the discordjs guide linked above. The file contents should look
  like this, replacing the text after the `=` with the token generated earlier:

```ini
DISCORD_TOKEN=your bot's token
```

- In the **Installation** tab in the Discord Developer Portal for your bot, copy the *Install Link*. Open the link in
  your browser and Discord will prompt you to add the bot to one of your servers.
- Run `npm install` to install dependencies.
- Run `node app.js` to run the bot.
