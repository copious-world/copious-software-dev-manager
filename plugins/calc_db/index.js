
let {FileOperations,PathManager} = require("extra-file-class")


class CalcDBManager {

    constructor(conf) {
        this.fos = new FileOperations()
        this.paths = null
        if ( typeof conf.inputs  === 'object' ) {
            this.paths = new PathManager(conf.inputs)
        }
        this.conserns_to_db_map = {}
    }

    async init() {
        let concerns_db_source = "[websites]/template-configs/conserns_named.db"
        concerns_db_source = this.paths.compile_one_path(concerns_db_source)
        let data = await this.fos.load_json_data_at_path(concerns_db_source)
        if ( data ) {
            this.conserns_to_db_map = data
            for ( let concern in data ) {
                let file_map = data[concern]
                for ( let file in file_map ) {
                    file_map[file] = await this.fos.load_json_data_at_path(file)
                }
            }
        }
    }


    get_cal_db() {
        return this.conserns_to_db_map
    }

    apply(method,args) {
        switch (method) {
            case "get_cal_db" : {
                return this.get_cal_db()
            }
        }
    }

}


module.exports = CalcDBManager