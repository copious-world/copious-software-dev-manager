
const {FileOperations,PathManager} = require('extra-file-class')

const fs = require('fs');


class BundleOps {

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
        this.db_file = conf?.bundle_db
        try {
            if ( (typeof this.db_file === "string") && (this.db_file.length) ) {
                let sdb_data_str = fs.readFileSync(this.db_file).toString()
                this.all_bundle_map = JSON.parse(sdb_data_str)
            }
        } catch (e) {
        }
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
            let abspath = this.paths.compile_one_path(apath)
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
        let target_dir = params.bundle_dir
        if ( typeof target_dir === "string" ) {
            target_dir = this.absolute_path(target_dir)
            let bundle_storage_container_dir = this.paths.dir(target_dir)
            let dir_list = await this.fos.dir_abs_reader(target_dir,{ 'just' : "dirs" })
            if ( dir_list ) {
                for ( let dir of dir_list ) {
                    let dir_file_list = await this.fos.dir_abs_reader(`${target_dir}/${dir}`,{ 'just' : "files" })
                    if ( dir_file_list ) {
                        let bundled_files = ""
                        for ( let file of dir_file_list ) {
                            let fdata = await this.fos.load_data_at_path(file)
                            if ( fdata ) {
                                if ( this._conf.remove_comments ) {
                                    fdata = this.remove_all_comments(fdata)
                                }
                                if ( this._conf.compress_bundle ) {
                                    fdata = this.compress_source_code(fdata)
                                }
                                bundled_files += fdata
                            }
                        }
                        // bundled_files
                        let bundle_out_dir = `${bundle_storage_container_dir}/all_bundles`
                        await this.fos.ensureDir(bundle_out_dir)
                        let bundle_file_name = `${bundle_out_dir}/${dir}.js`
                        await this.fos.write_out_string(bundle_file_name,bundled_files)
                    }
                }
            }
            return true
        }
        return false
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
    
}




module.exports = BundleOps


