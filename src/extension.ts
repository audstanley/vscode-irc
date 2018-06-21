import * as path from 'path';
import * as vscode from 'vscode';
import { IRCExpressEndpoint } from './express/ircAPI';
import { IRCController } from './IRCController';
import { getRemoteOrginSource, seeIfProjectIsForked } from './gitChannel'
import { IRCPanel } from './IRCController'
import * as fs from 'fs';
const fetch = require('node-fetch');
const ini = require('ini');

export function activate(context: vscode.ExtensionContext) {
    console.log('ACTIVATING ENTENSIONCONTEXT')
    let gitConfiguration : string = __dirname.substr(0,__dirname.length - 7) + '.git/config'
    let gitConfigurationObject = ini.parse(fs.readFileSync(gitConfiguration, 'utf-8'))

    let vscodeConfig = vscode.extensions.getExtension('audstanley.vscode-irc')
    let vscodeWorkspaceConfig = vscode.workspace.getConfiguration('irc')

    context.subscriptions.push(vscode.commands.registerCommand('irc.start', () => {
        IRCPanel.createOrShow(context.extensionPath);
        //vscode.window.showInformationMessage('IRC Client loaded');
        getRemoteOrginSource(gitConfigurationObject, gitConfiguration)
            .then((s : string)  => seeIfProjectIsForked(s))
            .then((s : string)  => {
                let IRCControllerActiveServerConnection : any = new IRCController(context, s)
                IRCControllerActiveServerConnection.connectToServers()
                    .then(() => {
                        console.log("ALL SERVER CONNECTIONS WERE A SUCCESS, GITCONFIG: ", s)
                    })
            })
            .catch((e : string) => {
                console.log(e);
                let IRCControllerActiveServerConnection : any = new IRCController(context, 'audstanley')
                IRCControllerActiveServerConnection.connectToServers()
                    .then(() => {
                        console.log("ALL SERVER CONNECTIONS WERE A SUCCESS!")
                    })
            })
    }));

    context.subscriptions.push(vscode.commands.registerCommand('irc.doRefactor', () => {
        if (IRCPanel.currentPanel) {
            IRCPanel.currentPanel.doRefactor();
        }
    }));

}