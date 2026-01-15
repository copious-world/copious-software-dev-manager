
const {execSync}  = require("child_process")




class SystemBashCommands {
    constructor() {

    }


    bash_command(cmd,arg) {
        try {
            execSync(`bash ${cmd} ${arg}`)
        } catch(e) {}
    }

}



module.exports = SystemBashCommands
