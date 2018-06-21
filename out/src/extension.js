"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const IRCController_1 = require("./IRCController");
const gitChannel_1 = require("./gitChannel");
const IRCController_2 = require("./IRCController");
const fs = require("fs");
const fetch = require('node-fetch');
const ini = require('ini');
function activate(context) {
    console.log('ACTIVATING ENTENSIONCONTEXT');
    let gitConfiguration = __dirname.substr(0, __dirname.length - 7) + '.git/config';
    let gitConfigurationObject = ini.parse(fs.readFileSync(gitConfiguration, 'utf-8'));
    let vscodeConfig = vscode.extensions.getExtension('audstanley.vscode-irc');
    let vscodeWorkspaceConfig = vscode.workspace.getConfiguration('irc');
    context.subscriptions.push(vscode.commands.registerCommand('irc.start', () => {
        IRCController_2.IRCPanel.createOrShow(context.extensionPath);
        //vscode.window.showInformationMessage('IRC Client loaded');
        gitChannel_1.getRemoteOrginSource(gitConfigurationObject, gitConfiguration)
            .then((s) => gitChannel_1.seeIfProjectIsForked(s))
            .then((s) => {
            let IRCControllerActiveServerConnection = new IRCController_1.IRCController(context, s);
            IRCControllerActiveServerConnection.connectToServers()
                .then(() => {
                console.log("ALL SERVER CONNECTIONS WERE A SUCCESS, GITCONFIG: ", s);
            });
        })
            .catch((e) => {
            console.log(e);
            let IRCControllerActiveServerConnection = new IRCController_1.IRCController(context, 'audstanley');
            IRCControllerActiveServerConnection.connectToServers()
                .then(() => {
                console.log("ALL SERVER CONNECTIONS WERE A SUCCESS!");
            });
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('irc.doRefactor', () => {
        if (IRCController_2.IRCPanel.currentPanel) {
            IRCController_2.IRCPanel.currentPanel.doRefactor();
        }
    }));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map