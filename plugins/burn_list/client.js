

let g_all_burn_lists = {}
let g_current_burn_list = {}

async function get_burn_list(list_keys,container) {
    let result = window.post_plugin_cmd("burn_list","get_lists",[list_keys])
    if ( result && (result.status === "OK") ) {
        //
        populate(container,result.keys)
        if ( result.burn_list_map ) {
            g_all_burn_lists = result.burn_list_map
        }
        //
    }
}



async function save_burn_list() {
    let result = window.post_plugin_cmd("burn_list","save_lists",[g_all_burn_lists])
    if ( result && (result.status === "OK") ) {
        //
        console.log("GREAT")
        //
    } else {
        console.log("NOT SO GREAT")
    }
}



function bl_description_to_form(burn_el) {

}



function bl_focus_on(event,list_ky) {
    if ( g_current_burn_list ) {
        let burn_el = g_current_burn_list[list_ky]
        if ( burn_el ) {
            bl_description_to_form(burn_el)
        }
    }
}


function bl_focus_on(event,item_ky) {
    let blist = g_all_burn_lists[item_ky]
    if ( blist ) {
        g_current_burn_list = blist
        let bl_sublist = document.getElementById("current_burn_list")
        let list_html = ""
        for ( let item of blist ) {
            list_html += `
            <li onclick="bl_focus_on(event,'${item}')" >
                ${item}
            </li>
            `
        }
        bl_sublist.innerHTML = list_html
    }
}



function populate(container,data) {
    if ( container.type === "ul" ) {
        let list_html = ""
        for ( let item of data ) {
            list_html += `
            <li onclick="bl_focus_on(event,'${item}')" >
                ${item}
            </li>
            `
        }
        container.innerHTML = list_html
    }
}