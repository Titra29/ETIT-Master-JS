var private = require('../private.js');
const discord = require('../node_modules/discord.js');
const serverId = private.serverId;
const botUserID = private.botUserID;
const fs = require("fs");


exports.birthdayEntry = birthdayEntry;



async function birthdayEntry(client, listData) {

    await client.api.applications(client.user.id).guilds(serverId).commands.post({
        data: {
            name: "Geburtstag",
            description: "Trage deinen Geburtstag ein, und erhalte Glückwünsche vom Bot!",
            type: 2,
            options: [
                {
                    name: "Tag",
                    description: "Der Tag an dem du geboren bist:",
                    type: 4,
                    required: true
                },
                {
                    name: "Monat",
                    description: "Der Monat in dem du geboren bist:",
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: "Januar",
                            value: "01"
                        },
                        {
                            name: "Februar",
                            value: "02"
                        },
                        {
                            name: "März",
                            value: "03"
                        },
                        {
                            name: "April",
                            value: "04"
                        },
                        {
                            name: "Mai",
                            value: "05"
                        },
                        {
                            name: "Juni",
                            value: "06"
                        },
                        {
                            name: "Juli",
                            value: "07"
                        },
                        {
                            name: "August",
                            value: "08"
                        },
                        {
                            name: "September",
                            value: "09"
                        },
                        {
                            name: "Oktober",
                            value: "10"
                        },
                        {
                            name: "November",
                            value: "11"
                        },
                        {
                            name: "Dezember",
                            value: "12"
                        }
                    ]
                },
                {
                    name: "Jahr",
                    description: "Das Jahr in dem du geboren bist:",
                    type: 4,
                    required: true
                }
            ]
        }
    });


    var text = fs.readFileSync("./birthdayList.json").toString('utf-8');
    let birthdayData = JSON.parse(text);
    // let birthdayData = { };


    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        const command = interaction.data.name.toLowerCase();
        const args = interaction.data.options;
        var dateIsValid = false;
        if (command === 'geburtstag') {
            //get userID of user who issued command
            userID = interaction.member.user.id;

            
            //When date is valid, send embed
            //else send message it is not valid
            isValid = dateCheck(dateIsValid, args, client);
            if (isValid == true) {
                //dynamic embed with date
                const responseEmbed = new discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Geburtstagseintrag')
                .setAuthor('ETIT-Master', client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL())
                .setThumbnail('https://lynnvalleycare.com/wp-content/uploads/2018/03/First-Birthday-Cake-PNG-Photos1.png')
                .addFields(
                    { name: 'Geburtstag gesetzt auf:', value: '```json\n' + require('util').inspect(args[0].value) + require('util').inspect(args[1].value) + require('util').inspect(args[2].value) + '```'}                
                )
                addBirthday(args, userID, birthdayData, client);
                await client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 5,
                        data: {
                            content: '<@' + userID + '>\n',            
                            embeds: [
                                responseEmbed
                            ]
                        }
                    }
                })
            } else {
                await client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 5,
                        data: {
                            content: "<@" + userID + "> Kein zulässiges Datum"
                        }
                    }
                }) 
            }
        }
    })
}

function addBirthday(args, userID, birthdayData, client) {
    //converts date to JSON and writes to birdtayList.json
    birthdayData[userID] = {
        NutzerId: userID,
        date: (new Date(args[2].value, args[1].value - 1, args[0].value)).toDateString()
    };
    
    fs.writeFile('./birthdayList.json', JSON.stringify(birthdayData), function (err){
        if (err) throw err;
    });

    //create and sends debug embed with all entrys from birthdayList.json
    const foo = new discord.MessageEmbed()
        .setColor('#654321')
        .setAuthor('ETIT-Master',  client.guilds.resolve(serverId).members.resolve(botUserID).user.avatarURL())
        .addFields({ name: '[DEBUG] Liste der Geburtstäge:', value: '```json\n' + require('util').inspect(birthdayData) + '```'} )

    client.channels.cache.get('821657681999429652').send(foo);            
}



//checks if date is valid
function checkDate(dateIsValid, args) {
    var checkCheck = new Date(args[2].value ,args[1].value -1 ,args[0].value);
    return checkCheck != "Invalid Date";
}

//makes sure, entered year is not too far in the past
function maxYearDifference(args) {
    var today = new Date();
    var enteredDay = new Date(args[2].value, args[1].value - 1, args[0].value);
    if (today.getFullYear() - args[2].value <= 50) {
        return true;
    } else return false;
}

//makes sure, entered date is not too close to the current year
function minYearDifference(args) {
    var today = new Date();
    var enteredDay = new Date(args[2].value, args[1].value - 1, args[0].value);
    if (today.getFullYear() - args[2].value >= 15 && enteredDay < today) {
        return true;
    } else return false;
}

//check for leap year
function leapYear(args)
{
    return ((args[2].value % 4 == 0) && (args[2].value % 100 != 0)) || (args[2].value % 400 == 0);
}

//check if date is valid based on a leap year
function validDay(args) {
    if (args[0].value <= 0) {
        return false;
    }
    else {
        switch (args[1].value) {
            case '01':
                if(args[0].value <= 31){
                    return true;
                }else {
                    return false;
                }
            case '02':
                if (leapYear(args) == true) {                
                    if(args[0].value <= 29){
                        return true;
                    }else {
                        return false;
                    }
                } else {
                    if(args[0].value <= 28){
                        return true;
                    }else {
                        return false;
                    }
                }
            case '03':
                if(args[0].value <= 31){
                    return true;
                }else {
                    return false;
                }
            case '04':
                if(args[0].value <= 30){
                    return true;
                }else {
                    return false;
                }
            case '05':
                if(args[0].value <= 31){
                    return true;
                }else {
                    return false;
                }
            case '06':
                if(args[0].value <= 30){
                    return true;
                }else {
                    return false;
                }
            case '07':
                if(args[0].value <= 31){
                    return true;
                }else {
                    return false;
                }
            case '08':
                if(args[0].value <= 31){
                    return true;
                }else {
                    return false;
                }
            case '09':
                if(args[0].value <= 30){
                    return true;
                }else {
                    return false;
                }
            case '10':
                if(args[0].value <= 31){
                    return true;
                }else {
                    return false;
                }
            case '11':
                if(args[0].value <= 30){
                    return true;
                }else {
                    return false;
                }
            case '12':
                if(args[0].value <= 31){
                    return true;
                }else {
                    return false;
                }
        }        
    }
}

//executes all date checks
function dateCheck(dateIsValid, args, client) {
    if (checkDate(dateIsValid, args, client) == true && maxYearDifference(args) == true && minYearDifference(args) == true && validDay(args) == true) {
        return true;
    } else return false;
}