"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ircAPI_1 = require("./express/ircAPI");
class IRCController {
    constructor(context, gitChannel) {
        this.ircWorkspaceConfig = vscode.workspace.getConfiguration('irc');
        this.ircWorkspaceServers = this.ircWorkspaceConfig['servers'];
        this.gitChannel = ((this.ircWorkspaceConfig['logIntoGitChannel']) ? gitChannel : "");
        this.IRCExpressEndPointObjectArray = [];
        this.html = '';
        console.log('IRCCONTROLLER GITCHANNEL ARRAY:', this.gitChannel);
        if (this.ircWorkspaceConfig) {
            console.log("IRC SERVERS:", JSON.stringify(this.ircWorkspaceConfig['servers'], null, 2));
        }
        //setInterval(() => console.log(this.IRCExpressEndPointObjectArray), 20000);
    }
    connectToServers() {
        // Populate a promisified server array 
        let serverPromiseStack = [];
        for (let IRCExpressEndPointConnection of this.ircWorkspaceServers) {
            let IRCExpressEndpointPromise = new ircAPI_1.IRCExpressEndpoint(IRCExpressEndPointConnection, this.gitChannel);
            serverPromiseStack.push(IRCExpressEndpointPromise.launchIRCConnection());
            serverPromiseStack.push(IRCExpressEndpointPromise.listenToMessages());
            this.IRCExpressEndPointObjectArray.push(IRCExpressEndpointPromise);
        }
        // Launch those server connections:
        return Promise.all(serverPromiseStack)
            .then((a) => {
            console.log('ALL SEVER CONNECTIONS COMPLETE!');
            console.log("serverPromiseStack:", JSON.stringify(serverPromiseStack, null, 2));
        })
            .catch((e) => console.log(e));
    }
    getServerStatusFromIRCEXpressEndPoints() {
        let serverStatusFromIRCEXpressEndPoints = [];
        for (let IRCExpressEndpoint of this.IRCExpressEndPointObjectArray) {
            serverStatusFromIRCEXpressEndPoints.push(IRCExpressEndpoint.serverStatus);
        }
        return serverStatusFromIRCEXpressEndPoints;
    }
}
exports.IRCController = IRCController;
;
//# sourceMappingURL=IRCController.js.map