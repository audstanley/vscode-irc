import * as vscode from 'vscode';
const NetSocket = require("net").Socket;
const IrcSocket = require("irc-socket");
const express   = require('express');
const app       = express();

// we need to pass an object into the IRCExpressEndpoint constructor
interface ircConnection {
    ircUrl        : string;
    port?         : number;
    username      : string;
    channels?      : string[];
    ircNicknames? : string[];
    realName?     : string;
}

// make the class usable with 'export' class IRCExpressEndpoint,
// then we declare all the variables.  All the public variables are available to the extension.ts file
export class IRCExpressEndpoint {
    public ircUrl       : string;
    public port         : number;
    public username     : string;
    public channels     : string[];
    public ircNicknames : string[];
    public realName     : string;
    public ircUrlMatch  : string[] | null;
    public urlPrefix    : string;
    public urlBase      : string;
    public urlEndPoint  : string;
    public netSocket    : object;
    public client       : any;
    public nickname     : undefined | string = undefined;
    public arrayOfUsers : string[]           = Array.prototype;
    public htmlPage     : string             = "Loading";

    // set the variables with the constructor (see: interface ircConnection)
    constructor(obj: ircConnection) {
        this.ircUrl         = obj.ircUrl;
        this.port           = ((obj.port)? obj.port : 6667 );
        this.username       = obj.username;
        this.channels       = ((obj.channels)? obj.channels : ['minecraft']);
        this.ircNicknames   = ((obj.ircNicknames)? obj.ircNicknames : ['VSCodeUser-1', 'VSCodeUser-2', 'VSCodeUser-3']);
        this.realName       = ((obj.realName)? obj.realName : 'Some VSCode User');
        this.ircUrlMatch    = this.ircUrl.match(/([a-zA-Z]+)\.([a-zA-Z0-9-_]+)\.([a-zA-Z0-9-_]{2,5})/);
        this.urlPrefix      = ((this.ircUrlMatch)? this.ircUrlMatch[1] : 'irc');
        this.urlBase        = ((this.ircUrlMatch)? this.ircUrlMatch[2] : 'freenode');
        this.urlEndPoint    = ((this.ircUrlMatch)? this.ircUrlMatch[3] : 'com');
        this.netSocket      = new NetSocket();
        this.client         = IrcSocket({
            socket      : this.netSocket,
            port        : this.port,
            server      : `${this.urlPrefix}.${this.urlBase}.${this.urlEndPoint}`,
            nicknames   : this.ircNicknames,
            username    : this.username,
            realname    : this.realName,
        });
    }

    // make the connection to the server, and log server messages.
    public launchIRCConnection() {
        return this.client.connect()
            .then((res: any) => {
                console.log("RESPONSE:", JSON.stringify(res, null, 2))
                if (res.isOk()) {
                    for (let channel of this.channels) this.client.raw(`JOIN #${channel}`)
                    //this.client.raw(`JOIN #${this.channel}`);
                    return res;
                    //client.end(); // End connection to server.
                }
            })
            .then((res : any) => {
                if (res.value.nickname) {
                    this.nickname = res.value.nickname
                    vscode.window.showInformationMessage(`Successful: connection to ${this.ircUrl}`);
                }
            })
            .catch((e : string) => console.log(e));
    };

    public listenToMessages() {
        this.client.on('data', (message: string) => {
            console.log(message); /*?*/
            //this.parseMessage(message);
        });
    }

    // for parsing server messages:
    public removeSelf = (e : string) => e !== `${this.nickname}`
    public remove = (array : string[], element : string) => array.filter(e => e !== element);
    public parseMessage(m : string) {
        let listOfUsersRegex = new RegExp(`
            :([A-Za-z]+)\.${this.urlBase}\.${this.urlEndPoint} 353 (${this.nickname}) @ #${this.channels[0]} :(\.+)
        `);
        let matchedUsers = m.match(listOfUsersRegex);
        if (matchedUsers) {
            if (matchedUsers.length > 3) {
                let matchedUsersCorrectSyntax = matchedUsers[3].replace('@', '')
                console.log('MATCHED USERS:', matchedUsers[3].replace('@', ''));
                this.arrayOfUsers = this.arrayOfUsers.concat(matchedUsersCorrectSyntax.split(' ').filter(this.removeSelf));
                console.log("ARRAY_OF_USERS_ON_LOGIN:", this.arrayOfUsers);
            }
        }
    
        let userLeftRegex = new RegExp(`(:\\S+) QUIT`);
        let userLeftChannel = m.match(userLeftRegex);
        if (userLeftChannel) {
            if (userLeftChannel.length > 0) {
                let theUserThatLeft = userLeftChannel[1].match(/:([a-zA-Z0-9\^-_]+)!/)
                if (theUserThatLeft) {
                    console.log("USER_THAT_LEFT_CHANNEL:", userLeftChannel);
                    this.arrayOfUsers = this.remove(this.arrayOfUsers, theUserThatLeft[1]);
                    console.log("ARRAY_OF_USERS_AFTER_QUIT:", this.arrayOfUsers);
                }
            }
        }
    
        // for now, only the first channel is able to be accessed.
        let userJoinedRegex = new RegExp(`(:\\S+) JOIN #${this.channels[0]}`);
        let userJoinedChannel = m.match(userJoinedRegex)
        if (userJoinedChannel) {
            if (userJoinedChannel.length > 0) {
                let theUserThatJoined = userJoinedChannel[1].match(/:([a-zA-Z0-9\^-_]+)!/)
                if (theUserThatJoined) {
                    console.log("USER_JOINED:", userJoinedChannel[1])
                    this.arrayOfUsers = this.arrayOfUsers.concat([theUserThatJoined[1]])
                    console.log("ARRAY_OF_USERS_AFTER_JOIN:", this.arrayOfUsers)
                }
            }
        }
    }

};

