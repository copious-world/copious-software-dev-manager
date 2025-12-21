

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


    get_substitutions() {
        return this.conserns_to_subst_file_map
    }

    apply(method,args) {
        switch (method) {
            case "get_subsitutions_map" : {
                return this.get_cal_db()
            }
        }
    }

}


module.exports = SubsitutionsManager