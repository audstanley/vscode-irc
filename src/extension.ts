import * as vscode from 'vscode';
import { IRCController } from './IRCController';
import { getRemoteOrginSource, seeIfProjectIsForked } from './gitChannel'
import { EventEmitter } from 'events';
import * as fs from 'fs';
const fetch = require('node-fetch');
const ini = require('ini');

let html = '';
let servers = '';

let lorem = `Lorem ipsum dolor sit amet, tantas aliquip copiosae te mea. Sea ea nihil feugait. In vix tritani incorrupte, perpetua qualisque his cu, eu vis debet essent integre. Vel cu debitis recusabo voluptaria. Vix ubique essent repudiare ad. Minim detracto delicatissimi ei est, et per enim partiendo. In nec minim regione imperdiet.
Cum cu accusam facilisi, liber appetere temporibus vix no, sed exerci mediocritatem an. An atqui iuvaret vis. Ei mea lobortis theophrastus. Eum magna lobortis explicari ex, vel ne eros imperdiet intellegat. Ludus consul consulatu vel in, mel ne porro commune honestatis.
Nam wisi pertinacia at. Est alii efficiendi liberavisse et, audiam vidisse qualisque pro ut, in nec malis offendit. Mea putent maluisset ex. Ea eum sint melius timeam, et pri porro eirmod principes, quot velit vocibus est eu. No sumo perfecto sed, ne vix alii accusamus.
Eam option detracto volutpat te, eum propriae imperdiet laboramus ad. Vis no veniam interpretaris, vel enim molestie et. Causae phaedrum voluptatum vim in. Mandamus facilisis sed at, scaevola apeirian legendos ne mea, mei an bonorum erroribus. In debet everti propriae mea, eu ius aperiam periculis philosophia. Diceret sententiae disputationi ex duo, eam adhuc vivendo percipitur ea.
Mel graece interesset ex. An partem instructior eam. Sed everti quaestio urbanitas ei, ferri comprehensam eam ei. His minim persequeris an. An sit luptatum constituam. Ponderum partiendo eum ei, sonet congue inciderint cu ius.
Amet decore graeci pro an. Iisque pertinax aliquando id nam. Utinam mentitum electram ea nam. Ne mel erat aliquam adipiscing. Nam ei iusto nostro adolescens.
Cu nec qualisque abhorreant accommodare, nam unum consectetuer at. Est natum philosophia ne. Eros causae accusamus an vis. Pro an iracundia interpretaris. Autem pertinacia interpretaris usu no, habeo soluta eu est, ut mundi populo pri.
Eos at alia appareat consectetuer, novum mundi dissentias eos ei, unum aliquam no has. Liber eirmod ut has. Zril alienum vituperatoribus vis no, officiis periculis ad vix. Justo scaevola eu per. No modus denique qui, eu sit unum laudem possim. Has in facete numquam appellantur, vis idque sonet an.
Pri aeque expetenda at, quis ornatus id est. At quidam fabellas vel, mel ei nulla eripuit blandit. Aliquip reprimique voluptatibus no his, ea ridens euismod est. Sumo dolores iudicabit mea id, cetero praesent ad eos. Quo te sint aliquip. Mei doming copiosae fabellas ea, eu eam sonet constituto theophrastus, est justo lorem epicurei no. No causae animal reprimique cum.
Nemore appellantur no pro, duo te modo nobis liberavisse. Inani option phaedrum at pri, maiorum consulatu cu his. Vis id semper complectitur. Ad per meis noluisse partiendo, per id dicant tacimates temporibus.
Ad vix tale alterum accumsan, duo euismod pertinax ei, omnis prompta aliquid eam ut. Illum dicunt neglegentur ius in, veniam assueverit id eos. Modus repudiare vix ne, altera dolorum neglegentur ne est, qui et tation soleat. Tacimates pericula et mea, civibus molestiae cu eos. At cum purto nostrud singulis, in error tractatos per.
Mei ad iusto dolore, semper scaevola quo cu. Id quis purto salutandi per. Harum reprimique ut vix, populo constituam has eu, facilis expetendis intellegebat te cum. Cetero repudiare mel in, te sed soluta dolorum dissentiet.
Vis ex accumsan iracundia. Similique conclusionemque qui in, at mazim graece moderatius eos. Error qualisque cum id, has ei doctus malorum voluptaria. Sed cu patrioque sententiae, te quod nonumy interesset per, eum paulo detracto patrioque ad. Eu has dicunt option facilisis, ea insolens mandamus vis. Qui ut ferri quaeque.
Ius tota integre tractatos ex, commodo adversarium ut pro. Nam omnesque posidonium et, te vix omnis prima. Sit ex dico nobis dissentias. Omnes vivendo quaerendum duo te, velit tantas an eos.
Eum eu enim omnis platonem, vix veritus delectus accusamus ex. Ex senserit efficiendi interesset eum, pri cu dictas doctus, vero persius vix et. Sed justo novum euripidis at. Sed et persius percipit persequeris, meliore laboramus qui in, ad vix legimus postulant. Vitae partem efficiendi cu cum, at putent graecis has, ipsum viris ad vel. No option saperet per, in eam legere aliquam molestie.
Sit dolor denique an. Delenit postulant scripserit vix te, ne vix quod esse. Ei legere maiestatis pri, in vidisse minimum constituam nam. Veritus nostrum vituperata at sea. Mea id iudico scripta, natum audiam postulant at eos.
No sit nostro omittam. Alii deleniti est ex. Omnes meliore consetetur ex sed, augue copiosae ex his, labores nusquam theophrastus te eam. Ei dicant mediocrem eum, sanctus definitiones usu et, eripuit insolens dignissim ad pro. Vix error errem urbanitas ut, doming propriae cu sed. Nec ea admodum voluptua cotidieque, vix cu sumo pertinax. Consul labitur efficiantur an cum, quo te indoctum laboramus.
Mel ne senserit comprehensam necessitatibus, per an numquam nominati. Mel cu eius zril, copiosae salutatus adolescens per ea, ferri urbanitas ei eos. Per te alienum scriptorem comprehensam, ius eu probatus democritum repudiandae, at nam prima philosophia. Nobis nonumes at mei, ex eos suas ipsum consequat. No sea virtute nostrum. Pro eu inani malorum repudiandae.
Ancillae oportere qualisque id sed. Duo ne iudicabit euripidis, eruditi postulant mel ne, nibh urbanitas quo cu. Accusamus reprimique complectitur pro cu. Pro an quas omnis, prompta tacimates hendrerit cu est, duis eruditi tractatos ei mei.
Mea eu liber mandamus, stet graece quaerendum et vix. Ea wisi noluisse torquatos qui, ei quo tota homero causae. Officiis evertitur et per. Pri ex meis graece invenire, ex inermis molestiae signiferumque vix. Meis conceptam eu sit, summo dolorum alienum ex nam, at eum harum dolorum.
Quot mollis ut qui. At erat sanctus nam, primis quidam nostrud ex vel. Sed tibique deterruisset ut, diceret maiorum vel cu, ex vel splendide intellegam. Ea pro decore populo apeirian, eam expetenda deseruisse eu. No hinc meliore quo, vitae facete labitur ne nec. Delectus deterruisset ad pri.
Mea lorem tollit dissentiunt ea. Doctus ponderum vis et, ei eam quem case, ad nam tantas utroque elaboraret. Mei mediocrem signiferumque cu. Ad qui percipit pertinax, nonumes signiferumque te eam, volutpat rationibus vel id. Qui ei vidit dolore, semper suscipit scriptorem vis id, quod labitur copiosae mel at.
Ex nam homero diceret, posse mentitum est cu, ex nostro omittam voluptaria usu.`

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

let serverEvents: Promise<Array<EventEmitter>> | any;

export function activate(context: vscode.ExtensionContext) {
    console.log('ACTIVATING ENTENSIONCONTEXT')
    let gitConfiguration : string = __dirname.substr(0,__dirname.length - 7) + '.git/config'
    let gitConfigurationObject = ini.parse(fs.readFileSync(gitConfiguration, 'utf-8'))
    let IRCControllerActiveServerConnection : IRCController;
    let vscodeConfig = vscode.extensions.getExtension('audstanley.vscode-irc')
    let vscodeWorkspaceConfig = vscode.workspace.getConfiguration('irc')

    context.subscriptions.push(vscode.commands.registerCommand('irc.start', () => {
        IRCPanel.createOrShow(context.extensionPath);
        //vscode.window.showInformationMessage('IRC Client loaded');
        getRemoteOrginSource(gitConfigurationObject, gitConfiguration)
            .then((s : string)  => seeIfProjectIsForked(s))
            .then((s : string)  => {
                IRCControllerActiveServerConnection = new IRCController(context, s)
                IRCControllerActiveServerConnection.connectToServers()
                    .then((servers : any) => {
                        console.log("ALL SERVER CONNECTIONS WERE A SUCCESS, GITCONFIG: ", s, "SERVERS:", servers)
                        html = JSON.stringify(IRCControllerActiveServerConnection.getServerStatusFromIRCEXpressEndPoints(),null,2)
                        return IRCControllerActiveServerConnection.getServerEvents()
                    }).then((serverEventsArray : Promise<Array<EventEmitter>> | any) => {
                        serverEvents = serverEventsArray;
                        for (let serverEvent of serverEventsArray) {
                            serverEvent.on('newMessage', (serverStatus : serverStatus) => {
                                console.log('IT WOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOORKED')
                                console.log("SERVERSTATUS CHANGED:", JSON.stringify(serverStatus,null,2))
                            })
                        }
                    })
            })
            .catch((e : string) => {
                console.log(e);
                let IRCControllerActiveServerConnection : any = new IRCController(context, 'audstanley')
                IRCControllerActiveServerConnection.connectToServers()
                    .then((servers : any) => {
                        console.log("ALL SERVER CONNECTIONS WERE A SUCCESS!", servers)
                        console.log("PROMISE ERROR OCCURED in getRemoteOrginSource")
                    })
            })
    }));

    context.subscriptions.push(vscode.commands.registerCommand('irc.doRefactor', () => {
        if (IRCPanel.currentPanel) {
            IRCPanel.currentPanel.doRefactor();
        }
    }));


    setInterval(()=> {
        let serverStatusArray : Array<Promise<object>> | any = IRCControllerActiveServerConnection.getServerStatusFromIRCEXpressEndPoints()
        console.log(serverStatusArray)
        let serverHtml = ''
        for(let server of serverStatusArray) {
            serverHtml.concat(`${server.serverName}<br />`)
        }
        serverHtml = `<div>${serverHtml}</div>`

        html = JSON.stringify(IRCControllerActiveServerConnection.getServerStatusFromIRCEXpressEndPoints(),null,2)
        servers = serverHtml

    }, 1000)

    

    class IRCPanel {
        /**
         * Track the currently panel. Only allow a single panel to exist at a time.
         */
        public static currentPanel: IRCPanel | undefined;
        private static readonly viewType = 'IRC';
        private readonly _panel: vscode.WebviewPanel;
        private readonly _extensionPath: string;
        private _disposables: vscode.Disposable[] = [];
        public serverEventsArray: Promise<Array<EventEmitter>> | any;

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
                    // nothing yet.
                }
            }, null, this._disposables);
            this._panel.webview.onDidReceiveMessage((message : any) => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                }
            }, null, this._disposables);
            //this.serverEventsArray.then((serverEventsArray : Promise<Array<EventEmitter>> | any) =>  {
            //    console.log('IRCPANEL got the serverEvents array.')
            //}).catch((e : any) => console.log('Promise Error in IRCPanel Eventloading'))

            setInterval(()=> this.loadMessages(), 1000);
        }

        public doSomething(message: serverStatus) {
            console.log(message)
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

        public loadStyle() {
            return (`
            <style>
                body { 
                    display: grid;
                    grid-template-areas: 
                        "header header ads"
                        "nav article article"
                        "nav footer footer";
                    grid-template-rows: 23fr 1fr;  
                    grid-template-columns: 1fr 4fr 1fr;
                    grid-row-gap: 10px;
                    grid-column-gap: 10px;
                    height: 100vh;
                    margin: 0;
                }  
                header, footer, article, nav, div {
                padding: 1.2em;
                overflow: auto;
                }
                #pageHeader {
                grid-area: header;
                }
                #pageFooter {
                grid-area: footer;
                }
                #mainArticle { 
                grid-area: article;      
                }
                #mainNav { 
                grid-area: nav; 
                }
                #siteAds { 
                grid-area: ads; 
                } 
                /* Stack the layout on small devices/viewports. */
                @media all and (max-width: 575px) {
                /*
                body { 
                    grid-template-areas: 
                    "header"
                    "article"
                    "ads"
                    "nav"
                    "footer";
                    grid-template-rows: 80px 1fr 70px 1fr 70px;  
                    grid-template-columns: 1fr;
                } */
                }
            </style>
            
            `)
        }


        public loadStyle2() {
            return (`
            <style>
            .grid-container {
                display: grid;
                height: 100%;
                grid-template-columns: 150px 1fr 150px;
                grid-template-rows: 30px 1fr 30px;
                grid-template-areas: ". header nickName" "leftPanel messageArea userList" ". inputField .";
              }

              br {
                display: block;
                margin: 10px 0;
              }
              
              .leftPanel {
                display: grid;
                grid-area: leftPanel;
                grid-template-columns: 1fr;
                grid-template-rows: 150px 1fr;
                grid-template-areas: "serverList" "channelList";
                grid-column-gap: 5px;
                grid-row-gap: 5px;
              }
              
              .channelList {
                border: 1px solid black;
                border-style: rounded;
                grid-area: channelList;
                overflow: auto;
              }
              
              .serverList {
                border: 1px solid black;
                border-style: rounded;
                grid-area: serverList;
                overflow: auto;
              }
              
              .userList {
                border: 1px solid black;
                border-style: rounded;
                grid-area: userList;
                overflow: auto;
              }
              
              .nickName {
                border: 1px solid black;
                border-style: rounded;
                grid-area: nickName;
              }
              
              .inputField {
                border: 1px solid black;
                border-style: rounded;
                grid-area: inputField;
              }
              
              .header {
                border: 1px solid black;
                border-style: rounded;
                grid-area: header;
              }
              
              .messageArea {
                border: 1px solid black;
                border-style: rounded;
                grid-area: messageArea;
                overflow: auto;
              }
              </style>
            `)
        }


        public loadMessages() : void {
            let htmlPage = `<html>${this.loadStyle2()}<body>
                    
            <div class="grid-container">
                <div class="leftPanel">
                    <div class="channelList">
                        ${lorem}
                    </div>
                    <div class="serverList">
                        ${servers}
                    </div>
                </div>
                <div class="userList">
                ${lorem}
                </div>
                <div class="nickName">
                </div>
                <div class="inputField">
                    <input type="text" name="message">
                    <input type="submit" value="Submit">
                </div>
                <div class="header">
                </div>
                <div class="messageArea">
                    ${html}
                </div>
            </div>
                    
                </body></html>`;
            this._panel.webview.html = htmlPage
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



}

