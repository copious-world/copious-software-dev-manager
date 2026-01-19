
const fs = require('fs')

let conf = {
    "@target" : "templates/",
    "inputs" : {
        "path_abreviations" : {
            "[websites]" : "[alphas]/websites",
            "[alphas]" : "[github]/alphas",
            "[alpha-copious]" : "[alphas]/alpha-copious",
            "[github]" : "~/GitHub/",
            "[skeletons]" : "[alpha-copious]/pre-template",
            "[names]" : "[alpha-copious]/name-drops"
        }
    },
    "ext_default_dirs" : {
        "tmplt" : "[alpha-copious]/html",
        "js" : "[alpha-copious]/client",
        "svg" : "[alpha-copious]/icons"
    },
    "top_dir_locations" : {
        "script" : "[alpha-copious]/client",
        "alt-script" : "[alpha-copious]/script",
        "for-humans" : "[alpha-copious]/for-humans",
        "html" : "[alpha-copious]/html",
        "css" : "[alpha-copious]/css",
        "icons" : "[alpha-copious]/icons",
        "names" : "[alpha-copious]/name-drops"
    },
    "concerns" : {
        "copious" : {},
        "popsong" : {},
        "villa-family" : {},
        "bakersfield-robots": {},
        "docs.copious.world": {},
        "shops.copious.world": {},
        "shops.for-humans.net": {}
    }

}

let edited_difs = false
try {
    let edited_staging_data = fs.readFileSync('../../data/alpha_staging_diffs.json',JSON.stringify(sta_diffs,null,4))
    edited_difs = JSON.parse(edited_staging_data)
} catch(e){}

let staging_data = fs.readFileSync('./data/alpha_staging_diffs.json')
let sta_diffs = JSON.parse(staging_data)

//console.log(Object.keys(sta_diffs))
for ( let [ky,data]  of Object.entries(sta_diffs) ) {
    if ( Object.keys(data).length === 1 ) {
        //
        let finals = data["_x_finals_only"]

        let fkys = Object.keys(finals)
        let first_patch = fkys[0]
        let update_date = 0
        for ( let i = 0; i < fkys.length; i++ ) {
            let mt = fs.statSync(fkys[i]).mtime.getTime()
            if ( mt > update_date ) {
                update_date = mt
                first_patch = fkys[i]
            }
        }
        
        //
        data["create-alpha-entry"] = {
            "_x_preference" : {
                "updated" : false,
                "choice" : `_x_finals_only.${first_patch}`,
                "date" : update_date
            }
        }
        continue
    }
    let edited_data = edited_difs ? edited_difs[ky] : false
    for ( let [fld,files] of Object.entries(data) ) {
        //
        if ( fld[0] === '_' ) continue
        //
        if ( files._x_patches === undefined ) {
            files._x_patches = false
        }
        if ( files._x_origin === undefined ) {
            files._x_origin = false
        }
        //
        let files_update = edited_data ? edited_data[fld] : false
        //
        if ( files_update ) {
            if ( files_update._x_preference ) {
                files._x_preference = Object.assign({},files_update._x_preference)
            }
        } else {
            files._x_preference = {
                "updated" : false,
                "choice" : "_x_origin",
                "date" : Date.now()
            }
        }
        //
    }
}

fs.writeFileSync('../../data/alpha_staging_diffs.json',JSON.stringify(sta_diffs,null,4))
