

window.g_all_concerns_db_map = {}

window.calc_db_shorten_this_url = "/home/richard/GitHub/alphas/websites"

window.g_current_select_calc_db = null
window.g_current_select_calc_db_page = null
window.g_current_select_calc_db_page_section = null

function show_and_hide_2nd_list(ev,idx,entry) {

    let concern_div = document.getElementById("form-editor-calc_db-outer-id-concern-show")
    if ( concern_div ) { concern_div.innerHTML = entry }

    let this_el = ev.target
    if ( g_current_select_calc_db ) {
        g_current_select_calc_db.style.color = "black"
    }
    g_current_select_calc_db = this_el
    this_el.style.color = "darkred"

    let target = document.getElementById(`files-editor-calc_db-outer-${idx+1}`)
    if ( target ) {
        let all_viz = document.getElementsByClassName("files-editor-calc_db-outer-secondary-item-shown")
        if ( all_viz && all_viz.length ) {
            for ( let vz of all_viz ) {
                vz.className = "files-editor-calc_db-outer-secondary-item"
                vz.style.color = "red"
            }
        }
        target.className = "files-editor-calc_db-outer-secondary-item-shown"

        //
        let elements = document.getElementById("fields-editor-calc_db-outer")
        elements.innerHTML = ""
    }
    
}



function show_hide_3rd_form(ev,concern,key,idx) {
    //
    let file_div =  document.getElementById("form-editor-calc_db-outer-id-file_key-show")
    if ( file_div ) {
        let short_key = key.replace(calc_db_shorten_this_url, "[websites]")
        file_div.innerHTML = short_key
    }
    // 
    let this_el = ev.target
    if ( g_current_select_calc_db_page ) {
        g_current_select_calc_db_page.style.color = "black"
    }
    g_current_select_calc_db_page = this_el
    this_el.style.color = "darkred"
    //
    let object = g_all_concerns_db_map[concern][key]
    let keys = Object.keys(object)
    let kyd_display = ""
    for ( let ky of keys ) {
        if ( ky[0] === '_' ) continue
        kyd_display += `<button onclick="project_field_to_form(event,'${concern}','${key}','${ky}')">${ky}</button>`
    }
    //
    let menu_box = document.getElementById("fields-editor-calc_db-outer")
    if ( menu_box ) {
        menu_box.innerHTML = kyd_display
    }
    //
    return true
}


/**
 * 
 * @param {string} concern 
 * @param {string} file 
 * @param {string} field 
 */
function project_field_to_form(ev,concern,file,field) {
    try {

        let this_el = ev.target
        if ( g_current_select_calc_db_page_section ) {
            g_current_select_calc_db_page_section.style.color = "navy"
        }
        g_current_select_calc_db_page_section = this_el
        this_el.style.color = "darkred"

        //
        let concern_fld = document.getElementById("form-editor-calc_db-outer-id-concern")
        let file_fld =  document.getElementById("form-editor-calc_db-outer-id-file_key")
        let field_fld = document.getElementById("form-editor-calc_db-outer-id-field")
        if ( concern_fld ) { concern_fld.value = concern }
        if ( file_fld ) { file_fld.value = file }
        if ( field_fld ) { field_fld.value = field }
        //
        let concern_div = document.getElementById("form-editor-calc_db-outer-id-concern-show")
        let file_div =  document.getElementById("form-editor-calc_db-outer-id-file_key-show")
        let field_div = document.getElementById("form-editor-calc_db-outer-id-field-show")
        if ( concern_div ) { concern_div.innerHTML = concern }
        if ( file_div ) {
            let short_key = file.replace(calc_db_shorten_this_url, "[websites]")
            file_div.innerHTML = short_key
        }
        if ( field_div ) { field_div.innerHTML = field }
        //
        let object = g_all_concerns_db_map[concern][file][field]
        let form_id = "form-editor-calc_db-outer-id"
        map_object_to_form_values(form_id,object)
    } catch (e) {}
}



/**
 * 
 */
function update_entry() {
    //
    try {
        let concern = false;
        let file = false;
        let field = false;
        //
        let concern_fld = document.getElementById("form-editor-calc_db-outer-id-concern")
        let file_fld =  document.getElementById("form-editor-calc_db-outer-id-file_key")
        let field_fld = document.getElementById("form-editor-calc_db-outer-id-field")
        //
        if ( concern_fld ) { concern = concern_fld.value  }
        if ( file_fld ) { file = file_fld.value }
        if ( field_fld ) { field = field_fld.value }
        //
        if  (concern && file && field ) {
            let object = g_all_concerns_db_map[concern][file][field]
            let form_id = "form-editor-calc_db-outer-id"
            map_form_values_to_object(form_id,object)
        }
        //
    } catch (e) {
        console.log(e)
    }
    //
}




/**
 * 
 * @param {*} active_list_container 
 * @param {*} responsive_list_containers 
 */
async function get_concerns_map(active_list_container,responsive_list_containers) {
      let params = {
        "admin_pass" : "default",
        "host" : "localhost:8989"
    }

    let data = await window.post_plugin_cmd("calc_db","get_cal_db",[],params)

    // let result = test_data

    if ( data ) {
        //
        g_all_concerns_db_map = data
        //
        let top_level_keys = Object.keys(g_all_concerns_db_map)
        let obj = Object.assign({},g_all_concerns_db_map)
        let subs = flatten_level_to_list(top_level_keys,obj,2)
        //
        let primary_element = (entry,idx) => {
            return `
                <button class="button_calc_db"  onclick="show_and_hide_2nd_list(event,${idx},'${entry}')">${entry}</button>
            `
        }
        let secondary_element = (entry,entry2,idx2) => {
            let short_key = entry2.replace(calc_db_shorten_this_url, "[websites]")
            return `
                <button  class="button_url_calc_db"  onclick="show_hide_3rd_form(event,'${entry}','${entry2}',${idx2})">${short_key}</button><br>
            `
        }
        //
        keys_to_active_keys(top_level_keys,active_list_container,subs,responsive_list_containers,primary_element,secondary_element,'<br>')
    }
}


/**
 * 
 * @param {*} ev 
 */
async function save_cal_db(ev) {
    let params = {
        "admin_pass" : "default",
        "host" : "localhost:8989"
    }
    //
    let result = await window.post_plugin_cmd("calc_db","save_calc_db",[window.g_all_concerns_db_map],params)
    //
    if ( result ) {
        //
        console.log("GREAT")
        //
    } else {
        console.log("NOT SO GREAT")
    }
}



/**
 * 
 * @param {string} concerns -- element name for the first column
 * @param {string} concern_files -- element name for the second column
 */
async function populate_calc_db(concerns,concern_files) {
    let alc = document.getElementById(concerns)
    let all_viz = document.getElementsByClassName(concern_files)
    await get_concerns_map(alc,all_viz)
}



async function calc_db_update_view(event) {
    await window.fetch_instatiate_plugin("calc_db")
}
