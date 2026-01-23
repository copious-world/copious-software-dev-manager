
const {FileOperations} = require('extra-file-class')

const fs = require('fs')


const TESTING = true;

const DEFAULT_DESCRIPTIONS_FILE = "data/alpha_staging_diffs.json"


class SnippetOps {

    constructor(conf,sys_coms) {
        this._conf = conf       // repo_support part of repo
        this.fos = new FileOperations(false)
        //
        this.sys_coms = sys_coms
        //
        this.db_file = conf.snippet_db
        try {
            let sdb_data_str = fs.readFileSync(this.db_file).toString()
            this.all_sdb_map = JSON.parse(sdb_data_str)
        } catch (e) {
            this.all_sdb_map = {}
        }
    }

    absolute_path(apath) {
        if ( apath[0] === '[' ) {
            let abspath = this.pathm.compile_one_path(apath)
            return abspath
        }
        return apath
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
        let prefs_state = params.code_choice        // a file name
        let file_changes = params.new_file_maybe
        //
        let func_name = params.func_name
        let func_descr = this.all_sdb_map[func_name]
        //
        let alpha_source = params.alpha_source // a file name (relative path)
        //
        let chosen_code = params.code
        //
        if ( (typeof alpha_source == "string") && alpha_source.length ) {
            let impl_info = func_descr[alpha_source]
            let prefs = impl_info._x_preference
            let match_code = impl_info._x_origin
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
                let alpha_file = alpha_source
                if ( file_changes.creating_dir ) {
                    let alpha_dir = `[alpha-copious]/${file_changes.dir}`
                    alpha_dir = this.sys_coms.absolute_path(alpha_dir)
                    await this.fos.makeDir(alpha_dir)
                    if ( file_changes.file ) {
                        file_changes.file = `${alpha_dir}/${file_changes.file}`
                    }
                }
                if ( (typeof file_changes.file == "string") && file_changes.file.length ) {
                    making_new_file = true
                    await this.fos.createFile(file_changes.file)
                    alpha_file = file_changes.file
                } else {
                    alpha_file = `[alpha-copious]/${alpha_file}`
                    alpha_file = this.sys_coms.absolute_path(alpha_file)
                }
                //
                if ( (old_choice !== prefs.choice) || making_new_file ) {
                    console.log("got some work to do")
                    if ( making_new_file ) {
                        await this.fos.output_string(alpha_file,chosen_code)
                    } else {
                        let origin_code = await this.fos.load_data_at_path(alpha_file)
                        if ( origin_code ) {
                            let update_origin_code = origin_code.replace(match_code,chosen_code)
                            if ( update_origin_code === origin_code ) {
                                update_origin_code += "\n"
                                update_origin_code += chosen_code
                            }
                            await this.output_string(alpha_file,update_origin_code)
                        } else {
                            console.log("COULD NOT FIND ORIGIN CODE")
                        }
                    }
                }
                //
            }
        }
        //
    }


    async unload_snippets(params) {
        try {
            await this.fos.write_out_pretty_json(this.db_file,params,2)            
        } catch (e) {
        }
    }
    
}




module.exports = SnippetOps


