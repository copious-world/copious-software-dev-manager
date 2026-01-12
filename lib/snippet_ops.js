
const {FileOperations} = require('extra-file-class')

const fs = require('fs')
const path = require('path')


const TESTING = true;

const DEFAULT_DESCRIPTIONS_FILE = "data/alpha_staging_diffs.json"


class SnippetOps {

    constructor(conf) {
        this._conf = conf       // repo_support part of repo
        this.fos = new FileOperations(false)

        this.db_file = conf.snippet_db
        try {
            let sdb_data_str = fs.readFileSync(this.db_file).toString()
            this.all_sdb_map = JSON.parse(sdb_data_str)
        } catch (e) {
            this.all_sdb_map = {
            }
        }
    }


    get_table_as_string() {
        return JSON.stringify(this.all_sdb_map)
    }


    async unload_snippets(params) {
        try {
            await this.fos.write_out_pretty_json(this.db_file,params,2)            
        } catch (e) {
        }
    }
    
}




module.exports = SnippetOps


