import * as vscode from 'vscode';
import { EventEmitter } from 'events';
const NetSocket = require("net").Socket;
const IrcSocket = require("irc-socket");
const express   = require('express');
const app       = express();
const portfinder = require('portfinder');

// we need to pass an object into the IRCExpressEndpoint constructor
interface ircConnection {
    ircUrl        : string;
    port?         : number;
    username      : string;
    channels?     : string[];
    ircNicknames? : string[];
    realName?     : string;
}

interface userMesssage {
    user: string;
    message: string;
    time: number;
}

interface channelConnections {
    channelName    : string;
    messages       : userMesssage[];
    usersInChannel : string[];
}

interface serverStatus {
    serverName    : string;
    channelCons   : channelConnections[];
}

// make the class usable with 'export' class IRCExpressEndpoint,
// then we declare all the variables.  All the public variables are available to the extension.ts file
export class IRCExpressEndpoint {
    public serverEvent          : EventEmitter;
    public serverStatus         : serverStatus;
    public channelConnections   : channelConnections[];
    public userMessages         : userMesssage[];
    public baseUserMessage      : userMesssage;
    public ircUrl               : string;
    public port                 : number;
    public username             : string;
    public channels             : string[];
    public ircNicknames         : string[];
    public realName             : string;
    public ircUrlMatch          : string[] | null;
    public urlPrefix            : string;
    public urlBase              : string;
    public urlEndPoint          : string;
    public netSocket            : object;
    public client               : any;
    public nickname             : undefined | string = undefined;
    public arrayOfUsers         : string[]           = Array.prototype;
    public htmlPage             : string             = "Loading";
    public expressPort          : number;

    // set the variables with the constructor (see: interface ircConnection)
    constructor(obj : ircConnection, gitChannel : string) {
        this.ircUrl         = obj.ircUrl;
        this.port           = ((obj.port)? obj.port : 6667 );
        this.username       = obj.username;
        this.channels       = ((obj.channels)? ((gitChannel)? obj.channels.concat(gitChannel).sort(this.alphebeticSort) : [ 'javascript' ]) : [ 'javascript' ]);
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
        this.baseUserMessage = { user : '', message : '', time: (new Date).getTime() }
        this.userMessages = [ this.baseUserMessage ]
        this.channelConnections = this.initialChannelConnections()
        this.serverStatus = { 
            serverName: this.ircUrl, 
            channelCons: this.channelConnections
        }
        this.expressPort = 3000;
        portfinder.getPortPromise()
            .then((port : number) => {
                this.expressPort = port
                app.get('/', (req : any, res : any) => res.send('Hello World!'))
                app.listen(port, () => console.log(`IRC localServer: ${this.ircUrl} listening on port ${port}`))
            })
        this.serverEvent = new EventEmitter();
        
    }

    public initialChannelConnections() {
        let channelConsFromServer : Array<channelConnections> = []
        for (let channel of this.channels) {
            channelConsFromServer.push({ channelName: ((channel.substr(0,1) === '#')? channel.substr(1) : channel), messages: this.userMessages, usersInChannel: [] });
        }
        return channelConsFromServer;
    }
    
    // make the connection to the server, and log server messages.
    public launchIRCConnection() {
        return this.client.connect()
            .then((res: any) => {
                console.log("RESPONSE:", JSON.stringify(res, null, 2))
                if (res.isOk()) {
                    console.log('CHANNELS TO CONNECT TO: ', this.channels)
                    for (let channelConnction of this.serverStatus.channelCons)
                        if(channelConnction.channelName) this.client.raw(`JOIN #${channelConnction.channelName}`)
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
            //console.log(message); /*?*/
            //this.parseMessage(message);
            this.channelMessage(message)
        });
    }

    public alphebeticSort(a : string, b : string) {
        if (a.toLowerCase() > b.toLowerCase()) return 1;
        else if (a.toLowerCase() < b.toLowerCase()) return -1;
        return 0;
      };

    public channelMessage(m :string) {
        let MessageArray = m.split(' ')
        console.log(MessageArray)
        if (MessageArray) {
            if(MessageArray.length > 3) {
                if ( MessageArray[1] === "PRIVMSG") {
                    let fromUser = MessageArray[0].substr(1).split('!')[0];
                    let fromChannel = MessageArray[2].substr(1).replace(':', '');
                    let indexOfChannel = this.serverStatus.channelCons.findIndex(x => x.channelName == fromChannel);
                    if(this.serverStatus.channelCons[indexOfChannel]) {
                        this.serverStatus.channelCons[indexOfChannel].messages.push( {user: fromUser, message: MessageArray.slice(3).join(' ').substr(1), time: (new Date).getTime() });
                        this.serverEvent.emit('newMessage', this.serverStatus.channelCons)
                    }
                    if (MessageArray[3] === `:${this.nickname}:`) {
                        console.log('GOT DIRECT MESSAGE')
                        if(this.nickname) { 
                            vscode.window.showInformationMessage(`${fromUser}:` + MessageArray.slice(3).join(' ').substr(this.nickname.length + 2));
                            this.serverEvent.emit('newMessage', this.serverStatus.channelCons)
                        }
                        
                    }
                    if (MessageArray[2] === `${this.nickname}`) {
                        console.log('GOT DIRECT MESSAGE')
                        if(this.nickname) {
                            vscode.window.showInformationMessage(`${fromUser}:` + MessageArray.slice(3).join(' ').substr(this.nickname.length + 2));
                            this.serverEvent.emit('newPrivateMessage', this.serverStatus.channelCons)
                        }
                    }
                    console.log("MESSAGES FROM USER:", fromUser, this.serverStatus.channelCons[indexOfChannel].messages
                                                        .filter((o : userMesssage)=> o.user === fromUser)
                                                        .map((e : userMesssage) => e.message).join(' --- '));
                }
                if(MessageArray[1] === "PART") {
                    let fromUser = MessageArray[0].substr(1).split('!')[0];
                    let fromChannel = MessageArray[2].substr(1).replace(':', '');
                    let indexOfChannel = this.serverStatus.channelCons.findIndex(x => x.channelName == fromChannel);
                    let indexOfUser = this.serverStatus.channelCons[indexOfChannel].usersInChannel.indexOf(fromUser);
                    console.log(this.serverStatus.channelCons[indexOfChannel].usersInChannel.splice(indexOfUser,1), 'HAS LEFT THE CHANNEL:', fromChannel);
                }
                if(MessageArray[1] === "QUIT") {
                    if(MessageArray[2] == ":Quit:") {
                        let fromUser = MessageArray[0].substr(1).split('!')[0];
                        let fromChannel = MessageArray[2].substr(1).substr(1).replace(':', '');
                        let indexOfChannel = this.serverStatus.channelCons.findIndex(x => x.channelName == fromChannel);
                        let indexOfUser = this.serverStatus.channelCons[indexOfChannel].usersInChannel.indexOf(fromUser);
                        //if(this.serverStatus.channelCons[indexOfChannel]) {
                        //    this.serverStatus.channelCons[indexOfChannel].messages.push( {user: fromUser, message: MessageArray.slice(3).join(' ').substr(1), time: (new Date).getTime() });
                        //}
                        console.log(this.serverStatus.channelCons[indexOfChannel].usersInChannel.splice(indexOfUser,1), 'HAS LEFT THE CHANNEL:', fromChannel);
                    }
                    else {
                        let fromUser = MessageArray[0].substr(1).split('!')[0];
                        let fromChannel = MessageArray[2].substr(1).replace(':', '');
                        let indexOfChannel = this.serverStatus.channelCons.findIndex(x => x.channelName == fromChannel);
                        let indexOfUser = this.serverStatus.channelCons[indexOfChannel].usersInChannel.indexOf(fromUser);
                        console.log(this.serverStatus.channelCons[indexOfChannel].usersInChannel.splice(indexOfUser,1), 'HAS LEFT THE CHANNEL:', fromChannel);
                    }
                }
                if ( MessageArray[1] === "353") {
                    if (MessageArray[5].replace(':', '').replace('@', '') == this.nickname) {
                        if(MessageArray[6]) {
                            let NoSameUserMessageArray = MessageArray.slice(6);
                            this.parseNewChanelUsers(NoSameUserMessageArray, MessageArray[4].substr(1));
                        }
                    }
                    else {
                        MessageArray[5] = MessageArray[5].replace(':', '').replace('@', '')
                        this.parseNewChanelUsers(MessageArray.slice(5), MessageArray[4].substr(1));
                    }
                }
            }
            if(MessageArray.length === 2) {
                if(MessageArray[0] === 'PING') {
                    //console.log("PING:\n\t", JSON.stringify(this.serverStatus.channelCons, null, 4));
                }
            }
            if(MessageArray.length === 3) {
                //if someone new joins the channel:
                if ( MessageArray[1] === "JOIN") {
                    let fromUser = MessageArray[0].substr(1).split('!')[0];
                    let fromChannel = MessageArray[2].substr(1).replace(':', '');
                    console.log('I SEE:', fromUser);
                    console.log(MessageArray);
                    if(fromUser !== this.nickname) {
                        console.log("NEW USER JOINED:", fromUser,"TO CHANNEL", fromChannel);
                        let indexOfChannel = this.serverStatus.channelCons.findIndex(x => x.channelName == fromChannel);
                        this.serverStatus.channelCons[indexOfChannel].usersInChannel = this.serverStatus.channelCons[indexOfChannel].usersInChannel.concat(fromUser).sort(this.alphebeticSort);
                        console.log("USER IS NOW AT CHANNEL INDEX:", indexOfChannel, "AT USERINCHANNEL INDEX:", this.serverStatus.channelCons[indexOfChannel].usersInChannel.indexOf(fromUser));
                    }
                    else {
                        console.log('The USER IS YOU!!!');
                        let indexOfChannel = this.serverStatus.channelCons.findIndex(x => x.channelName == fromChannel);
                        console.log('YOUR USER INDEX IS', indexOfChannel);
                        if (!this.serverStatus.channelCons[indexOfChannel]) {
                            console.log('CREATING NEW CHANNEL:', fromChannel, 'BECAUSE OF:', fromUser)
                            this.serverStatus.channelCons.push({ channelName: MessageArray[2].substr(1).replace(':', ''), messages: [], usersInChannel: [] });
                        }
                    }
                }
            }


        }
    }


    // for parsing new users to channel:
    public parseNewChanelUsers(m : string[], channelNameFiltered : string) {
        console.log("FOUND USER LIST ON CHANNEL:", channelNameFiltered, "USERS:", m.join(' '))
        let indexOfChannel = this.serverStatus.channelCons.findIndex(x => x.channelName == channelNameFiltered);
        if(this.serverStatus.channelCons[indexOfChannel]) {
            if (this.serverStatus.channelCons[indexOfChannel])
            this.serverStatus.channelCons[indexOfChannel].usersInChannel = this.serverStatus.channelCons[indexOfChannel].usersInChannel.concat(m).sort(this.alphebeticSort)
        }
        else {
            console.log('BRAND NEW CHANNEL IS BEING CREATED FOR:', channelNameFiltered);
            this.serverStatus.channelCons.push({ channelName: channelNameFiltered, messages: [], usersInChannel: [] });
            if(this.serverStatus.channelCons[indexOfChannel]) {
                if (this.serverStatus.channelCons[indexOfChannel])
                this.serverStatus.channelCons[indexOfChannel].usersInChannel = this.serverStatus.channelCons[indexOfChannel].usersInChannel.concat(m).sort(this.alphebeticSort)
            }
        }
        
    }

};

