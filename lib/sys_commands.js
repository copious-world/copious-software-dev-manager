
const {execSync,spawn}  = require("child_process")
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
            return execSync(`bash ${cmd} ${arg}`)
        } catch(e) {
            console.log(e)
        }
    }

    spawn_command(cmd,args) {
        spawn(cmd, args);
    }

    spawn_command_and_wait(cmd,args) {
        let p = new Promise((resolve,reject) => {
            let data = ""
            let err_data = ""
            let sp_cmd = spawn(cmd, args);
            sp_cmd.stderr.on('data',(chunk) => {
                err_data += chunk
            })
            sp_cmd.stdout.on('data',(chunk) => {
                data += chunk
            })
            sp_cmd.on('error',(err) => {
                console.log(err)
                reject(data,{err_data,"code" : -1})
            })
            sp_cmd.on('close',(code) => {
                resolve({data,err_data,code})
            })
        })
        return p
    }
}



module.exports = SystemBashCommands
