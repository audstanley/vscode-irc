"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ircAPI_1 = require("./express/ircAPI");
class IRCController {
    constructor(context, gitChannel) {
        this.ircWorkspaceConfig = vscode.workspace.getConfiguration('irc');
        this.ircWorkspaceServers = this.ircWorkspaceConfig['servers'];
        this.gitChannel = ((this.ircWorkspaceConfig['logIntoGitChannel']) ? gitChannel : "");
        console.log('IRCCONTROLLER GITCHANNEL ARRAY:', this.gitChannel);
        if (this.ircWorkspaceConfig) {
            console.log("IRC SERVERS:", JSON.stringify(this.ircWorkspaceConfig['servers'], null, 2));
        }
    }
    connectToServers() {
        // Populate a promisified server array 
        let serverPromiseStack = [];
        for (let IRCExpressEndPointConnection of this.ircWorkspaceServers) {
            let IRCExpressEndpointPromise = new ircAPI_1.IRCExpressEndpoint(IRCExpressEndPointConnection, this.gitChannel);
            serverPromiseStack.push(IRCExpressEndpointPromise.launchIRCConnection());
            serverPromiseStack.push(IRCExpressEndpointPromise.listenToMessages());
        }
        // Launch those server connections:
        return Promise.all(serverPromiseStack)
            .then((a) => {
            console.log("PROMISE ALL COMPLETE");
        })
            .catch((e) => console.log(e));
    }
}
exports.IRCController = IRCController;
;
class IRCPanel {
    constructor(extensionPath, column) {
        this._disposables = [];
        this._extensionPath = extensionPath;
        this._panel = vscode.window.createWebviewPanel(IRCPanel.viewType, "IRC", column, {
            enableScripts: true
        });
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.onDidChangeViewState((e) => {
            if (this._panel.visible) {
                //this.loadIRCConnection()
            }
        }, null, this._disposables);
        this._panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'alert':
                    vscode.window.showErrorMessage(message.text);
                    return;
            }
        }, null, this._disposables);
    }
    static createOrShow(extensionPath) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        // If we already have a panel, show it.
        // Otherwise, create a new panel.
        if (IRCPanel.currentPanel) {
            IRCPanel.currentPanel._panel.reveal(column);
        }
        else {
            IRCPanel.currentPanel = new IRCPanel(extensionPath, vscode.ViewColumn.Three);
        }
    }
    doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }
    dispose() {
        console.log("DISPOSED FUNCTION WAS CALLED");
        //** This is what happens when we switch window panels */
        IRCPanel.currentPanel = undefined;
        //client.end()
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
IRCPanel.viewType = 'IRC';
exports.IRCPanel = IRCPanel;
//# sourceMappingURL=IRCController.js.map