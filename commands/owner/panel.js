const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { owner, logs } = require("../../config.json");

module.exports = {
    name: "painel-cloner",
    description: "Envie o painel de clonagem",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if (interaction.user.id !== owner) { return interaction.reply({ content: `❌ | Permissão negada.`, ephemeral: true }); }
        try {
            await interaction.channel.send({
                content: `## CLONER - Psychiatry `,
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`panelcloner`)
                                .setLabel("Clonar um Servidor")
                                .setEmoji(`<:prancheta:1248301311418433717>`)
                                .setStyle(2),
                            new ButtonBuilder()
                                .setCustomId(`ClonerSite`)
                                .setLabel("Clonar um Site")
                                .setEmoji(`<:prancheta:1248301311418433717>`)
                                .setStyle(2)
                        )
                    ],
                    files: [
                        'https://cdn.discordapp.com/attachments/1282188734871240725/1284575779392589834/133dba90-9e46-4e84-aa74-cfcaba312566.png?ex=66e721ec&is=66e5d06c&hm=29db28b5a8479ef8f78b724784a28f9f7be1de2a5390d1948778fdcbf7b2fd6b&'
                    ]
                });
            await interaction.reply({ content: `✅ **| Painel enviado com sucesso!**`, ephemeral: true });
        } catch (error) {
            console.log("Erro ao enviar o painel: ", error);
            await interaction.reply({ content: `❌ **| Ocorreu um erro ao enviar o painel.**`, ephemeral: true });
        }
    }
}
