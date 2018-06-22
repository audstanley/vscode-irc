"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const IRCController_1 = require("./IRCController");
const gitChannel_1 = require("./gitChannel");
const fs = require("fs");
const fetch = require('node-fetch');
const ini = require('ini');
let html = '';
function activate(context) {
    console.log('ACTIVATING ENTENSIONCONTEXT');
    let gitConfiguration = __dirname.substr(0, __dirname.length - 7) + '.git/config';
    let gitConfigurationObject = ini.parse(fs.readFileSync(gitConfiguration, 'utf-8'));
    let IRCControllerActiveServerConnection;
    let vscodeConfig = vscode.extensions.getExtension('audstanley.vscode-irc');
    let vscodeWorkspaceConfig = vscode.workspace.getConfiguration('irc');
    context.subscriptions.push(vscode.commands.registerCommand('irc.start', () => {
        IRCPanel.createOrShow(context.extensionPath);
        //vscode.window.showInformationMessage('IRC Client loaded');
        gitChannel_1.getRemoteOrginSource(gitConfigurationObject, gitConfiguration)
            .then((s) => gitChannel_1.seeIfProjectIsForked(s))
            .then((s) => {
            IRCControllerActiveServerConnection = new IRCController_1.IRCController(context, s);
            IRCControllerActiveServerConnection.connectToServers()
                .then((servers) => {
                console.log("ALL SERVER CONNECTIONS WERE A SUCCESS, GITCONFIG: ", s, "SERVERS:", servers);
                html = JSON.stringify(IRCControllerActiveServerConnection.getServerStatusFromIRCEXpressEndPoints(), null, 2);
            });
        })
            .catch((e) => {
            console.log(e);
            let IRCControllerActiveServerConnection = new IRCController_1.IRCController(context, 'audstanley');
            IRCControllerActiveServerConnection.connectToServers()
                .then((servers) => {
                console.log("ALL SERVER CONNECTIONS WERE A SUCCESS!", servers);
            });
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('irc.doRefactor', () => {
        if (IRCPanel.currentPanel) {
            IRCPanel.currentPanel.doRefactor();
        }
    }));
    setInterval(() => {
        html = JSON.stringify(IRCControllerActiveServerConnection.getServerStatusFromIRCEXpressEndPoints(), null, 2);
    }, 1000);
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
            setInterval(() => this.loadMessages(), 1000);
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
        loadMessages() {
            let htmlPage = `<html><body><h2>${html}</h2></body></html>`;
            this._panel.webview.html = htmlPage;
        }
    }
    IRCPanel.viewType = 'IRC';
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map