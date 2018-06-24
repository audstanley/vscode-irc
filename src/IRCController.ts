import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { IRCExpressEndpoint } from './express/ircAPI';

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


export class IRCController {
    public IRCExpressEndPointObjectArray : Array<IRCExpressEndpoint>;
    public ircWorkspaceConfig : any;
    public ircWorkspaceServers : Array<ircConnection>;
    public gitChannel : string;
    public html : string;

    constructor(context: vscode.ExtensionContext, gitChannel: string) {
        this.ircWorkspaceConfig = vscode.workspace.getConfiguration('irc')
        this.ircWorkspaceServers = this.ircWorkspaceConfig['servers']
        this.gitChannel = ((this.ircWorkspaceConfig['logIntoGitChannel'])? gitChannel : "");
        this.IRCExpressEndPointObjectArray = [];
        this.html = '';
        console.log('IRCCONTROLLER GITCHANNEL ARRAY:', this.gitChannel)
        if(this.ircWorkspaceConfig) {
            console.log("IRC SERVERS:", JSON.stringify(this.ircWorkspaceConfig['servers'],null,2))
        }

        //setInterval(() => console.log(this.IRCExpressEndPointObjectArray), 20000);
        
    }

    public connectToServers() {
            // Populate a promisified server array 
            let serverPromiseStack : Array<Promise<IRCExpressEndpoint>> |  any = [];
            for (let IRCExpressEndPointConnection of this.ircWorkspaceServers) {
                let IRCExpressEndpointPromise : IRCExpressEndpoint = new IRCExpressEndpoint(IRCExpressEndPointConnection, this.gitChannel)
                serverPromiseStack.push(IRCExpressEndpointPromise.launchIRCConnection())
                serverPromiseStack.push(IRCExpressEndpointPromise.listenToMessages())
                this.IRCExpressEndPointObjectArray.push(IRCExpressEndpointPromise)
            
            }

            // Launch those server connections:
            return Promise.all(serverPromiseStack)
                .then((a: any)=> {
                    console.log('ALL SEVER CONNECTIONS COMPLETE!')
                    console.log("serverPromiseStack:", JSON.stringify(serverPromiseStack, null, 2))

                })
                .catch((e)=> console.log(e))
    }

    public getServerStatusFromIRCEXpressEndPoints() {
        let serverStatusFromIRCEXpressEndPoints : Array<Promise<object>> | any = [];
        for (let IRCExpressEndpoint of this.IRCExpressEndPointObjectArray) {
            serverStatusFromIRCEXpressEndPoints.push( IRCExpressEndpoint.serverStatus )
        }
        return serverStatusFromIRCEXpressEndPoints;
    }

    public getServerEvents() {
        return new Promise((resolve, reject) => {
            let serverEventsArray : Array<EventEmitter> = [];
            for (let IRCExpressEndpoint of this.IRCExpressEndPointObjectArray) {
                serverEventsArray.push( IRCExpressEndpoint.serverEvent )
            }
            if(serverEventsArray == null) reject('The IRCAPI event emitter loading up fast enough.')
            else resolve(serverEventsArray)
        })
    }


};

