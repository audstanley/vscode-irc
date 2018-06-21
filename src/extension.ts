import * as path from 'path';
import * as vscode from 'vscode';
import { IRCExpressEndpoint } from './express/ircAPI';
import { IRCController } from './IRCController';
import * as fs from 'fs';
const fetch = require('node-fetch');
const ini = require('ini');

export function activate(context: vscode.ExtensionContext) {
    console.log('ACTIVATING ENTENSIONCONTEXT')
    let gitConfiguration : string = __dirname.substr(0,__dirname.length - 7) + '.git/config'
    let config = ini.parse(fs.readFileSync(gitConfiguration, 'utf-8'))

    function getRemoteOrginSource() : Promise<string> {
        return new Promise((resolve, reject) => {
            if(config)
                if(config["remote \"origin\""]["url"]) resolve(config["remote \"origin\""]["url"])
                else reject(`Git File: ${gitConfiguration} does not have a remote origin url.`)
            else reject(`Git File: ${gitConfiguration} does not have a remote origin url.`)
        })
    }

    function seeIfProjectIsForked(s : string) : Promise<string> {
        return fetch(s)
            .then((d : any) => d.text())
            .then((d : string) => {
                let forkedRegex = /forked from \<a href="\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)/;
                let forkedArray = d.match(forkedRegex);
                if (forkedArray) {
                    if (forkedArray.length > 1) return [forkedArray[1], forkedArray[2]].join('-');
                    else return "";
                }
                else {
                    let githubLinkArray = s.split('/');
                    if (githubLinkArray) {
                        if (githubLinkArray.length > 4) {
                            return [githubLinkArray[3], githubLinkArray[4]].join('-');
                        }
                        else return "";
                    }
                    else return "";
                }
            }).catch((e: any) => { return [] })
    }

    getRemoteOrginSource()
        .then((s : string)  => seeIfProjectIsForked(s))
        .then((s : string)  => {
            let IRCControllerActiveServerConnection : any = new IRCController(context, s)
            IRCControllerActiveServerConnection.connectToServers()
                .then(() => {
                    console.log("ALL SERVER CONNECTIONS WERE A SUCCESS!")
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

}