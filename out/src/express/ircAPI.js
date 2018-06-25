"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const events_1 = require("events");
const NetSocket = require("net").Socket;
const IrcSocket = require("irc-socket");
const express = require('express');
const app = express();
const portfinder = require('portfinder');
const messageEvent = new events_1.EventEmitter();
// make the class usable with 'export' class IRCExpressEndpoint,
// then we declare all the variables.  All the public variables are available to the extension.ts file
class IRCExpressEndpoint {
    // set the variables with the constructor (see: interface ircConnection)
    constructor(obj, gitChannel) {
        this.nickname = undefined;
        this.arrayOfUsers = Array.prototype;
        this.htmlPage = "Loading";
        this.ircUrl = obj.ircUrl;
        this.port = ((obj.port) ? obj.port : 6667);
        this.username = obj.username;
        this.channels = ((obj.channels) ? ((gitChannel) ? obj.channels.concat(gitChannel).sort(this.alphebeticSort) : ['javascript']) : ['javascript']);
        this.ircNicknames = ((obj.ircNicknames) ? obj.ircNicknames : ['VSCodeUser-1', 'VSCodeUser-2', 'VSCodeUser-3']);
        this.realName = ((obj.realName) ? obj.realName : 'Some VSCode User');
        this.ircUrlMatch = this.ircUrl.match(/([a-zA-Z]+)\.([a-zA-Z0-9-_]+)\.([a-zA-Z0-9-_]{2,5})/);
        this.urlPrefix = ((this.ircUrlMatch) ? this.ircUrlMatch[1] : 'irc');
        this.urlBase = ((this.ircUrlMatch) ? this.ircUrlMatch[2] : 'freenode');
        this.urlEndPoint = ((this.ircUrlMatch) ? this.ircUrlMatch[3] : 'com');
        this.netSocket = new NetSocket();
        this.client = IrcSocket({
            socket: this.netSocket,
            port: this.port,
            server: `${this.urlPrefix}.${this.urlBase}.${this.urlEndPoint}`,
            nicknames: this.ircNicknames,
            username: this.username,
            realname: this.realName,
        });
        this.baseUserMessage = { user: '', message: '', time: (new Date).getTime() };
        this.userMessages = [this.baseUserMessage];
        this.channelConnections = this.initialChannelConnections();
        this.serverStatus = {
            serverName: this.ircUrl,
            channelCons: this.channelConnections
        };
        this.expressPort = 3000;
        portfinder.getPortPromise()
            .then((port) => {
            this.expressPort = port;
            app.get('/', (req, res) => res.send('Hello World!'));
            app.listen(port, () => console.log(`IRC localServer: ${this.ircUrl} listening on port ${port}`));
        });
        this.serverEvent = new events_1.EventEmitter;
    }
    initialChannelConnections() {
        let channelConsFromServer = [];
        for (let channel of this.channels) {
            channelConsFromServer.push({ channelName: ((channel.substr(0, 1) === '#') ? channel.substr(1) : channel), messages: this.userMessages, usersInChannel: [] });
        }
        return channelConsFromServer;
    }
    // make the connection to the server, and log server messages.
    launchIRCConnection() {
        return this.client.connect()
            .then((res) => {
            console.log("RESPONSE:", JSON.stringify(res, null, 2));
            if (res.isOk()) {
                console.log('CHANNELS TO CONNECT TO: ', this.channels);
                for (let channelConnction of this.serverStatus.channelCons)
                    if (channelConnction.channelName)
                        this.client.raw(`JOIN #${channelConnction.channelName}`);
                //this.client.raw(`JOIN #${this.channel}`);
                return res;
                //client.end(); // End connection to server.
            }
        })
            .then((res) => {
            if (res.value.nickname) {
                this.nickname = res.value.nickname;
                vscode.window.showInformationMessage(`Successful: connection to ${this.ircUrl}`);
            }
        })
            .catch((e) => console.log(e));
    }
    ;
    listenToMessages() {
        this.client.on('data', (message) => {
            //console.log(message); /*?*/
            //this.parseMessage(message);
            this.channelMessage(message);
            this.serverEvent.emit('newMessage', this.serverStatus);
        });
    }
    alphebeticSort(a, b) {
        if (a.toLowerCase() > b.toLowerCase())
            return 1;
        else if (a.toLowerCase() < b.toLowerCase())
            return -1;
        return 0;
    }
    ;
    channelMessage(m) {
        let MessageArray = m.split(' ');
        console.log(MessageArray);
        if (MessageArray) {
            if (MessageArray.length > 3) {
                if (MessageArray[1] === "PRIVMSG") {
                    let fromUser = MessageArray[0].substr(1).split('!')[0];
                    let fromChannel = MessageArray[2].substr(1).replace(':', '');
                    let indexOfChannel = this.serverStatus.channelCons.findIndex(x => x.channelName == fromChannel);
                    if (this.serverStatus.channelCons[indexOfChannel]) {
                        this.serverStatus.channelCons[indexOfChannel].messages.push({ user: fromUser, message: MessageArray.slice(3).join(' ').substr(1), time: (new Date).getTime() });
                    }
                    if (MessageArray[3] === `:${this.nickname}:`) {
                        console.log('GOT DIRECT MESSAGE');
                        if (this.nickname) {
                            vscode.window.showInformationMessage(`${fromUser}:` + MessageArray.slice(3).join(' ').substr(this.nickname.length + 2));
                        }
                    }
                    if (MessageArray[2] === `${this.nickname}`) {
                        console.log('GOT DIRECT MESSAGE');
                        if (this.nickname) {
                            vscode.window.showInformationMessage(`${fromUser}:` + MessageArray.slice(3).join(' ').substr(this.nickname.length + 2));
                        }
                    }
                    console.log("MESSAGES FROM USER:", fromUser, this.serverStatus.channelCons[indexOfChannel].messages
                        .filter((o) => o.user === fromUser)
                        .map((e) => e.message).join(' --- '));
                }
                if (MessageArray[1] === "PART") {
                    let fromUser = MessageArray[0].substr(1).split('!')[0];
                    let fromChannel = MessageArray[2].substr(1).replace(':', '');
                    let indexOfChannel = this.serverStatus.channelCons.findIndex(x => x.channelName == fromChannel);
                    let indexOfUser = this.serverStatus.channelCons[indexOfChannel].usersInChannel.indexOf(fromUser);
                    console.log(this.serverStatus.channelCons[indexOfChannel].usersInChannel.splice(indexOfUser, 1), 'HAS LEFT THE CHANNEL:', fromChannel);
                }
                if (MessageArray[1] === "QUIT") {
                    if (MessageArray[2] == ":Quit:") {
                        let fromUser = MessageArray[0].substr(1).split('!')[0];
                        let fromChannel = MessageArray[2].substr(1).substr(1).replace(':', '');
                        let indexOfChannel = this.serverStatus.channelCons.findIndex(x => x.channelName == fromChannel);
                        let indexOfUser = this.serverStatus.channelCons[indexOfChannel].usersInChannel.indexOf(fromUser);
                        //if(this.serverStatus.channelCons[indexOfChannel]) {
                        //    this.serverStatus.channelCons[indexOfChannel].messages.push( {user: fromUser, message: MessageArray.slice(3).join(' ').substr(1), time: (new Date).getTime() });
                        //}
                        console.log(this.serverStatus.channelCons[indexOfChannel].usersInChannel.splice(indexOfUser, 1), 'HAS LEFT THE CHANNEL:', fromChannel);
                    }
                    else {
                        let fromUser = MessageArray[0].substr(1).split('!')[0];
                        let fromChannel = MessageArray[2].substr(1).replace(':', '');
                        let indexOfChannel = this.serverStatus.channelCons.findIndex(x => x.channelName == fromChannel);
                        let indexOfUser = this.serverStatus.channelCons[indexOfChannel].usersInChannel.indexOf(fromUser);
                        console.log(this.serverStatus.channelCons[indexOfChannel].usersInChannel.splice(indexOfUser, 1), 'HAS LEFT THE CHANNEL:', fromChannel);
                    }
                }
                if (MessageArray[1] === "353") {
                    if (MessageArray[5].replace(':', '').replace('@', '') == this.nickname) {
                        if (MessageArray[6]) {
                            let NoSameUserMessageArray = MessageArray.slice(6);
                            this.parseNewChanelUsers(NoSameUserMessageArray, MessageArray[4].substr(1));
                        }
                    }
                    else {
                        MessageArray[5] = MessageArray[5].replace(':', '').replace('@', '');
                        this.parseNewChanelUsers(MessageArray.slice(5), MessageArray[4].substr(1));
                    }
                }
            }
            if (MessageArray.length === 2) {
                if (MessageArray[0] === 'PING') {
                    //console.log("PING:\n\t", JSON.stringify(this.serverStatus.channelCons, null, 4));
                }
            }
            if (MessageArray.length === 3) {
                //if someone new joins the channel:
                if (MessageArray[1] === "JOIN") {
                    let fromUser = MessageArray[0].substr(1).split('!')[0];
                    let fromChannel = MessageArray[2].substr(1).replace(':', '');
                    console.log('I SEE:', fromUser);
                    console.log(MessageArray);
                    if (fromUser !== this.nickname) {
                        console.log("NEW USER JOINED:", fromUser, "TO CHANNEL", fromChannel);
                        let indexOfChannel = this.serverStatus.channelCons.findIndex(x => x.channelName == fromChannel);
                        this.serverStatus.channelCons[indexOfChannel].usersInChannel = this.serverStatus.channelCons[indexOfChannel].usersInChannel.concat(fromUser).sort(this.alphebeticSort);
                        console.log("USER IS NOW AT CHANNEL INDEX:", indexOfChannel, "AT USERINCHANNEL INDEX:", this.serverStatus.channelCons[indexOfChannel].usersInChannel.indexOf(fromUser));
                    }
                    else {
                        console.log('The USER IS YOU!!!');
                        let indexOfChannel = this.serverStatus.channelCons.findIndex(x => x.channelName == fromChannel);
                        console.log('YOUR USER INDEX IS', indexOfChannel);
                        if (!this.serverStatus.channelCons[indexOfChannel]) {
                            console.log('CREATING NEW CHANNEL:', fromChannel, 'BECAUSE OF:', fromUser);
                            this.serverStatus.channelCons.push({ channelName: MessageArray[2].substr(1).replace(':', ''), messages: [], usersInChannel: [] });
                        }
                    }
                }
            }
        }
    }
    // for parsing new users to channel:
    parseNewChanelUsers(m, channelNameFiltered) {
        console.log("FOUND USER LIST ON CHANNEL:", channelNameFiltered, "USERS:", m.join(' '));
        let indexOfChannel = this.serverStatus.channelCons.findIndex(x => x.channelName == channelNameFiltered);
        if (this.serverStatus.channelCons[indexOfChannel]) {
            if (this.serverStatus.channelCons[indexOfChannel])
                this.serverStatus.channelCons[indexOfChannel].usersInChannel = this.serverStatus.channelCons[indexOfChannel].usersInChannel.concat(m).sort(this.alphebeticSort);
        }
        else {
            console.log('BRAND NEW CHANNEL IS BEING CREATED FOR:', channelNameFiltered);
            this.serverStatus.channelCons.push({ channelName: channelNameFiltered, messages: [], usersInChannel: [] });
            if (this.serverStatus.channelCons[indexOfChannel]) {
                if (this.serverStatus.channelCons[indexOfChannel])
                    this.serverStatus.channelCons[indexOfChannel].usersInChannel = this.serverStatus.channelCons[indexOfChannel].usersInChannel.concat(m).sort(this.alphebeticSort);
            }
        }
    }
}
exports.IRCExpressEndpoint = IRCExpressEndpoint;
;
//# sourceMappingURL=ircAPI.js.map