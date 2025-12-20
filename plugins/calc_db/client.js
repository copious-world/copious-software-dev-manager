

window.g_all_concerns_db_map = {}

window.level_1_keys = null
window.level_2_keys = null

function keys_to_active_keys(top_level_keys,active_list_container,secondary_keys,responsive_list_containers) {
    // 
    let entry_display = (entry,idx) => {
        let element_def = `
            <button onclick="show_and_hide_2nd_list(${idx})">${entry}</button>
        `
        //
        let ky2 = Object.keys(secondary_keys)[idx]
        let entry_display2 = (entry2,idx2) => {
            let element_def = `
                <button onclick="show_hide_3rd_form('${entry}','${entry2}',${idx2})">${entry2}</button>
            `
            return element_def
        }
        display_active_list(responsive_list_containers[idx],secondary_keys[ky2],entry_display2)

        return element_def
    }
    //
    display_active_list(active_list_container,top_level_keys,entry_display)
    //
}


function show_and_hide_2nd_list(idx) {
    let target = document.getElementById(`files-editor-calc_db-outer-${idx+1}`)
    if ( target ) {
        let all_viz = document.getElementsByClassName("files-editor-calc_db-outer-secondary-item-shown")
        if ( all_viz && all_viz.length ) {
            for ( let vz of all_viz ) {
                vz.className = "files-editor-calc_db-outer-secondary-item"
            }
        }
        target.className = "files-editor-calc_db-outer-secondary-item-shown"
    }
}


function show_hide_3rd_form(concern,key,idx) {

    let object = g_all_concerns_db_map[concern][key]
    let keys = Object.keys(object)
    let kyd_display = ""
    for ( let ky of keys ) {
        kyd_display += `${ky}<br>`
    }

    
    let menu_box = document.getElementById("fields-editor-calc_db-outer")
    if ( menu_box ) {
        menu_box.innerHTML = kyd_display
    }

    return true
}


function display_active_list(active_list_container,top_level_keys,entry_display) {
    let joiner = "<br/>"
    let list_dislay = top_level_keys.map((ky,idx) => {
        return entry_display(ky,idx)
    })
    let item_list_rendering = list_dislay.join(joiner)
    active_list_container.innerHTML = item_list_rendering
}


function map_object_to_form_values(form_id,object) {
    //
    for ( let ky in object ) {
        let value = object[ky]
        if ( typeof value !== 'object' ) {
            let field_id = `${form_id}-${ky}`
            let fld = document.getElementById(field_id)
            if ( fld ) {
                fld.value = value
                fld._x_value_update = ((obj,key) => {return (value) => {
                    obj[key] = value
                }})(object,ky)
            }
        } else {
            map_object_to_form_values(field_id,object[ky])
        }
    }
    //
}


/**
 * 
 * @param {*} fld 
 * @param {*} value 
 */
function update_entry_value(fld,value) {
    if ( fld ) {
        fld._x_value_update(value)
    }
}


function flatten_level_to_list(top_level_keys,obj,depth) {
    depth--
    if ( depth <= 0 ) {
        return top_level_keys
    }
    if ( Array.isArray(top_level_keys) && (typeof obj !== 'object') ) {
        return top_level_keys
    }
    for ( let ky of top_level_keys ) {
        obj[ky] = flatten_level_to_list(Object.keys(obj[ky]),depth)
    }
    return obj
}


async function get_concerns_map(active_list_container,responsive_list_containers) {
      let params = {
        "admin_pass" : "default",
        "host" : "localhost:8989"
    }

    let data = await window.post_plugin_cmd("calc_db","get_cal_db",[],params)

    // let result = test_data

    if ( data ) {
        g_all_concerns_db_map = data
        //
        let top_level_keys = Object.keys(g_all_concerns_db_map)
        let obj = Object.assign({},g_all_concerns_db_map)
        let subs = flatten_level_to_list(top_level_keys,obj,2)
        //
        keys_to_active_keys(top_level_keys,active_list_container,subs,responsive_list_containers)
    }
}



async function save_cal_db(concern,file) {
    
    let result = false  // window.post_plugin_cmd("calc_db","save_calc_db",[concern,file])
    if ( result && (result.status === "OK") ) {
        //
        console.log("GREAT")
        //
    } else {
        console.log("NOT SO GREAT")
    }
}




async function populate(concerns,concern_files) {
    let alc = document.getElementById(concerns)
    let all_viz = document.getElementsByClassName("files-editor-calc_db-outer-secondary-item")
    await get_concerns_map(alc,all_viz)
}