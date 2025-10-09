#!/usr/bin/env node
const polka = require('polka');
const send = require('@polka/send-type');
const app         = polka();
//
const { json } = require('body-parser');
const cors = require('cors')

app.use(json())

// let corsOptions = {
//     origin: 'http://localhost:*',
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
//   }
app.use(cors())
//
const fs = require('fs-extra')
const http = require('http')

const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server;


const WebSocketActions = require('../lib/websocket_con')
const RepoOps = require('../lib/repo_ops')
const KanbanOps = require('../lib/kanban_ops')
const AllProcsManager = require('../lib/all_procs_manager')

const {MultiRelayClient,MessageRelayer} = require('message-relay-services')


/*
TERMINAL ... set it up...

    // need frame for : ssh richard@76.229.181.242 -L 8080:localhost:8080 -N
    // goes to ttyd ... pick a good port (consider using some keys, etc.)


*/

// This process becomes the forever process manager for processes launched off of a very private web service.
//

// For each type of shared table launched, this process maintains a list of interface types that may be configured 
// for processes that it launches. Also, can launch other DB management processes. 
// When this launches a processes, it can check that the configuration of the process has an interface conforming 
// to the types of DB managers that this has launched.

// Principle going forward: Every single application process can attach to a DB/Shared Mem table, while every DB or table 
// is a standalone manager that provides lifecycle for the shared object. 

// This proces, the copious-transions-manager, manages the DB lifecycle processes and spawns applications configured to attach 
// to the share objects. 

// 
class WSConsole extends console.Console {
    constructor(fn,out,err) {
        super(out,err)
        this.log_custom = fn
    }

    log(...args) {
        super.log(...args)
        this.log_custom(args)
    }
}

let save_console = false
function setup_console(fn) {
    save_console = console
    //
    let custom_console = new WSConsole(fn,process.stdout,process.stderr)
    console = custom_console
}


let g_ws_socks = false
let g_config = false
//
let g_descriptions = false

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----


// LOAD CONFIGURATION  ... if this crashes, that's fine
try {
    let conf_str = fs.readFileSync("manager.conf").toString()
    g_config = JSON.parse(conf_str) 
} catch (e) {
    console.log("THERE NEEDS TO BE A PROPERLY JSON-FORMATTED CONFIGURATION FILE, manager.conf  IN YOUR WORKING DIRECTORY")
    process.exit(0)
}




// LOAD DESCRIPTIONS  ... if this crashes, that's fine
try {
    // let descriptions_str = fs.readFileSync("data/repo_descriptions.json").toString()
    // g_descriptions = JSON.parse(descriptions_str)

    //  console.log(g_descriptions)

setTimeout(() => {
    let dlist = fs.readdirSync("data")
    console.log(dlist)
},1000)
} catch (e) {json
    console.log(e)
    console.log("THERE NEEDS TO BE A PROPERLY JSON-FORMATTED DESCRIPTION FILE, repo_descriptions.json  IN YOUR WORKING DIRECTORY")
    process.exit(0)
}

/**
 * write_out_config
 *  update the configuration file with operational changes...
 *  for example, this method is added to handle the case of ignoring directories, which in turn have .gitignore inside them.
 * 
 */
function write_out_config() {
    if ( typeof g_config === 'object' ) {
        try {
console.log("write_out_config")
            let conf_output_str = JSON.stringify(g_config,null,2)
            fs.writeFileSync("manager.conf",conf_output_str)
        } catch (e) {}
    }
}

console.dir(g_config)

//
// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------
//
const MANAGER_PORT = g_config.web_page_port

let g_proc_managers = {}

let g_all_procs = new AllProcsManager(g_config)
let g_repo_ops = new RepoOps(g_config.repo_support,g_all_procs)
let g_kanban_ops = new KanbanOps(g_config.kanban_support)
let g_message_relayer = new MultiRelayClient(g_config.clusters,MessageRelayer);


//g_repo_ops.test()

console.log(__dirname)


app.get('/', async (req, res) => {
    let obj = {
        "file": "index.html"
    }
    let status = await g_repo_ops.get_app_file(obj)
    //
    if ( status ) {
        let page = obj.data.toString()
        res.end(page);
    } else {
        send(res,404,"root: could not load the requested file")
    }
    //
});



app.get('/:file', async (req, res) => {
    let file = ""
    let obj = {
        "file": req.params.file
    }
    let status = await g_repo_ops.get_app_file(obj)
    if ( status ) {
        let page = obj.data.toString()
        res.end(page);
    } else {
        send(res,404,"could not load the requested file: " + file)
    }
})


// not accessible by nginx (i.e. must be on the machine in ssh ... use wget)

app.get('assets/:file', async (req, res) => {
    let obj = {
        "file": req.params.file
    }
    let status = await g_repo_ops.get_asset_file(obj)
    if ( status ) {
        let page = obj.data.toString()
        res.end(page);
    } else {
        send(res,404,"could not load the requested file: " + obj.file)
    }
})

// not accessible by nginx (i.e. must be on the machine in ssh ... use wget)

app.get('build/:file', async (req, res) => {
    let obj = {
        "file": req.params.file
    }
    let status = await g_repo_ops.get_build_file(obj)
    if ( status ) {
        let page = obj.data.toString()
        res.end(page);
    } else {
        send(res,404,"could not load the requested file: " + obj.file)
    }
})



// paths published to nginx ...

app.get('/app/procs', (req, res) => {
    let obj = {}
    g_repo_ops.app_procs(obj)
    return res.end(obj.data);
});


app.get('/app/repo-list', async (req, res) => {
    //
    if ( g_repo_ops ) {
        let output = g_repo_ops.get_known_repos_as_string()
        return res.end(output);
    }
    //
    send(res,404,"system not intialized")
});


app.get('/app/repo-list-update/', async (req, res) => {
    //
    if ( g_repo_ops ) {
        let output = await g_repo_ops.generate_repos_update_as_string()
        if ( output === false ) {
            return res.end("{}")
        }
        return res.end(output);
    }
    //
    send(res,404,"system not intialized")
});



app.get('/app/repo-list-descriptions/', async (req, res) => {
    //
    if ( g_repo_ops ) {
        let output = await g_repo_ops.sync_descriptions_repo_list(false)
        if ( output === false ) {
            return res.end("{}")
        }
        return res.end(output);
    }
    //
    send(res,404,"system not intialized")
});


app.post('/app/save-repo-descriptions', async (req, res) => {
    //
    if ( g_repo_ops ) {
        //
        let params = req.body
        await g_repo_ops.sync_descriptions_repo_list(params.descriptions)
        //
        send(res,200,{ "status" : "OK" })
    } else {
        send(res,404,"system not intialized")
    }
    //
});



app.post('/app/save-repo-list', async (req, res) => {
    //
    if ( g_repo_ops ) {
        let params = req.body

        await g_repo_ops.unload_known_repos(params["repo-list"])
        
        send(res,200,{ "status" : "OK" })
    } else {
        send(res,404,"system not intialized")
    }
});



app.post('/app/repo-cmd', async (req, res) => {
    //
    if ( g_repo_ops ) {
        let params = req.body

        let update_config = await g_repo_ops.run_repo_command(params)
        if ( update_config === true ) {
            write_out_config()
        }

        if ( typeof update_config === "object" ) {
            send(res,200,{ "status" : "OK", "data" : update_config})
        } else {
            send(res,200,{ "status" : "OK" })
        }
        
    } else {
        send(res,404,"system not intialized")
    }
});





app.get('/app/get-kanban/:title', async (req, res) => {
    //
    if ( g_repo_ops ) {
        let title = req.params.title
        let output = g_kanban_ops.get_kanban_as_string(title)
        return res.end(output);
    }
    //
    send(res,404,"system not intialized")
});


app.post('/app/save-kanban', async (req, res) => {
    //
    if ( g_kanban_ops ) {
        let params = req.body

        await g_kanban_ops.unload_kanban(params)
        
        send(res,200,{ "status" : "OK" })
    } else {
        send(res,404,"system not intialized")
    }
});








app.get('/app/logs/:proc_name', (req, res) => {
    res.end('show the logs of a proc!');   // get the file from the run directory.
});


app.get('/app/get-config/:enc_file',async (req, res) => {
    //save-kanban
    let obj = { "enc_file" : req.params.enc_file }
    if ( await g_repo_ops.app_get_config(obj) ) {
        res.end(obj.data);
    } else {
        res.end("could not load the requested file" + obj.enc_file); 
    }
    //
})


app.get('/app/plugin-list',async (req, res) => {
    //
    if ( g_config && (g_config.plugin_app_panels !== undefined ) ) {
        let kys = Object.keys(g_config.plugin_app_panels)
        res.end(JSON.stringify(kys))
    } else {
        res.end("could not load plugin list"); 
    }
})


app.get('/app/plugin/:plugin',async (req, res) => {
    //
    if ( g_config && (g_config.plugin_app_panels !== undefined ) ) {
        let obj = {
            "file": req.params.plugin
        }
        let status = await g_repo_ops.get_asset_file(obj)
        if ( status ) {
            let page = obj.data.toString()
            res.end(page);
        } else {
            send(res,404,"could not load the requested file: " + obj.file)
        }    
    } else {
        res.end("could not load plugin file"); 
    }
    //
})



app.get('/app/lan-list/:addr/:user',async (req, res) => {
    //
    let obj = {
        "address" : req.params.addr,
        "user" : req.params.user
    }
    let remote_op = "show-lan"
    if ( await g_repo_ops.ssh_get(remote_op,obj) ) {

//console.log(obj.data)
        let output = JSON.stringify(obj.data)
        //

        res.end(output);
    } else {
        res.end("could not load the requested file" + obj.enc_file); 
    }
    //
})




app.post('/app/run-sys-op', async (req, res) => {

    if ( await g_repo_ops.app_run_sys_op(req.body) ) {
        send(res,200,{ "status" : "OK" })
    } else {
        send(res,200,{ "status" : "ERR" })
    }
})




function handler_ws_messages(message_body) {
    console.dir(message_body)
}


function ws_proc_status() {
    if ( g_proc_managers && g_ws_socks ) {
        let sendable = g_repo_ops.sendable_proc_data()
        let op_message = {
            "op" : "proc-status",
            "data" : sendable
        }
        g_ws_socks.send_to_going_sessions(op_message)
    }
}


function ws_console_log(data) {
    if ( g_proc_managers && g_ws_socks ) {
        let op_message = {
            "op" : "console-output",
            "data" : data
        }
        g_ws_socks.send_to_going_sessions(op_message)
    }
}


// ------------- ------------- ------------- ------------- ------------- ------------- ------------- -------------
if ( g_config.wss_app_port ) {   // WEB APP SCOCKETS OPTION (START)
// ------------- ------------- ------------- ------------- ------------- ------------- ------------- -------------

    g_ws_socks = new WebSocketActions()
    
    let app_server = http.createServer(app);
    app_server.listen(g_config.wss_app_port);
    //
    var g_app_wss = new WebSocketServer({server: app_server});
    g_ws_socks.set_socket_server(g_app_wss,handler_ws_messages)
    //

    setInterval(() => { ws_proc_status() },5000)

    setup_console(ws_console_log)

// ------------- ------------- ------------- ------------- ------------- ------------- ------------- -------------
}       // WEB APP SCOCKETS OPTION (END)
// ------------- ------------- ------------- ------------- ------------- ------------- ------------- -------------


//
//
//

// ---- ---- ---- ---- ----
//g_all_procs.initialize_children()
// ---- ---- ---- ---- ----
app.listen(MANAGER_PORT)
console.log(`listening on port ${MANAGER_PORT}`)
