const NetSocket = require("net").Socket;
const IrcSocket = require("irc-socket");
const fetch = require("node-fetch");

let channel = 'audstanley'
let netSocket = new NetSocket();
let client = IrcSocket({
    socket: netSocket,

    port: 6667,
    server: "www.audstanley.com",
    nicknames: ["audstanley-4", "audstanley-5"],
    username: "audstanley",
    realname: "Richard Stanley",
});


let nickname = undefined
let arrayOfUsers = Array.prototype

client.connect()
    .then(function(res) {
        console.log("RESPONSE:", JSON.stringify(res, null, 2))
        if (res.isOk()) {
            client.raw(`JOIN #${channel}`);
            client.raw(`JOIN #minecraft`);
            return res;
            //client.end(); // End connection to server.
        }
    })
    .then(res => {
        nickname = res.value.nickname
            /** 
             * Update if you are using vscode-irc-connect
             */
            /** 
            fetch("http://www.audstanley.com")
                .then(d => d.text())
                .then(d => console.log(d))
                .catch(e => console.log(e))
            */
    })
    .catch(e => console.log(e));

client.on('data', function(message) {
    console.log(message); /*?*/
    parseMessage(message);

});


/**
 * SPAM the channel with messages for testing.
 */
setInterval(() => {
        client.raw(['PRIVMSG', `#${channel}`, `:My name is: ${nickname} and the time is ${(new Date).getTime()}`])
    }, 2000)
    /**
     * END SPAM
     */

let removeSelf = (e) => e !== `${nickname}`
let remove = (array, element) => array.filter(e => e !== element);

function parseMessage(m) {
    let listOfUsersRegex = new RegExp(`:([A-Za-z]+)\.freenode\.net 353 (${nickname}) @ #${channel} :(\.+)`);
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