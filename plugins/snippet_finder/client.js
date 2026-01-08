// 

window.g_all_concerns_substitutions_map = {}


/**
 * 
 * @param {number} idx 
 */
function show_and_hide_2nd_subst_list(idx) {
    let target = document.getElementById(`files-editor-all_substs-outer-${idx+1}`)
    if ( target ) {
        let all_viz = document.getElementsByClassName("files-editor-all_substs-outer-secondary-item-shown")
        if ( all_viz && all_viz.length ) {
            for ( let vz of all_viz ) {
                vz.className = "files-editor-all_substs-outer-secondary-item"
            }
        }
        target.className = "files-editor-all_substs-outer-secondary-item-shown"
    }
}


/**
 * 
 * @param {string} concern 
 * @param {string} key 
 * @param {number} idx 
 * @returns {boolean}
 */
function show_hide_3rd_subst_form(concern,key,idx) {
    //
    let object = g_all_concerns_substitutions_map[concern][key].substitutions
    let keys = Object.keys(object)
    let kyd_display = ""
    for ( let ky of keys ) {
        if ( ky[0] === '_' ) continue
        kyd_display += `<button onclick="project_field_to_subst_form('${concern}','${key}','${ky}')">${ky}</button>`
    }
    //
    let menu_box = document.getElementById("fields-editor-all_substs-outer")
    if ( menu_box ) {
        menu_box.innerHTML = kyd_display
    }
    //
    return true
}


window.substitution_edit_plugin_form_fields = [
    "form-editor-all_substs-outer-id-string",
    "form-editor-all_substs-outer-id-name",
    "form-editor-all_substs-outer-id-content",
    "form-editor-all_substs-outer-id-link",
    "form-editor-all_substs-outer-id-content-file",
    "form-editor-all_substs-outer-id-content-svg",
    "form-editor-all_substs-outer-id-output_height",
    "form-editor-all_substs-outer-id-output_width",
    "form-editor-all_substs-outer-id-button-name",
    "form-editor-all_substs-outer-id-button-file"
]
function substitutions_clear_form_values() {
    for ( let fld of substitution_edit_plugin_form_fields ) {
        let afld = document.getElementById(fld)
        if ( afld ) {
            afld.value = ""
        }
    }
}


/**
 * 
 * @param {string} concern 
 * @param {string} file 
 * @param {string} field 
 */
function project_field_to_subst_form(concern,file,field) {
    try {
        //
        let concern_fld = document.getElementById("form-editor-all_substs-outer-id-concern")
        let file_fld =  document.getElementById("form-editor-all_substs-outer-id-file_key")
        let field_fld = document.getElementById("form-editor-all_substs-outer-id-field")
        if ( concern_fld ) { concern_fld.value = concern }
        if ( file_fld ) { file_fld.value = file }
        if ( field_fld ) { field_fld.value = field }
        //
        let concern_div = document.getElementById("form-editor-all_substs-outer-id-concern-show")
        let file_div =  document.getElementById("form-editor-all_substs-outer-id-file_key-show")
        let field_div = document.getElementById("form-editor-all_substs-outer-id-field-show")
        if ( concern_div ) { concern_div.innerHTML = concern }
        if ( file_div ) { file_div.innerHTML = file }
        if ( field_div ) { field_div.innerHTML = field }
        //
        let object = g_all_concerns_substitutions_map[concern][file].substitutions[field]
        let form_id = "form-editor-all_substs-outer-id"
        //
        substitutions_clear_form_values()
        //
        if ( typeof object === "string" ) {
            let string_holder = document.getElementById("form-editor-all_substs-outer-id-string")
            string_holder.value = object.length ? object : "nothing"
        } else {
            map_object_to_form_values(form_id,object)
        }
        //
    } catch (e) {}
}


/**
 * 
 */
function update_subsitution() {
    //
    try {
        let concern = false;
        let file = false;
        let field = false;
        //
        let concern_fld = document.getElementById("form-editor-all_substs-outer-id-concern")
        let file_fld =  document.getElementById("form-editor-all_substs-outer-id-file_key")
        let field_fld = document.getElementById("form-editor-all_substs-outer-id-field")
        //
        if ( concern_fld ) { concern = concern_fld.value  }
        if ( file_fld ) { file = file_fld.value }
        if ( field_fld ) { field = field_fld.value }
        //
        if  (concern && file && field ) {
            let object = g_all_concerns_substitutions_map[concern][file].substitutions[field]
            let form_id = "form-editor-all_substs-outer-id"
            if ( typeof object === "string" ) {
                let string_holder = document.getElementById("form-editor-all_substs-outer-id-string")
                g_all_concerns_substitutions_map[concern][file].substitutions[field] = string_holder.value
            } else {
                map_form_values_to_object(`${form_id}-${field}`,object)
            }
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
async function get_concerns_substs_map(active_list_container,responsive_list_containers) {
      let params = {
        "admin_pass" : "default",
        "host" : "localhost:8989"
    }

    let data = await window.post_plugin_cmd("substitutions","get_subsitutions_map",[],params)

    // let result = test_data

    if ( data ) {
        //
        window.g_all_concerns_substitutions_map = data
console.log(data)
        //
        let top_level_keys = Object.keys(g_all_concerns_substitutions_map)
        let obj = Object.assign({},g_all_concerns_substitutions_map)
        let subs = flatten_level_to_list(top_level_keys,obj,2)
        //
        let primary_element = (entry,idx) => {
            return `
                <button onclick="show_and_hide_2nd_subst_list(${idx})">${entry}</button>
            `
        }
        let secondary_element = (entry,entry2,idx2) => {
            return `
                <button onclick="show_hide_3rd_subst_form('${entry}','${entry2}',${idx2})">${entry2}</button><br>
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
async function save_substitutions(ev) {
    let params = {
        "admin_pass" : "default",
        "host" : "localhost:8989"
    }
    //
    let result = await window.post_plugin_cmd("substitutions","save_subsitutions_map",[window.g_all_concerns_substitutions_map],params)
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
async function pre_substs_assignments(concerns,concern_files) {
    let alc = document.getElementById(concerns)
    let all_viz = document.getElementsByClassName(concern_files)
    await get_concerns_substs_map(alc,all_viz)
}
