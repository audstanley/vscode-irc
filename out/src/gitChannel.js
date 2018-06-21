"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fetch = require('node-fetch');
function getRemoteOrginSource(config, gitConfiguration) {
    return new Promise((resolve, reject) => {
        if (config)
            if (config["remote \"origin\""]["url"])
                resolve(config["remote \"origin\""]["url"]);
            else
                reject(`Git File: ${gitConfiguration} does not have a remote origin url.`);
        else
            reject(`Git File: ${gitConfiguration} does not have a remote origin url.`);
    });
}
exports.getRemoteOrginSource = getRemoteOrginSource;
function seeIfProjectIsForked(s) {
    return fetch(s)
        .then((d) => d.text())
        .then((d) => {
        let forkedRegex = /forked from \<a href="\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)/;
        let forkedArray = d.match(forkedRegex);
        if (forkedArray) {
            if (forkedArray.length > 1)
                return [forkedArray[1], forkedArray[2]].join('-');
            else
                return "";
        }
        else {
            let githubLinkArray = s.split('/');
            if (githubLinkArray) {
                if (githubLinkArray.length > 4) {
                    return [githubLinkArray[3], githubLinkArray[4]].join('-');
                }
                else
                    return "";
            }
            else
                return "";
        }
    }).catch((e) => { return []; });
}
exports.seeIfProjectIsForked = seeIfProjectIsForked;
//# sourceMappingURL=gitChannel.js.map