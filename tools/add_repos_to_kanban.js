


const fs = require('fs')



let current_kdb = "./data/kanbans.db"
let kb_data = fs.readFileSync(current_kdb)

let current_repo_list = "./data/github-repos.conf"
let repo_data = fs.readFileSync(current_repo_list)

// ----
let kbmap = JSON.parse(kb_data)
let repo_list = JSON.parse(repo_data)


let kbs = kbmap.kanbans
let kbmaps = kbmap.kb_maps
let kbinfos = kbmap.kb_infos

let kb_model = {
    "todo": [],
    "focus": [],
    "planning": [],
    "doing": [],
    "staging": [],
    "done": []
}

for ( let repo of repo_list ) {
    let name = repo.name
    if ( kbs[name] === undefined ) {
        let subdata = structuredClone(kb_model)
        kbs[name] = subdata
        kbmaps[name] = {}
        kbinfos[name] = {}
    }
}


let current_kdb_out = "./data/vw_kanbans.db"
fs.writeFileSync(current_kdb_out,JSON.stringify(kbmap,null,4))
