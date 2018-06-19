import * as path from 'path';
import * as vscode from 'vscode';
const NetSocket = require("net").Socket;
const IrcSocket = require("irc-socket");

let channel = 'minecraft'

// hopefull we can load the ircUrl from the user:
let ircUrl = 'irc.freenode.net'
let ircUrlMatch = ircUrl.match(/([a-zA-Z]+)\.([a-zA-Z0-9-_]+)\.([a-zA-Z0-9-_]{2,5})/);
let urlPrefix = ((ircUrlMatch)? ircUrlMatch[1] : 'irc');
let urlBase = ((ircUrlMatch)? ircUrlMatch[2] : 'freenode');
let urlEndPoint = ((ircUrlMatch)? ircUrlMatch[3] : 'com');
let netSocket = new NetSocket();
let client = IrcSocket({
    socket: netSocket,

    port: 6667,
    server: `${urlPrefix}.${urlBase}.${urlEndPoint}`,
    nicknames: ["audstanley-4", "audstanley-5"],
    username: "audstanley",
    realname: "Richard Stanley",
});


let messagesTest = ['aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd',
'aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd',
'aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd',
'aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd',
'aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd',
'aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd',
'aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd','aadwoiawd']

let nickname: any = undefined
let arrayOfUsers: string[] = Array.prototype
let htmlPage: string = "Loading"

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('irc.start', () => {
        IRCPanel.createOrShow(context.extensionPath);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('irc.doRefactor', () => {
        if (IRCPanel.currentPanel) {
            IRCPanel.currentPanel.doRefactor();
        }
    }));
}

/**
 * Manages cat coding webview panels
 */
class IRCPanel {
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
            IRCPanel.currentPanel = new IRCPanel(extensionPath, column || vscode.ViewColumn.One);
        }
    }

    private constructor(extensionPath: string, column: vscode.ViewColumn) {
        this._extensionPath = extensionPath;
        this._panel = vscode.window.createWebviewPanel(IRCPanel.viewType, "IRC", column, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this._extensionPath, 'media'))
            ]
        });

        this.loadIRCConnection();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.onDidChangeViewState((e : any) => {
            if (this._panel.visible) {
                this.loadIRCConnection()
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

    
    public loadHtmlPage(): void {
        let parseArrayofUsersDiv = (a: string[]) : string => `
            <div>
                ${a.join('<p>')}
            </div>`

        let styleSheet = () :string => `

        `

        let parseHtmlBody = () : string => 
        `<html>
            <style>
                ${styleSheet()}
            </style>                                  
            <body>
                <h2>
                    <center>
                        ${urlPrefix}.${urlBase}.${urlEndPoint}
                    </center>
                </h2> <p>
                <div class="row">
                    ${parseArrayofUsersDiv(arrayOfUsers)}
                </div>
                
                
            </body>
        </html>`
        
        htmlPage = parseHtmlBody()
        this._panel.webview.html = htmlPage
    }


    public loadIRCConnection() {
        /** This reload the page every 100 ms */
        setInterval(()=> {
            this.loadHtmlPage()
        }, 100)
        // This will also faiil to reconnect if you change windows, but the left over html will still be displayed.

        client.connect()
            .then(function(res: any) {
                console.log("RESPONSE:", JSON.stringify(res, null, 2))
                if (res.isOk()) {
                    client.raw(`JOIN #${channel}`);
                    //client.raw(`JOIN #minecraft`);
                    return res;
                    //client.end(); // End connection to server.
                }
            })
            .then((res: any) => {
                nickname = res.value.nickname
            })
            .catch((e: string) => console.log(e));

        client.on('data', function(message: string) {
            console.log(message); /*?*/
            parseMessage(message);
            //loadHtmlPage()
        });

        let removeSelf = (e: string) => e !== `${nickname}`
        let remove = (array: string[], element: string) => array.filter(e => e !== element);
        
        function parseMessage(m: string) {
            let serverUrl = `${urlBase}\.${urlEndPoint}`
            let listOfUsersRegex = new RegExp(`:([A-Za-z]+)?\.?${serverUrl} 353 (${nickname}) [@=] #${channel} :(\.+)`);
            let matchedUsers = m.match(listOfUsersRegex);
            if (matchedUsers !== null) {
                if (matchedUsers.length > 3) {
                    let matchedUsersCorrectSyntax = matchedUsers[3].replace('@', '')
                    console.log('MATCHED USERS:', matchedUsers[3].replace('@', ''));
                    arrayOfUsers = arrayOfUsers.concat(matchedUsersCorrectSyntax.split(' ').filter(removeSelf));
                    console.log("ARRAY_OF_USERS_ON_LOGIN:", arrayOfUsers);
                }
            }

            let userLeftRegex = new RegExp(`(:\\S+) QUIT`);
            let userLeftChannel = m.match(userLeftRegex);
            if (userLeftChannel !== null) {
                if (userLeftChannel.length > 0) {
                    let theUserThatLeft = userLeftChannel[1].match(/:([a-zA-Z0-9\^-_]+)!/)
                    if (theUserThatLeft !== null) {
                        console.log("USER_THAT_LEFT_CHANNEL:", userLeftChannel);
                        arrayOfUsers = remove(arrayOfUsers, theUserThatLeft[1]);
                        console.log("ARRAY_OF_USERS_AFTER_QUIT:", arrayOfUsers);
                    }
                }
            }

            let userJoinedRegex = new RegExp(`(:\\S+) JOIN #${channel}`);
            let userJoinedChannel = m.match(userJoinedRegex)
            if (userJoinedChannel !== null) {
                if (userJoinedChannel.length > 0) {
                    let theUserThatJoined = userJoinedChannel[1].match(/:([a-zA-Z0-9\^-_]+)!/)
                    if (theUserThatJoined !== null) {
                        console.log("USER_JOINED:", userJoinedChannel[1])
                        arrayOfUsers = arrayOfUsers.concat([theUserThatJoined[1]])
                        console.log("ARRAY_OF_USERS_AFTER_JOIN:", arrayOfUsers)
                    }
                }
            }
        }
    }

    

    public doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }

    public dispose() {
        IRCPanel.currentPanel = undefined;

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

// =======================================================================================

/**
 * FOR REFERENCE BELOW:
 */

const cats = {
    'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
    'Testing Cat': 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif'
};


/**
 * Manages cat coding webview panels
 */
class CatCodingPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: CatCodingPanel | undefined;

    private static readonly viewType = 'catCoding';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionPath: string;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionPath: string) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        // If we already have a panel, show it.
        // Otherwise, create a new panel.
        if (CatCodingPanel.currentPanel) {
            CatCodingPanel.currentPanel._panel.reveal(column);
        } else {
            CatCodingPanel.currentPanel = new CatCodingPanel(extensionPath, column || vscode.ViewColumn.One);
        }
    }

    private constructor(extensionPath: string, column: vscode.ViewColumn) {
        this._extensionPath = extensionPath;

        // Create and show a new webview panel
        this._panel = vscode.window.createWebviewPanel(CatCodingPanel.viewType, "IRC", column, {
            // Enable javascript in the webview
            enableScripts: true,

            // And restric the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [
                vscode.Uri.file(path.join(this._extensionPath, 'media'))
            ]
        });

        // Set the webview's initial html content 
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState((e : any) => {
            if (this._panel.visible) {
                this._update()
            }
        }, null, this._disposables);

        // Handle messages from the webview
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
        CatCodingPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        // Vary the webview's content based on where it is located in the editor.
        switch (this._panel.viewColumn) {
            case vscode.ViewColumn.Two:
                this._updateForCat('Compiling Cat');
                return;

            case vscode.ViewColumn.Three:
                this._updateForCat('Testing Cat');
                return;

            case vscode.ViewColumn.One:
            default:
                this._updateForCat('Coding Cat');
                return;
        }
    }

    private _updateForCat(catName: keyof typeof cats) {
        this._panel.title = catName;
        this._panel.webview.html = this._getHtmlForWebview(cats[catName]);
    }

    private _getHtmlForWebview(catGif: string) {

        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'media', 'main.js'));

        // And the uri we use to load this script in the webview
        const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });

        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">

                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';">

                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cat Coding</title>
            </head>
            <body>
                <img src="${catGif}" width="300" />
                <h1 id="lines-of-code-counter">0</h1>

                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}