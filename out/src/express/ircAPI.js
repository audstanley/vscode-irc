"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NetSocket = require("net").Socket;
const IrcSocket = require("irc-socket");
const express = require('express');
const app = express();
class IRCExpressEndpoint {
    constructor(obj) {
        this.nickname = undefined;
        this.arrayOfUsers = Array.prototype;
        this.htmlPage = "Loading";
        this.removeSelf = (e) => e !== `${this.nickname}`;
        this.remove = (array, element) => array.filter(e => e !== element);
        this.ircUrl = obj.ircUrl;
        this.port = ((obj.port) ? obj.port : 6667);
        this.username = obj.username;
        this.channel = ((obj.channel) ? obj.channel : 'minecraft');
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
    }
    launchIRCConnection() {
        this.client.connect()
            .then((res) => {
            console.log("RESPONSE:", JSON.stringify(res, null, 2));
            if (res.isOk()) {
                this.client.raw(`JOIN #${this.channel}`);
                this.client.raw(`JOIN #minecraft`);
                return res;
                //client.end(); // End connection to server.
            }
        })
            .then((res) => {
            this.nickname = res.value.nickname;
        })
            .catch((e) => console.log(e));
        this.client.on('data', (message) => {
            console.log(message); /*?*/
            this.parseMessage(message);
        });
    }
    ;
    parseMessage(m) {
        let listOfUsersRegex = new RegExp(`:([A-Za-z]+)\.freenode\.net 353 (${this.nickname}) @ #${this.channel} :(\.+)`);
        let matchedUsers = m.match(listOfUsersRegex);
        if (matchedUsers !== null) {
            if (matchedUsers.length > 3) {
                let matchedUsersCorrectSyntax = matchedUsers[3].replace('@', '');
                console.log('MATCHED USERS:', matchedUsers[3].replace('@', ''));
                this.arrayOfUsers = this.arrayOfUsers.concat(matchedUsersCorrectSyntax.split(' ').filter(this.removeSelf));
                console.log("ARRAY_OF_USERS_ON_LOGIN:", this.arrayOfUsers);
            }
        }
        let userLeftRegex = new RegExp(`(:\\S+) QUIT`);
        let userLeftChannel = m.match(userLeftRegex);
        if (userLeftChannel !== null) {
            if (userLeftChannel.length > 0) {
                let theUserThatLeft = userLeftChannel[1].match(/:([a-zA-Z0-9\^-_]+)!/);
                if (theUserThatLeft !== null) {
                    console.log("USER_THAT_LEFT_CHANNEL:", userLeftChannel);
                    this.arrayOfUsers = this.remove(this.arrayOfUsers, theUserThatLeft[1]);
                    console.log("ARRAY_OF_USERS_AFTER_QUIT:", this.arrayOfUsers);
                }
            }
        }
        let userJoinedRegex = new RegExp(`(:\\S+) JOIN #${this.channel}`);
        let userJoinedChannel = m.match(userJoinedRegex);
        if (userJoinedChannel !== null) {
            if (userJoinedChannel.length > 0) {
                let theUserThatJoined = userJoinedChannel[1].match(/:([a-zA-Z0-9\^-_]+)!/);
                if (theUserThatJoined !== null) {
                    console.log("USER_JOINED:", userJoinedChannel[1]);
                    this.arrayOfUsers = this.arrayOfUsers.concat([theUserThatJoined[1]]);
                    console.log("ARRAY_OF_USERS_AFTER_JOIN:", this.arrayOfUsers);
                }
            }
        }
    }
}
exports.IRCExpressEndpoint = IRCExpressEndpoint;
;
//# sourceMappingURL=ircAPI.js.map