
const {FileOperations} = require('extra-file-class')

const fs = require('fs')
const path = require('path')


const TESTING = true;

const DEFAULT_DESCRIPTIONS_FILE = "data/repo_descriptions.json"


class KanbanOps {

    constructor(conf) {
        this._conf = conf       // repo_support part of repo
        this.fos = new FileOperations(false)

        this.db_file = conf.kanban_db
        try {
            let kb_data_str = fs.readFileSync(this.db_file).toString()
            this.all_kb_map = JSON.parse(kb_data_str)
        } catch (e) {
            this.all_kb_map = {
                "kanbans" : {},
                "kb_maps" : {}
            }
        }
    }


    async unload_kanban(params) {

        switch ( params.scope ){
            case "all-boards" : {

                let all_kbs = {}
                try {
                    all_kbs = JSON.parse(params.kanban)
                } catch (e) {
                    if ( Object.keys(this.all_kb_map.kanbans) > 0 ) {
                        all_kbs = this.all_kb_map.kanbans
                    }
                }

                let all_kbm = {}
                try {
                    all_kbm = JSON.parse(params.kmap)
                } catch (e) {
                    if ( Object.keys(this.all_kb_map.kb_maps) > 0 ) {
                        all_kbm = this.all_kb_map.kb_maps
                    }
                }

                this.all_kb_map = {
                    "kanbans" : all_kbs,
                    "kb_maps" : all_kbm
                }

                break;
            }

            case "single-board" : {
                //
                let ky = decodeURIComponent(params.title)
                //
                if ( ky ) {
                    let kbs = false
                    try {
                        kbs = JSON.parse(params.kanban)
                    } catch (e) {
                        kbs = this.all_kb_map.kanbans[ky]
                    }
                    //
                    let kbm = {}
                    try {
                        kbm = JSON.parse(params.kmap)
                    } catch (e) {
                        kbm = this.all_kb_map.kb_maps[ky]
                    }
                    //
                    if ( kbs && kbm ) {
                        this.all_kb_map.kanbans[ky] = kbs
                        this.all_kb_map.kb_maps[ky] = kbm
                    }
                }
                //
                break;
            }
        }

        await this.fos.write_out_json(this.db_file,this.all_kb_map)
        
    }

    
    
    get_kanban_as_string(params) {
        if ( params.title !== undefined ) {
            //
            let ky = decodeURIComponent(params.title)
            //
            let kb_data = {
                "title" : ky,
                "kanban" : this.all_kb_map.kanbans[ky],
                "kb_map" : this.all_kb_map.kb_maps[ky]
            }
            //
            return JSON.stringify(kb_data)
            //
        } else {
            return JSON.stringify(this.all_kb_map)
        }
    }



    async get_file(obj,app_file) {
        let file = ""
        try {
            file = req.params.file
            let data = await fsPromise.readFile(app_file)
            let page = data.toString()
            obj.data = page
            return true
        } catch (e) {
            console.log(e)
        }
        return false
    }


    async get_app_file(obj) {
        let file = obj.file
        return await this.get_file(obj,`${__dirname}/app/${file}`)
    }

    async get_asset_file(obj) {
        let file = obj.file
        return await this.get_file(obj,`${__dirname}/app/assets/${file}`)
    }

    async get_build_file(obj) {
        let file = obj.file
        return await this.get_file(obj,`${__dirname}/app/build/${file}`)
    }

    app_repo_list(obj) {
        if ( g_host_ops ) {
            let output = g_host_ops.get_known_repos_as_string()
            obj.data = output
            return true
       }
       return false
    }



    
    
}




module.exports = KanbanOps


