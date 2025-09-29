


const fs = require('fs')
const fs_promises = require('fs/promises')



class RepoListOps {
    constructor(conf,git) {
        this.top_dir = conf.top_repo_dir
        this.git = git
    }



    async git_command_line(git_dir,cmd_str) {
        //
        let results = false
        try {

            await this.git.cwd({ path: git_dir, root: true });

            switch ( cmd_str ) {
                case "ls-remote" : {
                    let remote = await this.git.listRemote(['--get-url'])
                    results = remote.trim()
                    break;
                }
            }

        } catch (e) {
            console.log(e)
        }

        return results
    }


    /**
     * find_git_repo
     * 
     * 
     * @param {*} git_dir 
     * @returns 
     */
    async find_git_repo(git_dir) {
        let head_log = `${git_dir}/.git/logs/HEAD`
        if ( fs.existsSync(head_log) ) {

            try {
                let lines = (await fs_promises.readFile(head_log)).toString()

                lines = lines.split("\n")
                let line = lines[0]
                let parts = line.indexOf("clone:") > 0 ? line.split("clone:") : line.split("clone ")
                //
                let str = parts[0]
                let owner = str.substring(str.indexOf("<")+1,str.lastIndexOf(">"))


                let remote = parts[1] ? parts[1].trim() : "unknown"

                if ( remote !== "unknown" ) {
                    if ( remote.indexOf("from ") === 0 ) {
                        remote = remote.substring(5)
                    }
                } else {
                    //
    console.log(git_dir,"CALL ls-remote")
                    let remote_info = await this.git_command_line(git_dir,"ls-remote")
                    if ( remote_info ) {
                        remote = remote_info
    console.log(">>\t",remote)
                    }
                    //
                }

                return [owner,remote]
            } catch (e) {
console.log("FAILED READING DIR ... logs/HEAD ",git_dir)
                return ["unknown","unknown"]                
            }
        }
        return ["unknown","unknown"]
    }


    async dir_is_empty(git_dir) {
        let dir_list = await fs_promises.readdir(git_dir)
        return (dir_list.length === 0)
    }



    async list_git_directories(top_level_dir,git_list) {

        let dir_list = await fs_promises.readdir(top_level_dir)

        git_list = git_list === undefined ? [] : git_list

        dir_list =  dir_list.filter((file) => {
            let stats = fs.lstatSync(`${top_level_dir}/${file}`);
            return ( stats.isDirectory() )
        })


        for ( let file of dir_list ) {
            //
            if ( file === "node_modules" ) continue;
            //
            // let path = `${top_level_dir}/${file}`        
            // console.log(path)
            //
            if ( fs.existsSync(`${top_level_dir}/.git`) ) {

                let empty_git = await this.dir_is_empty(`${top_level_dir}/.git`)
                let [owner,remote] = empty_git ? ["unknown","unknown"] : await this.find_git_repo(`${top_level_dir}`)
                //
                let dir_info = {
                    "name" : `${top_level_dir}`,
                    "is_empty" : empty_git,
                    "in_sync" : (remote !== "unknown"),
                    "owner" : owner,
                    "remote" : remote
                }
                git_list.push(dir_info)
                //
                break;
            } else {
                await this.list_git_directories(`${top_level_dir}/${file}`,git_list)
            }
            //
        }

        return git_list
    }

    /**
     * list_all_git_directories
     * 
     * @returns []
     */
    async list_all_git_directories() {
        let git_list = await this.list_git_directories(this.top_dir)
        return git_list
    }

}




module.exports = RepoListOps


