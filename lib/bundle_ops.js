
const {FileOperations,PathManager} = require('extra-file-class')

const fs = require('fs');


class BundleOps {
    // -- 
    constructor(conf,sys_coms) {
        this._conf = conf       // repo_support part of repo
        this.fos = new FileOperations(false)
        //
        this.paths = null
        if ( typeof conf.inputs  === 'object' ) {
            this.paths = new PathManager(conf?.paths?.inputs)
        }
        //
        this.sys_coms = sys_coms
        if ( typeof sys_coms !== "object" ) {
            throw new Error("BundleOps :: needs a system communications parameter")
        }
        //
        this.db_file = conf?.bundles_flow_conf
        try {
            if ( (typeof this.db_file === "string") && (this.db_file.length) ) {
                let sdb_data_str = fs.readFileSync(this.db_file).toString()
                this.all_bundle_map = JSON.parse(sdb_data_str)
            }
        } catch (e) {
            console.log(e)
        }
    }


    /**
     * 
     * @param {object} params 
     */
    async get_flow_file(params) {
        let abs_path = params.file
        if ( abs_path && (typeof abs_path === "string") ) {
            abs_path = abs_path.trim()
            abs_path = this.absolute_path(abs_path)
            try {
                let file_dat = fs.readFileSync(abs_path).toString()
                return file_dat
            } catch (e) {
                console.log(e)
            }
        }
        return ""
    }


    /**
     * 
     * @param {object} params 
     * @returns 
     */
    async add_flow_file(params) {
        let abs_path = params.file
        if ( abs_path && (typeof abs_path === "string") ) {
            abs_path = abs_path.trim()
            abs_path = this.absolute_path(abs_path)
            try {
                if ( fs.existsSync(abs_path) ) {
                    return [false,"file exists"]
                } else {
                    fs.writeFileSync(abs_path,"")
                    return [true,abs_path]
                }
            } catch (e) {
                console.log(e)
            }
        }
        return [false,"bad parameters"]
    }


    /**
     * 
     * @param {string} abs_dir 
     * @returns {object}
     */
    async get_dir_tree(abs_dir) {
        let dir_list = await this.fos.dir_reader(abs_dir)
        if ( dir_list ) {
            let dir_tree = {}
            while ( dir_list.length ) {
                let fname = dir_list.shift()
                if ( fname ) {
                    let fpath = `${abs_dir}/${fname}`
                    let is_file = await this.fos.is_file(fpath)
                    dir_tree[fname] = {
                        "abs_path" : fpath,
                        "is_file" : is_file
                    }
                    if ( !(is_file) ) {
                        dir_tree[fname].sub_dir = {}
                        dir_tree[fname].sub_dir[fpath] = await this.get_dir_tree(fpath)
                    }
                }
            }
            return dir_tree
        }
        return {}
    }


    remove_all_comments(fdata) {
        return fdata /// use common lib method
    }

    compress_source_code(fdata) {
        return fdata /// use common lib method
    }

    /**
     * 
     * @param {string} apath 
     * @returns {string}
     */
    absolute_path(apath) {
        if ( apath[0] === '[' ) {
            let abspath = this.sys_coms.absolute_path(apath)
            return abspath
        }
        return apath
    }


    /**
     * 
     */
    reload_db() {
        try {
            let sdb_data_str = fs.readFileSync(this.db_file).toString()
            this.all_bundle_map = JSON.parse(sdb_data_str)
        } catch (e) {
            this.all_bundle_map = {}
        }
    }

    /**
     * 
     * @returns {string}
     */
    get_table_as_string() {
        return JSON.stringify(this.all_bundle_map)
    }

    /**
     * 
     * @param {object} params 
     */
    async bundle_all_subdirectories(params) {
        let created_files = []
        let target_dir = params.bundle_dir
        if ( typeof target_dir === "string" ) {
            target_dir = this.absolute_path(target_dir)
            let dir_list = await this.fos.dir_abs_reader(target_dir,{ 'just' : "dirs" })
            if ( dir_list ) {
                for ( let dir of dir_list ) {
                    let dir_file_list = await this.fos.dir_abs_reader(dir,{ 'just' : "files" })
                    if ( dir_file_list ) {
                        let bundled_files = ""
                        for ( let file of dir_file_list ) {
                            let fdata = await this.fos.load_data_at_path(file)
                            if ( fdata ) {
                                if ( params.remove_comments ) {
                                    fdata = this.remove_all_comments(fdata)
                                }
                                if ( params.compress_bundle ) {
                                    fdata = this.compress_source_code(fdata)
                                }
                                bundled_files += fdata
                            }
                        }
                        // bundled_files
                        let parent_dir = this.sys_coms.pathm.dirname(target_dir)
                        let bundle_out_dir = `${parent_dir}/all_bundles`
                        await this.fos.ensureDir(bundle_out_dir)
                        let stem_dir = dir.substring(dir.lastIndexOf('/') + 1)
                        let bundle_file_name = `${bundle_out_dir}/${stem_dir}.js`
                        await this.fos.write_out_string(bundle_file_name,bundled_files)
                        created_files.push(stem_dir)
                    }
                }
            }
            return [true,created_files]
        }
        return [false,created_files]
    }


    async ensure_compressed_bundles_exists(bundle_storage_directory,bundle_compressed_directory,reports) {
        // runs sync
        let report = this.sys_coms.bash_command("./tools/run_compression.sh",`${bundle_storage_directory} ${bundle_compressed_directory}`)
        reports.push(report)
        return bundle_compressed_directory
    }



    /**
     * 
     * @param {object} params 
     * @param {object} concerns_file_map 
     * @returns {pair}
     */
    async internal_publish(params,concerns_file_map) {
        let [OK,report] = [false,"not much"]
        let bundle_storage_directory = params.bundle_dir
        if ( bundle_storage_directory && (typeof bundle_storage_directory === "string") ) {
            bundle_storage_directory = this.absolute_path(bundle_storage_directory)
        } else {
            return  [OK,report]
        }
        //
        let reports = []
        //
        let bundle_compressed_directory = params.compressed_src
        bundle_compressed_directory = this.absolute_path(bundle_compressed_directory)
        let copied_dir = bundle_storage_directory
        if ( params.compress ) {
            copied_dir = await this.ensure_compressed_bundles_exists(bundle_storage_directory,bundle_compressed_directory,reports)
        }
        //
        for ( let config_file in concerns_file_map ) {
            let concerns_table = concerns_file_map[config_file]
            for ( let concern in concerns_table ) {
                console.log("processing concern",concern,"in config file",config_file)
                console.log("copying from",bundle_storage_directory)
                let dformula = concerns_table[concern].dir_form
                dformula = dformula.replace('@concern',concern)
                dformula = dformula.replace('@target',params.stage)
                let dest = this.absolute_path(dformula)
                if ( params.compress ) {
                    reports.push(`testing cp -r ${copied_dir} ${dest}/${params.rename_compressed}`)
                    this.sys_coms.spawn_command('cp',['-RT', copied_dir, `${dest}/${params.rename_compressed}`])
                } else {
                    reports.push(`cp -r ${copied_dir} ${dest}/`)
                    this.sys_coms.spawn_command('cp',['-r', copied_dir, `${dest}/`])
                }
            }
        }
        OK = true
        report = reports.join('<br>')
        //
        return  [OK,report]
    }


    /**
     * 
     * `concerns_map` = {
     *      "concern" : {
     *          "web_or_pwa" : "[websites]"  // "[PWA]"
     *          "files" : [ "bundle13.js", "web3_proxy_skell" ]
     *      }
     * }
     * 
     * @param {object} params 
     */
    async distribute_bundles_to_staging(params) {
        let level = params.staging_level        // pre-staging or staging
        let concerns = params.concerns_map
        let target_dir = params.bundle_dir
        target_dir = this.absolute_path(target_dir)
        let bundle_storage_container_dir = this.paths.dir(target_dir)

        for ( let [concern,final_files] of Object.entries(concerns) ) {
            let bundle_list = final_files.bundles
            let concern_dir = `${final_files.web_or_pwa}/${concern}/${level}`
            concern_dir = this.paths.compile_one_path(concern_dir)
            for ( let file of bundle_list ) {
                let bundle_file = `${bundle_storage_container_dir}/${file}`
                let staging_bundle = `${concern_dir}/${file}`
                await this.fos.copy(bundle_file,staging_bundle)
            }
        }

    }



    async unload_db(params) {
        try {
            await this.fos.write_out_pretty_json(this.db_file,params,2)            
        } catch (e) {
        }
    }


    /**
     * 
     * @param {*} all_dirs 
     * @param {*} dir_list 
     * @returns 
     */
    async detailed_directory_trees(all_dirs,dir_list) {
        let data = {}
        data.type = "dir-list"
        let dir_trees_promises = []
        for ( let abs_dir of all_dirs ) {
            let next_dir = this.get_dir_tree(abs_dir)
            dir_trees_promises.push(next_dir)
        }
        let dir_trees = await Promise.all(dir_trees_promises)
        data.dir_trees = {}
        for ( let dky of dir_list ) {
            data.dir_trees[dky] = dir_trees.shift()
        }
        return data
    }



    /**
     * 
     * @param {*} params 
     * @returns 
     */
    async get_flow_directory(params) {

        console.dir(params)
        //
        let species = params.species
        let dirs = params.dir

        let dir_list = []
        if ( dirs.indexOf(',') >= 0 ) {
            dir_list = dirs.split(',')
            if ( dir_list[0].trim().length === 0 ) dir_list.shift()
        } else {
            dir_list = [dirs]
        }
        //
        let all_dirs = [].concat(dir_list.map(dir => {
            if ( dir.indexOf("alpha-central") >=0 ) {
                dir = dir.replace("[alpha-central]","[alpha-copious]")
            }
            let abs_dir = this.sys_coms.absolute_path(dir)
            return abs_dir
        }))
        //
        let data = {}
        switch (species) {
            case "full-skeletons" : {
                data = await this.detailed_directory_trees(all_dirs,dir_list)
                break
            }
            case "skeletons" : {
                data = await this.detailed_directory_trees(all_dirs,dir_list)
                break
            }
            case "prepare" : {
                break
            }
            case "template" : {
                break
            }
            case "pages" : {
                break
            }
            case "staging" : {
                break
            }
        }

        return data
    }



    /**
     * 
     * @param {object} params 
     * @returns {object}
     */
    async get_flow_tracking(params) {
        let species = params.species.trim()
        //let dirs = params.dir.trim()
        //
        let tracking_for_spec = this.all_bundle_map?.tracking[species]
        //
        if ( tracking_for_spec ) {
            let tracker = {}
            for ( let file of tracking_for_spec ) {
                if ( file[0] === '[' ) {
                    let filename = this.absolute_path(file)
                    tracker[file] = fs.readFileSync(filename).toString()
                    tracker[file] = JSON.parse(tracker[file])
                } else {
                    tracker[file] = {}
                }
            }
            return tracker
        }
        //
        return {}
    }

    /**
     * 
     * @param {Array} ogroups 
     */
    unload_concerns(ogroups) {
        let concerns_map = {}
        if ( ogroups && Array.isArray(ogroups) ) {
            for ( let ogroup of ogroups ) {
                let targets  = ogroup?.targets
                let concerns = targets?.concerns
                if ( concerns ) {
                    for ( let concern of concerns ) {
                        concerns_map[concern] = {
                            "dir" : targets.dir,
                            "dir_form" : targets.dir_form
                        }
                    }
                }
            }
        }
        return concerns_map
    }

    /**
     * 
     * @param {object} params 
     * @returns {object}
     */
    async get_flow_tracking_concerns(params) {
        let species = params.species.trim()
        //
        let tracking_for_spec = this.all_bundle_map?.tracking[species]
        //
        if ( tracking_for_spec ) {
            let concerns = {}
            for ( let file of tracking_for_spec ) {
                if ( file[0] === '[' ) {
                    //
                    let filename = this.absolute_path(file)
                    let conf_data = fs.readFileSync(filename).toString()
                    conf_data = JSON.parse(conf_data)
                    //
                    concerns[file] = this.unload_concerns(conf_data.outputs)
                } else {
                    concerns[file] = {}
                }
            }
            return concerns
        }
        //
        return {}
    }


    tracking_states() {
         this.tracking_states = ["full-skeletons","skeletons","prepare","template","pages","staging"]
    }
}




module.exports = BundleOps


