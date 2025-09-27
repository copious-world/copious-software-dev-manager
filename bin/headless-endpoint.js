#!/usr/bin/env node

const {ServeMessageEndpoint} = require('message-relay-services')

const fs = require('fs')

const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server;


const WebSocketActions = require('../lib/websocket_con')
const HostOps = require('../lib/host_ops')
const AllProcsManager = require('../all_procs_manager')


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
//const clone = require('clone-deep');


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

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----


// LOAD CONFIGURATION  ... if this crashes, that's fine
try {
    let conf_str = fs.readFileSync("manager.conf").toString()
    g_config = JSON.parse(conf_str)    
} catch (e) {
    console.log("THERE NEEDS TO BE A PROPERLY JSON-FORMATTED CONFIGURATION FILE, manager.conf  IN YOUR WORKING DIRECTORY")
    process.exit(0)
}



//
// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------
//
const MANAGER_PORT = g_config.web_page_port


let g_all_procs = new AllProcsManager(g_config)
//

console.log(__dirname)


/**
 * ProcJSTableManager
 * 
 * This class provides a fuax DB interface for parents and children. 
 * There is no message forwarding for communication between the classes. 
 * 
 */
class HeadlessProcManager extends ServeMessageEndpoint {
    //
    constructor(conf,all_procs) {
        super(conf)

        //
        this._host_ops = new HostOps(conf,all_procs)
        this._all_procs = all_procs
        //

        // ---- ---- ---- ---- ----
        this._all_procs.initialize_children()
        // ---- ---- ---- ---- ----
    }

    //
    id_augmentation(msg_obj) {
        let user_id = msg_obj._user_dir_key ? msg_obj[msg_obj._user_dir_key] : msg_obj._id
        if ( (user_id === undefined) && (msg_obj._id !== undefined) ) {
            user_id = msg_obj._id
        }
        msg_obj._id = user_id
    }

    //
    async app_message_handler(msg_obj) {
        let op = msg_obj._tx_op
        let result = "ERR"
        //
        this.id_augmentation(msg_obj)
        //
        switch ( op ) {
            case 'S' : {
                //
                if ( await this._host_ops.app_run_sys_op(msg_obj) ) {
                    result = "OK"
                }
                //
                return({ "status" : result,  "explain" : "set", "when" : Date.now() })
            }
            case 'M' : {
                result = "OK"


                return({ "status" : result,  "explain" : "mod", "when" : Date.now() })
            }
            case 'G' : {        // get user information
                let data = ""

                let status = await this._host_ops.data_read_op(msg_obj)

                if ( status ) {
                    result = "OK"
                    data = msg_obj.data
                }

                return({ "status" : result, "data" : data,  "explain" : "get", "when" : Date.now() })
            }
            case 'D' : {        // delete asset from everywhere if all ref counts to zero. (unpinned)

                return({ "status" : result,  "explain" : "del", "when" : Date.now() })
            }
            default: {  // or send 'S'
                let status = false

                result = status ? "OK" : "ERR"
            }
        }
        //
        return({ "status" : result, "explain" : `${op} performed`, "when" : Date.now(), "_tracking" : msg_obj._tracking })
    }


    // app_publication_pre_fan_response
    //  -- 
    /**
     * Runs before writing publications.
     * 
     * This runs if `app_can_block_and_respond`. A true value returned means that the application has blocked the publication.
     * 
     * Gives the application the chance to refuse a publication or to pass it based on criterea.
     * 
     * The application may take care of any operation it requires for publication prior to publishing 
     * with the intention of returning false to pass this on to publication. (One might imagine a situation
     * where the application will read a measurement from sensor and publish the message if the sensor has actually changed. The application version of this 
     * method would return false indicating that the update publication will not be blocked. The method can be used to write the new value onto 
     * the message object.)
     * 
     * The pulication method, `send_to_all` awaits the return of this method.
     * 
     * @param {string} topic 
     * @param {object} msg_obj 
     * @returns {boolean} True if this appliction will return without publishing to subscribers. False if going on to publication.
     */
     async app_publication_pre_fan_response(topic,msg_obj) {
        console.log("Descendent must implement app_publication_pre_fan_response")
        return false
    }


    //  app_subscription_handler
    // -- runs post fanout of publication
    /**
     * 
     * Applications override this method if `app_handles_subscriptions` has been set via configuration.
     * This method is called after publication of a topic message to subscribers.
     * This method gives applications the chance to handle internal publication or to make database updates (say)
     * or any other action required to manage the pub/sub process.
     * 
     * 
     * @param {string} topic 
     * @param {object} msg_obj 
     */
    app_subscription_handler(topic,msg_obj) {
        console.log("Descendent must implement app_subscription_handler")
    }

    

    /**
     * This method is always called by the `add_to_topic` method.
     * The application has the chance to perform any operation it needs to mark the beginning of a subscription 
     * and to set aside whatever resources or needed to manage the subscription.
     * 
     * @param {string} topic 
     * @param {string} client_name 
     * @param {object} relayer 
     */
    app_post_start_subscription(topic,client_name,relayer) {
        console.log("Descendent must implement app_post_start_subscription")
    }



}





function handler_ws_messages(message_body) {
    console.dir(message_body)
}


function ws_proc_status() {
    if ( g_ws_socks ) {
        let sendable = sendable_proc_data()
        let op_message = {
            "op" : "proc-status",
            "data" : sendable
        }
        g_ws_socks.send_to_going_sessions(op_message)
    }
}


function ws_console_log(data) {
    if ( g_ws_socks ) {
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


let headless = new HeadlessProcManager(g_config,g_all_procs)