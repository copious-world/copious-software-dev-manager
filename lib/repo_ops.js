
const {FileOperations} = require('extra-file-class')

const fs = require('fs')
const { exec } = require('child_process');
const {unload_json_file} = require('../lib/utils')

const RepoListOps = require('./git_file_list.js')
const path = require('path')


const simpleGit = require('simple-git');
simpleGit().clean(simpleGit.CleanOptions.FORCE);


const TESTING = true;

const DEFAULT_DESCRIPTIONS_FILE = "data/repo_descriptions.json"


class RepoOps {

    constructor(conf,all_p) {
        this._conf = conf       // repo_support part of repo
        this._all_procs = all_p
        this.fos = new FileOperations(false)
        this._known_repos = []
        this._known_repo_map = {}
        this._known_repo_descriptions = {}

        this.git = simpleGit();
        this.repo_lists = new RepoListOps(conf,this.git)

        
        let self = this
        let b = async () => {
            await this.load_known_repos(conf)
            await self.load_known_repo_descriptions(conf)
        }
        setImmediate(b)
    }


    reload_configuration() {
        conf_str = fs.readFileSync("manager.conf").toString()
        this._conf = JSON.parse(conf_str)
    }

    
    sendable_proc_data() {
        //
        let sendable = this._all_procs.clone_proc_managers()
        //
        for ( let ky in sendable ) {
            let descr = sendable[ky]
            delete descr.child_proc
            delete descr.key_value
            delete descr.session_key_value
            delete descr.static
        }
        //
        return sendable
    }
    

    // ----
    check_admin_pass(password) {
        if ( this._conf.password === password ) {
            return true
        }
        return false
    }
    

    known_repos_to_map() {
        this._known_repo_map = {}

        for ( let repo of this._known_repos ) {
            this._known_repo_map[repo.name] = repo
        }
    }


    ignores_dir(repo_dir) {
        if ( (typeof this._conf === 'object') && (typeof this._conf.ignored_repos === 'object') ){
            let ignores = this._conf.ignored_repos
            if ( repo_dir in ignores ) {
                return true
            } else { // check that the path is matches something higher up
                let higher_dir = path.dirname(repo_dir)
                while ( higher_dir.length > 1 ) {
                    if ( higher_dir in ignores ) {
                        return true
                    }
                    higher_dir = path.dirname(higher_dir)
                }
                return false
            }
        }
        return false
    }


    async load_known_repos(conf) {
        if ( conf.repo_list === undefined ) return
        this._known_repos = await this.process_repo_list(conf.repo_list);   // let it throw an exception if this is not here.
        this.known_repos_to_map()
    }


    async load_known_repo_descriptions(conf) {
        if ( !(conf.descriptions_file) ) {
            conf.descriptions_file = DEFAULT_DESCRIPTIONS_FILE
        }

        try {
            let fname = `${conf.descriptions_file}`
            let saved_map = fs.readFileSync(fname).toString()
            if ( saved_map ) {
                saved_map = JSON.parse(saved_map)
                this._known_repo_descriptions = saved_map
console.log(JSON.stringify(saved_map,null,2))

            }
        } catch (e) {
            console.log(e)
        }

console.log("CALLING sync_descriptions_repo_list")

        await this.sync_descriptions_repo_list(false)

    }


    async generate_repos_as_string() {
        try {
            let rlist = await this.repo_lists.list_all_git_directories()
            return JSON.stringify(rlist,null,2)
        } catch (e) {}
        return false
    }

    async sync_descriptions_repo_list(repo_descr_edits) {
        let conf = this._conf
        if ( !(conf) ) return "{}"
        if ( this._known_repos.length === 0 ) {
console.log("callling load_known_repos")
            await this.load_known_repos(conf)
        }
        let repo_names = Object.keys(this._known_repo_map)

    console.log(Object.keys(this._known_repo_descriptions))

        let updates = false
        for ( let name of repo_names ) {
            if ( this._known_repo_descriptions[name] === undefined ) {
                updates = true
                let r_desc = {
                    "text" : ""
                }
console.log("sync_descriptions_repo_list -> name",name)
                this._known_repo_descriptions[name] = r_desc
            }
        }

        if ( repo_descr_edits ) {
            updates = true
            for ( let [name,r_update] of Object.entries(repo_descr_edits) ) {
                let r_desc = this._known_repo_descriptions[name]
                if ( !(r_desc) ) {
                    this._known_repo_descriptions[name] = { "text" : r_update.text }
                } else {
                    r_desc.text = r_update.text
                }
            }
        }

        if ( updates ) {
            this.fos.write_out_json(conf.descriptions_file,this._known_repo_descriptions)
        }

        return JSON.stringify(this._known_repo_descriptions,null,2)
    }


    match_remote(target_remote,repo_remote) {
        if ( (target_remote.indexOf("https") === 0) &&  (repo_remote.indexOf("https") === 0) ) {
            repo_remote = repo_remote.substring("https:/".length).trim()
            target_remote = target_remote.substring("https:/".length).trim()
            if ( repo_remote[0] === '/' ) repo_remote = repo_remote.substring(1)
            if ( repo_remote[0] === '/' ) repo_remote = repo_remote.substring(1)
            if ( target_remote[0] === '/' ) target_remote = target_remote.substring(1)
            if ( target_remote[0] === '/' ) target_remote = target_remote.substring(1)
            return target_remote === repo_remote
        } else {
            return target_remote.trim() === repo_remote.trim()
        }
    }

    async generate_repos_update_as_string() {
        try {
            let rlist = await this.repo_lists.list_all_git_directories()
            // just update the old list that may have remotes that we are looking to sync with

            let new_names = []

            for ( let repo of rlist ) {
                let name = repo.name

                if ( this.ignores_dir(name) ) {
                    continue
                }

                new_names.push(name)

                let target = this._known_repo_map[name]

//                 if ( target ) {
// console.log(name, target.remote, repo.remote)
//                 }

                if ( target === undefined ) {
                    this._known_repos.push(repo)
                    this._known_repo_map[name] = repo
                } else {
                    if ( (repo.remote !== "unknown") && (target.remote === "unknown") ) {
                        target.remote = repo.remote
                    }
                    
console.log(target.remote)
console.log(repo.remote)
                    if ( repo.remote === "unknown" ) {
                        target.in_sync = false
                    } else if ( this.match_remote(target.remote,repo.remote)   ) {
                        target.in_sync = true
                    } else {
                        target.in_sync = false
                    }
console.log(target.in_sync,"------------<<","\n")
                }
            }

            // clean out old targets that got lost if a directory moved.
            let k_repos = this._known_repos
            this._known_repos = k_repos.filter((repo) => {
                let rname = repo.name
                if ( new_names.indexOf(rname) < 0 ) {
                    delete this._known_repo_map[rname]
                    return false
                }
                return true
            })

            return JSON.stringify(this._known_repos)
        } catch (e) {
            console.log(e)
        }
        return false
    }


    async unload_known_repos(array_of_hosts) {
        let conf = this._conf
        let repo_list_file = conf.repo_list
        this._known_repos = array_of_hosts
        await this.fos.write_out_json(repo_list_file,array_of_hosts)
    }
    

    async process_repo_list(repo_list_file) {
        if ( await this.fos.exists(repo_list_file) ) {
            let hlist = await this.fos.json_data_reader(repo_list_file)
            if ( hlist === undefined ) {
                throw new Error(`no host file ${repo_list_file} contents`)
            }
            if ( Array.isArray(hlist) ) {
                return hlist
            } else {
                throw new Error(`no host file ${repo_list_file} contents is not an array`)
            }
        }
        throw new Error(`no host file ${repo_list_file}`)
    }


    get_known_repos_as_string() {
        if ( TESTING ) {
            this.load_known_repos(this._conf)
        }
        return JSON.stringify(this._known_repos)
    }


    async run_repo_command(params) {
        let command = params.command

        switch ( command ) {
            case "fetch-all" : {
                let rlist = this._known_repos

                for ( let repo of rlist ) {
                    if ( repo.in_sync ) {
                        let git_dir = repo.name
                        try {
                            await this.git.cwd({ path: git_dir, root: true });
                            await this.git.fetch()
                        } catch (e) {
                            console.log(e)
                        }
                    }
                }

                break;
            }
            case "pull-all" : {
                let rlist = this._known_repos

                for ( let repo of rlist ) {
                    if ( repo.in_sync ) {
                        let git_dir = repo.name
                        try {
console.log("pull-all",git_dir)
                            await this.git.cwd({ path: git_dir, root: true });
                            await this.git.pull()
                        } catch (e) {
                            console.log(e)
                        }
                    }
                }

                break;
            }
            case "ignore-dir": {
                if ( !(this._conf) ) break
                let blocked_dir =`${this._conf.top_repo_dir}/${params.parameters}` 
                if ( typeof this._conf.ignored_repos === 'undefined' ) {
                    this._conf.ignored_repos = {}
                }
                this._conf.ignored_repos[blocked_dir] = Date.now()
                return true
            }
            case "get-status" : {
                if ( !(this._conf) ) break
                let git_dir = params.parameters
                try {
                    await this.git.cwd({ path: git_dir, root: true });
                    let file_info = await this.git.status()
console.dir(file_info)
                    let file_list = {}
                    for ( let ky in file_info ) {
                        if ( Array.isArray(file_info[ky]) ) {
                            file_list[ky] = file_info[ky]
                        }
                    }
                    return file_list
                } catch (e) {
console.log(e)
                }
                break
            }
        }

        return false
    }
/*
   not_added: string[];
   conflicted: string[];
   created: string[];
   deleted: string[];

   ignored?: string[];
   modified: string[];
   renamed: StatusResultRenamed[];
   staged: string[];

   
   files: FileStatusResult[];

   ahead: number;

   behind: number;

   current: string | null;

   tracking: string | null;

   detached: boolean;

   isClean(): boolean;
*/


    async ssh_get(remote_op,obj) {
        //
        switch ( remote_op ) {
            case "show-lan" : {
                let user = obj.user
                let address = obj.address
                let results = await this.get_hosts_on_remote_lan(user,address)
                obj.data = results
                return true;
            }
        }
        //
        return false
    }


    async get_hosts_on_remote_lan(user,address,lan_mask) {

        let cmd_list = `nmap -sn 192.168.1.0/24`
        if ( lan_mask !== undefined ) {
            cmd_list = `nmap -sn ${lan_mask}/24`
        }

        let ssh_command = `ssh ${user}@${address} "${cmd_list}"`


        return new Promise((resolve,reject) => {
    
            exec(ssh_command, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                let output = stdout.split('\n')
                //
                output = output.filter((line) => {
                    return (line.indexOf("Nmap scan report for ") == 0);
                })
                //
                let olist = output.map(line => {
                    let slen = "Nmap scan report for ".length;
                    line = line.substring(slen)
                    return line
                })

                olist = olist.filter((line) => {
                    if ( line.indexOf(' (') > 0 ) {
                        return true
                    }
                    return false
                })
                //
                resolve(olist)
            });
        })
    
    }
    

    async get_hosts_on_lan(lan_mask) {

        let cmd_list = `nmap -sn 192.168.1.0/24`
        if ( lan_mask !== undefined ) {
            cmd_list = `nmap -sn ${lan_mask}/24`
        }
        return new Promise((resolve,reject) => {
    
            exec(cmd_list, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                let output = stdout.split('\n')
                //
                output = output.filter((line) => {
                    return (line.indexOf("Nmap scan report for ") == 0);
                })
                //
                let olist = output.map(line => {
                    let slen = "Nmap scan report for ".length;
                    line = line.substring(slen)
                    return line
                })
                //
                resolve(olist)
            });
        })
    
    }
    




    async get_file(obj,app_file) {
        let file = ""
        try {
            file = req.params.file
            let data = await fsPromise.readFile(app_file)
            let page = data.toString()
            obj.data = page
            return true
        } catch (e) {
            console.log(e)
        }
        return false
    }


    async get_app_file(obj) {
        let file = obj.file
        return await this.get_file(obj,`${__dirname}/app/${file}`)
    }

    async get_asset_file(obj) {
        let file = obj.file
        return await this.get_file(obj,`${__dirname}/app/assets/${file}`)
    }

    async get_build_file(obj) {
        let file = obj.file
        return await this.get_file(obj,`${__dirname}/app/build/${file}`)
    }
    
            
    app_procs(obj) {
        let sendable = this.sendable_proc_data()
        let output = JSON.stringify(sendable,"null",2)
        obj.data = output
        return true
    }
    

    app_repo_list(obj) {
        if ( g_host_ops ) {
            let output = g_host_ops.get_known_repos_as_string()
            obj.data = output
            return true
       }
       return false
    }


    async app_get_config(obj) {
        let file = decodeURIComponent(obj.enc_file)
        try {
            let data = await fsPromise.readFile(`./${file}`)
            obj.data = data.toString()
            return true
        } catch (e) {
            console.log("could not load the requested file" + file); 
        }
        return false
    }




    async data_read_op(obj) {
        let admin_pass = obj.admin_pass
        let admin_OK = check_admin_pass(admin_pass)
        if ( admin_OK ) {
            //
            let operation = obj.op
            if ( operation ) {
                switch ( operation.name ) {
                    case "app-file" : {
                        return await this.get_app_file(obj)                    
                    }
                    case "asset-file" : {
                        return await this.get_asset_file(obj)                    
                    }
                    case "build-file" : {
                        return await this.get_build_file(obj)                    
                    }
                    case "all-procs" : {
                        return await this.app_procs(obj)                    
                    }
                    case "host-list" : {
                        return await this.app_repo_list(obj)                   
                    }
                    case "get-config" : {
                        return await this.app_get_config(obj)                    
                    }
                    case "lan-hosts" : {
                        return await this.get_hosts_on_lan(obj.lan_mask)
                    }
                    default: {
                        break
                    }
                }
            }
        }
        return false
    }


    async app_run_sys_op(obj) {         /// set op
        let admin_pass = obj.admin_pass
        let admin_OK = check_admin_pass(admin_pass)
        if ( admin_OK ) {
            //
            let operation = obj.op
            if ( operation ) {
                switch ( operation.name ) {
                    case "add-proc" : {
                        let new_proc = operation.param.proc_def
                        let proc_name = operation.param.proc_name
                        this._all_procs.add_one_new_proc(new_proc,proc_name)
                        unload_json_file("manager.conf",this._conf)
                        return true
                    }
                    case "remove-proc" : {
                        return this._all_procs.stop_and_remove_from_config(operation.param.proc_name)
                    }
                    case "update-proc" : {
                        let new_proc = operation.param.proc_def
                        this._all_procs.update_one_proc(new_proc,operation.param.proc_name)
                        unload_json_file("manager.conf",this._conf)
                        return true
                    }
                    case "stop-proc" : {
                        let proc_name = operation.param.proc_name
                        return this._all_procs.stop_proc(proc_name)
                    }
                    case "run-proc" : {
                        let proc_name = operation.param.proc_name
                        let if_running = operation.param.if_running
                        return this._all_procs.run_proc(proc_name,if_running)
                    }
                    case "restart-proc" : {
                        let proc_name = operation.param.proc_name
                        return this._all_procs.restart_proc(proc_name)
                    }
                    case "install" : {
                        // npm installer
                        break
                    }
                    case "remove" : {
                        // npm remove
                        return false
                    }
                    case "config" : {
                        let file = operation.param.file
                        let output = operation.param.config
                        try {
                            await fsPromise.writeFile(`./${file}`,output)
                            return true
                        } catch (e) {
                            console.log("could not load the requested file" + file); 
                        }
                        break
                    }
                    case "reload" : {
                        try {
                            reload_configuration()
                            initialize_dormant_children(conf)
                            return true
                        } catch (e) {
                            console.log("could reload app table"); 
                        }
                        break;
                    }
                    case "exec" : {
                        let cmd_obj = operation.param.proc_def
                        let cmd_list = `${cmd_obj.runner} ${cmd_obj.args}`
                        //
                        let p = new Promise((resolve,reject) => {
                            exec(cmd_list, (error, stdout, stderr) => {
                                if (error) {
                                    console.log(`error: ${error.message}`);
                                    resolve(false)
                                    return;
                                }
                                if (stderr) {
                                    console.log(`stderr: ${stderr}`);
                                    resolve(false)
                                    return;
                                }
                                // supposed to send it back to a listener on the web socket channel
                                let html_fix = stdout.split('\n').join('<br>')
                                html_fix = `<div>${html_fix}</div>`
                                obj.data = `stdout: ${html_fix}`
                                resolve(true)
                            });    
                        })
                        //
                        let status = await p;
                        // Run a short-lived command (bash script)
                        return status
                    }
    
                    case "stop-all" : {
                        this._all_procs.stop_all()
                        return true
                    }
                }
            }
            //
        }
        return false
    }
    
    
}




module.exports = RepoOps

