
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
            this.all_sdb_map = {}
        }
    }

    reload_snippets() {
        try {
            let sdb_data_str = fs.readFileSync(this.db_file).toString()
            this.all_sdb_map = JSON.parse(sdb_data_str)
        } catch (e) {
            this.all_sdb_map = {}
        }
    }

    get_table_as_string() {
        return JSON.stringify(this.all_sdb_map)
    }


    async edit_files_with_prefered_code(params) {
        //
        let prefs_state = params.code_choice
        let file_changes = params.new_file_maybe
        //
        let func_name = params.func_name
        let func_descr = this.all_sdb_map[func_name]
        //
        let alpha_source = params.alpha_source
        //
        if ( (typeof alpha_source == "string") && alpha_source.length ) {
            let impl_info = func_descr[alpha_source]
            let prefs = impl_info._x_preference
            if ( prefs ) {
                //
                prefs.updated = prefs_state.updated
                let old_choice = prefs.choice
                if ( func_name == prefs_state.choice ) {
                    prefs_state.choice = "_x_origin"
                }
                prefs.choice = prefs_state.choice
                //
                let making_new_file = false
                if ( file_changes.creating_dir ) {

                }
                if ( (typeof file_changes.file == "string") && file_changes.file.length ) {
                    making_new_file = false
                }

                if ( (old_choice !== prefs.choice) || making_new_file ) {
                    console.log("got some work to do")
                }
                //
            }
        }
        //
    }

    /*
    _x_preference": {
                "updated": false,
                "choice": "_x_origin",
                "date": 1768782853500
            }
    */


    async unload_snippets(params) {
        try {
            await this.fos.write_out_pretty_json(this.db_file,params,2)            
        } catch (e) {
        }
    }
    
}




module.exports = SnippetOps


