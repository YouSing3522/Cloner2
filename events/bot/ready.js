const {} = require("discord.js");


module.exports = {
    name:"ready",
    run:async(client) => {console.clear();
        console.log("\n");
        const red = '\x1b[31m';
        const green = '\x1b[32m';
        const padrao = '\x1b[0m';
        const orange = '\x1b[33m';
        const purple = "\x1b[35m";
        console.log('\x1b[37m%s\x1b[0m', `                               > Estou online em ${client.user.username} <`);
        console.log('\x1b[37m%s\x1b[0m', `1.0.0`);
        

    }
}