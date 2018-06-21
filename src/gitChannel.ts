const fetch = require('node-fetch');

interface gitConfigurationObject {
    "remote \"origin\"" : {
        "url": string;
    }
}

export function getRemoteOrginSource(config : gitConfigurationObject, gitConfiguration : string) : Promise<string> {
    return new Promise((resolve, reject) => {
        if(config)
            if(config["remote \"origin\""]["url"]) resolve(config["remote \"origin\""]["url"])
            else reject(`Git File: ${gitConfiguration} does not have a remote origin url.`)
        else reject(`Git File: ${gitConfiguration} does not have a remote origin url.`)
    })
}

export function seeIfProjectIsForked(s : string) : Promise<string> {
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