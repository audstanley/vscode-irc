import * as vscode from 'vscode';
import { IRCExpressEndpoint } from './express/ircAPI';

interface ircConnection {
    ircUrl        : string;
    port?         : number;
    username      : string;
    channels?     : string[];
    ircNicknames? : string[];
    realName?     : string;
}

export class IRCController {
    public ircWorkspaceConfig : any;
    public ircWorkspaceServers : Array<ircConnection>;
    public gitChannel : string;

    constructor(context: vscode.ExtensionContext, gitChannel: string) {
        this.ircWorkspaceConfig = vscode.workspace.getConfiguration('irc')
        this.ircWorkspaceServers = this.ircWorkspaceConfig['servers']
        this.gitChannel = ((this.ircWorkspaceConfig['logIntoGitChannel'])? gitChannel : "");
        console.log('IRCCONTROLLER GITCHANNEL ARRAY:', this.gitChannel)
        if(this.ircWorkspaceConfig) {
            console.log("IRC SERVERS:", JSON.stringify(this.ircWorkspaceConfig['servers'],null,2))
        }

    }

    public connectToServers() {
            // Populate a promisified server array 
            let serverPromiseStack = [];
            for (let IRCExpressEndPointConnection of this.ircWorkspaceServers) {
                let IRCExpressEndpointPromise : any = new IRCExpressEndpoint(IRCExpressEndPointConnection, this.gitChannel)
                serverPromiseStack.push(IRCExpressEndpointPromise.launchIRCConnection())
                serverPromiseStack.push(IRCExpressEndpointPromise.listenToMessages())
            }

            // Launch those server connections:
            return Promise.all(serverPromiseStack)
                .then((a: any)=> {
                    console.log("PROMISE ALL COMPLETE")
                })
                .catch((e)=> console.log(e))

    }

};

export class IRCPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: IRCPanel | undefined;
    private static readonly viewType = 'IRC';
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionPath: string;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionPath: string) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        // If we already have a panel, show it.
        // Otherwise, create a new panel.
        if (IRCPanel.currentPanel) {
            IRCPanel.currentPanel._panel.reveal(column);
        } else {
            IRCPanel.currentPanel = new IRCPanel(extensionPath, vscode.ViewColumn.Three);
        }
    }

    private constructor(extensionPath: string, column: vscode.ViewColumn) {

        this._extensionPath = extensionPath;
        this._panel = vscode.window.createWebviewPanel(IRCPanel.viewType, "IRC", column, {
            enableScripts: true
        });
        
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.onDidChangeViewState((e : any) => {
            if (this._panel.visible) {
                //this.loadIRCConnection()
            }
        }, null, this._disposables);
        this._panel.webview.onDidReceiveMessage((message : any) => {
            switch (message.command) {
                case 'alert':
                    vscode.window.showErrorMessage(message.text);
                    return;
            }
        }, null, this._disposables);
    }

    public doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }

    public dispose() {
        console.log("DISPOSED FUNCTION WAS CALLED")
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


    // public loadHtmlPage(): void {
    //     let parseArrayofUsersDiv = (a: string[]) : string => `
    //         <div>
    //             ${a.join('<p>')}
    //         </div>`

    //     let styleSheet = () :string => `

    //     `

    //     let parseHtmlBody = () : string => 
    //     `<html>
    //         <style>
    //             ${styleSheet()}
    //         </style>                                  
    //         <body>
    //             <h2>
    //                 <center>
    //                     ${urlPrefix}.${urlBase}.${urlEndPoint}
    //                 </center>
    //             </h2> <p>
    //             <div class="row">
    //                 ${parseArrayofUsersDiv(arrayOfUsers)}
    //             </div>
                
                
    //         </body>
    //     </html>`
        
    //     htmlPage = parseHtmlBody()
    //     this._panel.webview.html = htmlPage
    // } 


    // public loadIRCConnection() {
    //     /** This reload the page every 100 ms */
    //     setInterval(()=> {
    //         this.loadHtmlPage()
    //     }, 100)
    //     // This will also faiil to reconnect if you change windows, but the left over html will still be displayed.

    //     client.connect()
    //         .then(function(res: any) {
    //             //console.log("RESPONSE:", JSON.stringify(res, null, 2))
    //             if (res.isOk()) {
    //                 client.raw(`JOIN #${channel}`);
    //                 //client.raw(`JOIN #minecraft`);
    //                 return res;
    //                 //client.end(); // End connection to server.
    //             }
    //         })
    //         .then((res: any) => {
    //             nickname = res.value.nickname
    //         })
    //         .catch((e: string) => console.log(e));

    //     client.on('data', function(message: string) {
    //         //console.log(message); /*?*/
    //         parseMessage(message);
    //         //loadHtmlPage()
    //     });

    //     let removeSelf = (e: string) => e !== `${nickname}`
    //     let remove = (array: string[], element: string) => array.filter(e => e !== element);
        
    //     function parseMessage(m: string) {

    //         // This will populate the arrayOfUsers on login to the specified channel
    //         let serverUrl = `${urlBase}\.${urlEndPoint}`
    //         let listOfUsersRegex = new RegExp(`:([A-Za-z]+)?\.?${serverUrl} 353 (${nickname}) [@=] #${channel} :(\.+)`);
    //         let matchedUsers = m.match(listOfUsersRegex);
    //         if (matchedUsers !== null) {
    //             if (matchedUsers.length > 3) {
    //                 let matchedUsersCorrectSyntax = matchedUsers[3].replace('@', '')
    //                 //console.log('MATCHED USERS:', matchedUsers[3].replace('@', ''));
    //                 arrayOfUsers = arrayOfUsers.concat(matchedUsersCorrectSyntax.split(' ').filter(removeSelf).sort());
    //                 //console.log("ARRAY_OF_USERS_ON_LOGIN:", arrayOfUsers);
    //             }
    //         }

    //         let userLeftRegex = new RegExp(`(:\\S+) QUIT`);
    //         let userLeftChannel = m.match(userLeftRegex);
    //         if (userLeftChannel !== null) {
    //             if (userLeftChannel.length > 0) {
    //                 let theUserThatLeft = userLeftChannel[1].match(/:([a-zA-Z0-9\^-_]+)!/)
    //                 if (theUserThatLeft !== null) {
    //                     //console.log("USER_THAT_LEFT_CHANNEL:", userLeftChannel);
    //                     arrayOfUsers = remove(arrayOfUsers, theUserThatLeft[1]).sort();
    //                     //console.log("ARRAY_OF_USERS_AFTER_QUIT:", arrayOfUsers);
    //                 }
    //             }
    //         }

    //         let userJoinedRegex = new RegExp(`(:\\S+) JOIN #${channel}`);
    //         let userJoinedChannel = m.match(userJoinedRegex)
    //         if (userJoinedChannel !== null) {
    //             if (userJoinedChannel.length > 0) {
    //                 let theUserThatJoined = userJoinedChannel[1].match(/:([a-zA-Z0-9\^-_]+)!/)
    //                 if (theUserThatJoined !== null) {
    //                     //console.log("USER_JOINED:", userJoinedChannel[1])
    //                     arrayOfUsers = arrayOfUsers.concat([theUserThatJoined[1]]).sort();
    //                     //console.log("ARRAY_OF_USERS_AFTER_JOIN:", arrayOfUsers)
    //                 }
    //             }
    //         }
    //     }


    //}

    

    



}