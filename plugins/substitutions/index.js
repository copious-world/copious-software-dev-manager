

let {FileOperations,PathManager} = require("extra-file-class")


class SubsitutionsManager {

    constructor(conf) {
        this.fos = new FileOperations()
        this.paths = null
        if ( typeof conf.inputs  === 'object' ) {
            this.paths = new PathManager(conf.inputs)
        }
        this.conserns_to_subst_file_map = {}
    }

    async init() {
        let subst_map_file = `[websites]/template-configs/conserns_to_subst_files.json`
        subst_map_file = this.paths.compile_one_path(subst_map_file)
        //
        let data = await this.fos.load_json_data_at_path(subst_map_file)
        if ( data ) {
            this.conserns_to_subst_file_map = data
            for ( let concern in data ) {
                let file_map = data[concern]
                for ( let file in file_map ) {
                    file_map[file].substitutions = await this.fos.load_json_data_at_path(file.path)
                }
            }
        }
    }




    has_diffs(o1,o2) {
        return true
    }


    async store_substitutions(db_copy) {
        //
//         if ( typeof db_copy !== "object" ) { return false }
//         //
//         for ( let concern in this.concerns_to_db_map ) {
//             let file_map = this.concerns_to_db_map[concern]
//             let new_file_map = db_copy[concern]
//             if ( file_map && new_file_map ) {
//                 for ( let file in file_map ) {
//                     if ( this.has_diffs(file_map[file],new_file_map[file]) ) {
//                         file_map[file] = new_file_map[file]
// console.log(file)
// console.dir(new_file_map[file])
//                         await this.fos.write_out_pretty_json(file,new_file_map[file],4)
//                     }
//                 }
//             }
//         }
        //
        return true
    }

    get_substitutions() {
        return this.conserns_to_subst_file_map
    }

    async apply(method,args) {
        switch (method) {
            case "get_subsitutions_map" : {
                return this.get_cal_db()
            }
            case "save_subsitutions_map" : {
                let status = await this.store_cal_db(...args)
                return status
            }
        }
    }

}


module.exports = SubsitutionsManager