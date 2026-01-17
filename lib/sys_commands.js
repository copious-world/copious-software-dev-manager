
const {execSync}  = require("child_process")
const fos = require("extra-file-class")()
const {PathManager} = require('extra-file-class')




class SystemBashCommands {
    constructor(conf) {
        this.pathm = new PathManager(conf)
    }

    absolute_path(apath) {
        if ( apath[0] === '[' ) {
            let abspath = this.pathm.compile_one_path(apath)
            return abspath
        }
        return apath
    }


    bash_command(cmd,arg) {
        try {
            execSync(`bash ${cmd} ${arg}`)
        } catch(e) {}
    }

}



module.exports = SystemBashCommands
