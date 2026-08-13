const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

module.exports = async (client, config, colors) => {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(commandsPath);

    const enabledCommandFolders = commandFolders.filter(
        folder => config.categories[folder]
    );

    const commands = [];

    for (const folder of enabledCommandFolders) {
        const folderPath = path.join(commandsPath, folder);

        const commandFiles = fs
            .readdirSync(folderPath)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const commandPath = path.join(folderPath, file);
            const command = require(commandPath);

            if (!command.data || !command.data.name) {
                console.log(
                    `${colors.red}[ ERROR ] Invalid command: ${folder}/${file}${colors.reset}`
                );
                continue;
            }

            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }
    }

    // 🔍 Command verification
    console.log('\n' + '—'.repeat(40));
    console.log(
        `${colors.yellow}${colors.bright}📊 COMMAND VERIFICATION${colors.reset}`
    );
    console.log('—'.repeat(40));

    console.log(
        `${colors.green}Loaded Commands: ${commands.length}${colors.reset}`
    );

    console.log(
        `${colors.cyan}Command Names:${colors.reset}`
    );

    commands.forEach((command, index) => {
        console.log(
            `${index + 1}. /${command.name}`
        );
    });

    // 🔍 Check duplicate command names
    const commandNames = commands.map(command => command.name);

    const duplicateCommands = commandNames.filter(
        (name, index) => commandNames.indexOf(name) !== index
    );

    if (duplicateCommands.length > 0) {
        console.log(
            `${colors.red}⚠️ DUPLICATE COMMANDS:${colors.reset}`
        );

        console.log(
            [...new Set(duplicateCommands)]
        );
    } else {
        console.log(
            `${colors.green}✅ No duplicate command names detected${colors.reset}`
        );
    }

    console.log('—'.repeat(40));

    // 🔐 Discord REST
    const token =
        process.env.BOT_API ||
        process.env.TOKEN ||
        config.token;

    if (!token) {
        console.log(
            `${colors.red}[ ERROR ] Bot token is missing!${colors.reset}`
        );
        return;
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.log(
            `${colors.yellow}${colors.bright}⚡ REGISTERING SLASH COMMANDS${colors.reset}`
        );

        await rest.put(
            Routes.applicationCommands(client.user.id),
            {
                body: commands
            }
        );

        console.log(
            `${colors.green}${colors.bright}✅ Successfully Registered ${commands.length} Slash Commands${colors.reset}`
        );

        console.log('—'.repeat(40));

    } catch (error) {
        console.log(
            `${colors.red}[ ERROR ] Slash command registration failed:${colors.reset}`
        );

        console.log(error);
    }
};
