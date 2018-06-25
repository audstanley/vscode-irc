"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const IRCController_1 = require("./IRCController");
const gitChannel_1 = require("./gitChannel");
const fs = require("fs");
const fetch = require('node-fetch');
const ini = require('ini');
let html = 'Loading...';
let servers = 'Loading...';
let channels = 'Loading...';
let users = 'Loading...';
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
Ex nam homero diceret, posse mentitum est cu, ex nostro omittam voluptaria usu.`;
let serverEvents;
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
                return IRCControllerActiveServerConnection.getServerEvents();
            }).then((serverEventsArray) => {
                serverEvents = serverEventsArray;
                for (let serverEvent of serverEventsArray) {
                    serverEvent.on('newMessage', (serverStatus) => {
                        console.log("SERVERSTATUS CHANGED:", JSON.stringify(serverStatus, null, 2));
                        if (IRCPanel.currentPanel)
                            IRCPanel.currentPanel.updatedServerStatusToPanel(serverStatus, IRCControllerActiveServerConnection.getServerStatusFromIRCEXpressEndPoints());
                    });
                }
            });
        })
            .catch((e) => {
            console.log(e);
            let IRCControllerActiveServerConnection = new IRCController_1.IRCController(context, 'audstanley');
            IRCControllerActiveServerConnection.connectToServers()
                .then((servers) => {
                console.log("ALL SERVER CONNECTIONS WERE A SUCCESS!", servers);
                console.log("PROMISE ERROR OCCURED in getRemoteOrginSource");
            });
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('irc.doRefactor', () => {
        if (IRCPanel.currentPanel) {
            IRCPanel.currentPanel.doRefactor();
        }
    }));
    /*
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
    */
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
                    // nothing yet.
                }
            }, null, this._disposables);
            this._panel.webview.onDidReceiveMessage((message) => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                }
            }, null, this._disposables);
            this.loadMessages();
            // this.serverEventsArray
            //     .then((serverEventsArray : Promise<Array<EventEmitter>> | any) =>  {
            //         console.log('IRCPANEL got the serverEvents array:', serverEventsArray)
            //     }).catch((e : any) => console.log('Promise Error in IRCPanel Eventloading'))
            //this.doSomething();
            //setInterval(()=> this.loadMessages(), 1000);
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
        addBreakToUsersInChannel(u) {
            return `${u}<br />`;
        }
        updatedServerStatusToPanel(serverStatus, serverStatusArray) {
            // we are going to need to make this selectable.
            servers = `${serverStatusArray.map((e) => e.serverName).join('<br />')}`;
            channels = `${serverStatusArray.map((e) => e.channelCons.map((el) => el.channelName).join('<br />')).join('<br />')}`;
            users = `${serverStatusArray
                .map((e) => e.channelCons
                .map((el) => el.usersInChannel
                .map((elm) => `${elm}<br />`).join('')).join('')).join('')}`;
            console.log('CHANNELS FROM UPDATE:', channels);
            console.log('USERS FROM UPDATE:', users);
            this.loadMessages();
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
        loadStyle() {
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
            
            `);
        }
        loadStyle2() {
            return (`
            <style>
            .grid-container {
                display: grid;
                height: 100%;
                grid-template-columns: 150px 1fr 150px;
                grid-template-rows: 30px 1fr 30px;
                grid-template-areas: ". header nickName" "leftPanel messageArea userList" "leftPanel inputField userList";
                overflow: auto;
              }

              br {
                display: block;
                margin: 10px 2px;
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
            `);
        }
        loadMessages() {
            let htmlPage = `<html>${this.loadStyle2()}<body>
                    
            <div class="grid-container">
                <div class="leftPanel">
                    <div class="channelList">
                        ${channels}
                    </div>
                    <div class="serverList">
                        ${servers}
                    </div>
                </div>
                <div class="userList">
                    ${users}
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
            this._panel.webview.html = htmlPage;
        }
    }
    IRCPanel.viewType = 'IRC';
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map