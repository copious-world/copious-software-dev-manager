
const {FileOperations} = require('extra-file-class')

const fs = require('fs');
const { versions } = require('process');


const TESTING = true;

const DEFAULT_DESCRIPTIONS_FILE = "data/alpha_staging_diffs.json"


class SnippetOps {

    constructor(conf,sys_coms) {
        this._conf = conf       // repo_support part of repo
        this.fos = new FileOperations(false)
        //
        this.sys_coms = sys_coms
        if ( typeof sys_coms !== "object" ) {
            throw new Error("SnippetOps :: needs a system communications parameter")
        }
        //
        this.db_file = conf.snippet_db
        this.all_sdb_map = {}
        try {
            if ( this.db_file ) {
                let sdb_data_str = fs.readFileSync(this.db_file).toString()
                this.all_sdb_map = JSON.parse(sdb_data_str)
            }
        } catch (e) {
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


    /**
     * 
     * @param {object} params 
     */
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
        let chosen_code = prefs_state.code
        console.log(chosen_code)
        console.dir(params)
        //
        if ( (typeof alpha_source == "string") && alpha_source.length ) {  // alpha_source is a string
            //
            let no_origin = (alpha_source === "_x_finals_only")
            let impl_info = (!(no_origin) && func_descr) ? func_descr[alpha_source] : undefined

            if ( func_descr._x_origin === undefined ) {   // this function has yet to be stored in the alphas 
                if ( !no_origin && alpha_source.length ) {
                    let alpha_file = `[alpha-copious]/${alpha_source}`
                    alpha_file = this.sys_coms.absolute_path(alpha_file)
                    this.fos.output_append_string(alpha_file,`\n${chosen_code}\n`)
                    return
                }
            }

            let prefs = impl_info?._x_preference
            let match_code = impl_info?._x_origin
            match_code = match_code ? match_code : false
            //
console.log(impl_info,alpha_source,prefs,match_code)
            //
            if ( (no_origin || prefs) && prefs_state ) {   //  prefs && prefs_state
                //
                if ( prefs ) {
                    prefs.updated = prefs_state.updated
                }
                let old_choice = prefs?.choice
                if ( func_name == prefs_state.choice ) {
                    prefs_state.choice = "_x_origin"
                }
                if ( prefs ) {
                    prefs.choice = prefs_state.choice
                }
                //
                let making_new_file = false
                let alpha_file = alpha_source  // will write to the given alpha file if not a new one
                //
                if ( file_changes ) {
                    if ( typeof file_changes?.creating_dir === "string" ) {
                        let alpha_dir = `[alpha-copious]/${file_changes.dir}`
                        alpha_dir = this.sys_coms.absolute_path(alpha_dir)

console.log("MAKING NEW DIR",alpha_dir)
                        await this.fos.makeDir(alpha_dir)
                    }

                    let rel_dir = false
                    let create_file = ""
                    if ( (typeof file_changes?.dir == "string") && file_changes.dir.length ) {
                        rel_dir = file_changes.dir
                    }

                    if ( (typeof file_changes?.file == "string") && file_changes.file.length ) {
                        making_new_file = true
                        create_file = file_changes.file
                        alpha_file = rel_dir ? `[alpha-copious]/${rel_dir}/${create_file}` : `[alpha-copious]/${create_file}`
                    } else {
                        alpha_file = `[alpha-copious]/${alpha_file}`
                    }
                    //
                    alpha_file = this.sys_coms.absolute_path(alpha_file)
                    if ( making_new_file ) {
                        await this.fos.createFile(alpha_file)
                    }
                } else {
                    console.log("UPDATING EXISTING ALPHA FILE: ",alpha_file)
                }

                console.log("ALPHA FILE IS: ",alpha_file)
                //
                //  the above is using an existing alpha file or making a new file possibly in a new directory
                //
                if ( making_new_file || (old_choice !== prefs?.choice) ) {
                    console.log("got some work to do")
                    if ( making_new_file ) {
                        await this.fos.output_string(alpha_file,chosen_code)  // just output code to the new file
                    } else {
                        // in this case, output the code to a place that matches old code
                        // replace the old code.
                        let origin_code = await this.fos.load_data_at_path(alpha_file)    // have to read the file in each time
                        if ( origin_code && match_code ) {
                            let update_origin_code = origin_code.replace(match_code,chosen_code)
                            if ( update_origin_code === origin_code ) {   // there was no match, so, then append 
                                update_origin_code += "\n"
                                update_origin_code += chosen_code
                            }
                            await this.output_string(alpha_file,update_origin_code)         // finally output the file with new code
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


