<script>

let { active_plugins = $bindable({}), ...props } = $props();


let g_plugin = $derived.by(() => {
    return active_plugins["snippets"].current
});

let g_plugin_selections = $derived.by(() => {
    let the_keys = [].concat(active_plugins["snippets"].keys)
    the_keys.unshift("feedback")
    return the_keys
});


let gl_plugin = $state("feedback")

let g_function_map = $state({
    "f1" : {},
    "f2" : {}
})


let function_list = $state([]);
let function_list_altered = $state([]);
let function_list_altered_multi_source = $state([]);
let function_list_substitutions = $state([]);
let function_list_sens_alterations = $state([]);
let function_list_sens_alpha = $state([]);

let g_all_alphas = $state([]);

function build_alpha_source_list(func_map) {
    let avoid1 = "_x_finals_only"
    let avoid2 = "create-alpha-entry"
    //
    let alpha_set = {}
    for ( let [ky,func_files] of Object.entries(func_map) ) {
        let sources = Object.keys(func_files)
        sources = sources.filter((fl) => {
            return fl !== avoid1 && fl !== avoid2
        })
        for ( let fl of sources ) {
            alpha_set[fl] = 1
        }
    }
    //
    g_all_alphas = Object.keys(alpha_set)
}

/**
 * 
 * @param event
 */
async function get_snippet_table(event,reload) {
  //
  if ( props._admin_pass.length === 0 ) {
    alert("no admin pass")
    return
  }
  //await
  let params = {
    "admin_pass" : props._admin_pass,
    "host" : (props._manual_url.length ? props._manual_url : undefined)
  }
  //
  try {
    let result = reload ? await window.reload_snippet_tables(params) : await window.fetch_snippet_table(params)

    if ( !result ) {
        alert("Error")
        return
    }

    // update
    g_function_map = result

    function_list = Object.keys(result)

    function_list.sort((a,b) => {
        let len_a = -1
        let len_b = -1

        let data_a = g_function_map[a]
        for ( let ky in data_a ) {
            let patch_group = data_a[ky]._x_patches
            if ( typeof patch_group === "object") {
                len_a += Object.keys(patch_group).length
            }
        }

        let data_b = g_function_map[b]
        for ( let ky in data_b ) {
            let patch_group = data_b[ky]._x_patches
            if ( typeof patch_group === "object") {
                len_b += Object.keys(patch_group).length
            }
        }

        return (len_b - len_a)
    })

    function_list_altered = function_list.filter((el) => {

        let total_patches = 0
        let data = g_function_map[el]
        for ( let ky in data ) {
            let patch_group = data[ky]._x_patches
            if ( typeof patch_group === "object") {
                total_patches += Object.keys(patch_group).length
            }
        }
        return total_patches !== 0

    })

    function_list_sens_alterations = function_list.filter((el) => {

        let total_patches = 0
        let data = g_function_map[el]
        if ( Object.keys(data).length > 0 ) {
            for ( let ky in data ) {
                let patch_group = data[ky]._x_patches
                if ( typeof patch_group === "object") {
                    total_patches += Object.keys(patch_group).length
                }
            }
        }
        return total_patches === 0
    })

    function_list_sens_alpha = function_list_sens_alterations.filter((el) => {
        let data = g_function_map[el]
        let keys = Object.keys(data)
        keys = keys.filter((ky) => { return (ky !== "_x_finals_only") && (ky !== "create-alpha-entry") })
        return (keys.length === 0)
    })

    function_list_sens_alterations = function_list_sens_alterations.filter((el) => {
        let data = g_function_map[el]
        let keys = Object.keys(data)
        keys = keys.filter((ky) => { return (ky !== "_x_finals_only") && (ky !== "create-alpha-entry") })
        return (keys.length !== 0)
    })


    function_list_substitutions = function_list_altered.filter((el) => {
        let data = g_function_map[el]

        let funcs = Object.keys(data)
        funcs = funcs.filter((func) => {
            return "_x_finals_only" !== func
        })
        let contains_subst_from = false
        for ( let func of funcs) {
            let fdata = data[func]
            let original_code = fdata._x_origin
            if ( typeof original_code === "string" ) {
                if ( original_code.indexOf("{{") >= 0  ) {
                    contains_subst_from = true
                }
            }
        }

        return contains_subst_from
    })


    function_list_altered = function_list_altered.filter((el) => {
        return function_list_substitutions.indexOf(el) < 0
    })


    function_list_altered_multi_source = function_list_altered.filter((el) => {
        let data = g_function_map[el]
        //
        let dkeys = Object.keys(data).filter((el) => {
            if ( el === "_x_finals_only" ) {
                return false
            }
            return true
        })
        //
        if ( dkeys.length > 1 ) {
            return true
        }
        return false
    })


    function_list_altered = function_list_altered.filter((el) => {
        return function_list_altered_multi_source.indexOf(el) < 0
    })

    build_alpha_source_list(result)

  } catch (e) {
    alert(e.message)
  }
}

/**
 * 
 * @param event
 */
async function update_alpha(event) {
    await get_snippet_table(event,true)
}


/**
 * 
 * @param abs_file_path
 */
async function open_in_editor(abs_file_path) {
  if ( props._admin_pass.length === 0 ) {
    alert("no admin pass")
    return
  }
  //await
  let params = {
    "admin_pass" : props._admin_pass,
    "host" : (props._manual_url.length ? props._manual_url : undefined)
  }
  try {
    await window.open_file_path_in_default_editor(params,abs_file_path)
  } catch (e) {
    alert(e.message)
  }
}



let patches_on_display = $state({
    "NONE" : "no patches"
})
let g_current_function_details = $state("")

let patches_on_display_keys = $state([])
let files_defining_func = $state([])

let patch_current_file = $state("")
let g_current_alpha_file = $state("")


let g_show_patches = $state(true)

let g_end_point_files = $state([])
let end_point_files_on_display = $state({})
let g_show_agreements = $state(false)
//
let g_function_preferences = $state({
     "updated": false,
     "choice" : "",
     "date": 0
})




let g_has_code_choice = $state(false)
let g_current_patch_choices = $state([])

/**
 * 
 * @param a_function
 */
function show_function_details(a_function) {
    //
    let show_agreements = false
    g_show_agreements = false
    g_has_code_choice = false
    g_end_point_files = []
    g_current_function_details = a_function
    let fdata = g_function_map[a_function]
    //
    files_defining_func = Object.keys(fdata)
    files_defining_func = files_defining_func.filter((el) => { return el !== "_x_finals_only" } )
    if ( files_defining_func.length > 0 ) {
        g_show_patches = false;
        patch_current_file = files_defining_func[0]

        let data = fdata[patch_current_file]

        let patches = data._x_patches
        if ( patches ) {
            g_show_patches = true;
            patches_on_display = patches
            patches_on_display_keys = Object.keys(patches_on_display)
            if ( patches_on_display_keys.length === 0 ) {
                show_agreements = true
                g_show_patches = false;
            } else {
                setTimeout(() => {
                    let patch_file_list = ["_x_origin"]
                    g_has_code_choice = true;
                    for ( let patch in patches ) {
                        patch_file_list.push(render_patch_example_file(patch,a_function))
                    }
                    g_current_patch_choices = patch_file_list
                },2)
            }
        } else {
            g_show_patches = false;
            patches_on_display = {
                "NONE" : "no patches"
            }
        }

        if ( data !== undefined ) {
            let original_code = data._x_origin
            window.display_alpha_function(g_current_function_details,original_code)
        }

        next_implementation_instance(patch_current_file)
    } else {
        g_show_patches = false;
        patches_on_display_keys = []
    }
    //
    if ( (g_show_patches === false) || show_agreements ) {
        //
        if ( show_agreements ) { g_show_agreements = true }
        let finals_only = fdata._x_finals_only
        g_end_point_files = Object.keys(finals_only)
        end_point_files_on_display = finals_only
        //
        if ( g_end_point_files.length > 0 ) {
            let code = finals_only[g_end_point_files[0]]
            window.display_altered_function(a_function,code)
        }
    }
    //
}


/**
 * 
 * @param file_name
 */
function next_implementation_instance(file_name) {

    let fdata = g_function_map[g_current_function_details]
    //
    let data = fdata[file_name]
    if ( data._x_preference ) {
        g_function_preferences = data._x_preference
    }
    //

    g_current_alpha_file = file_name
    
    let patches = data._x_patches
    if ( patches ) {
        patches_on_display = patches
        patches_on_display_keys = Object.keys(patches_on_display)
        if ( patches_on_display_keys.length ) {
            let pk = patches_on_display_keys[0]
            let code = patches[pk].stage_code
            window.display_altered_function(g_current_function_details,code)
        }
    } else {
        patches_on_display = {
            "NONE" : "no patches"
        }
    }

    if ( data !== undefined ) {
        let original_code = data._x_origin
        window.display_alpha_function(g_current_function_details,original_code)
    }
}




function current_alpha_containing_funcdef() {
    return `[alpha-copious]/${g_current_alpha_file}`
}


/**
 * 
 */
function get_alpha() {
    let fun_name = g_current_function_details
    //
    let fdata = g_function_map[fun_name]
    if ( fdata !== undefined ) {
        let data = fdata[patch_current_file]
        if ( data ) {
            let original_code = data._x_origin
            window.show_code_section(fun_name,original_code)
        }
    }
    //
}


/**
 * 
 * @param the_code
 */
function get_altered(the_code) {
    window.show_alt_code_section(g_current_function_details,the_code)
}


/**
 * 
 * @param patch
 */
function render_patch_example_file(patch,a_func) {
    //
    let func_name = a_func ? a_func : g_current_function_details
    //
    let fdata = g_function_map[func_name]
    //
    let data = fdata[g_current_alpha_file]
    for ( let ky in data ) {
        if ( ky[0] !== '_' ) {
            let code_descr = data[ky]
            if ( code_descr.patch_key == patch ) {
                return ky
            }
        }
    }
    //
    return ""
}


let showing_alpha_assignment = $state(false)
let pick_new_alpha = $state(false)

let alpha_selected = $state("new")
/**
 * 
 * @param ev
 */
function setup_alpha_selection(ev) {
    ev.stopPropagation()
    //
    //

    showing_alpha_assignment = true
    pick_new_alpha = true

}

function alpha_selection_action(ev) {
    showing_alpha_assignment = false
}

function onAlphaSelChange(ev) {
    alpha_selected = ev.currentTarget.value;
}




get_snippet_table()



</script>

<div>
<div id="app-snippet-header"  style="vertical-align: top;width:100%;background-color:rgba(253, 246, 151, 0.4)">
    <div style="display:inline-block;min-width:220px;overflow-x:hidden">
        <span class="function-title select_OK"  >{g_current_function_details}</span>
    </div>
    <div class="function-title" style="display:inline;width:fit-content;vertical-align: top;">
    <button class="subtle_button" onclick={get_alpha}>show alphas</button>
    <button class="subtle_button" onclick={(ev) => { open_in_editor(current_alpha_containing_funcdef()) }}>open in editor</button>
    <button class="subtle_button" onclick={update_alpha}>update alphas</button>
    </div>
    <div class="function-title" style="display:inline;width:fit-content;vertical-align: top;">
        Plugins:
        {#each g_plugin_selections as a_plugin }
            <button class="subtle_button" onclick={(ev) => { gl_plugin = a_plugin; }}>{a_plugin}</button> 
        {/each}
    </div>
</div>

{#each g_plugin_selections as a_plugin }
    {#if a_plugin === "feedback" }
        <div id="snippet-feedback" class="feedback-controls" style="{ gl_plugin === "feedback" ? `display:block`  : `display:none` }">
            <div class="function-list" >
                <ul>
                {#each function_list_altered as a_function } 
                    <li onclick={(ev) => { show_function_details(a_function) }} style={g_current_function_details === a_function ? "background-color:rgba(132, 226, 145, 1);" : ""} >{a_function}</li>
                {/each}
                </ul>

                 <ul class="multisourced">
                {#each function_list_altered_multi_source as a_function } 
                    <li onclick={(ev) => { show_function_details(a_function) }} style={g_current_function_details === a_function ? "background-color:rgba(132, 226, 145, 1);" : ""} >{a_function}</li>
                {/each}
                </ul>
               
                <ul class="has_substitutions">
                {#each function_list_substitutions as a_function } 
                    <li onclick={(ev) => { show_function_details(a_function) }} style={g_current_function_details === a_function ? "background-color:rgba(132, 226, 145, 1);" : ""}>{a_function}</li>
                {/each}
                </ul>


                <ul class="unaltered">
                {#each function_list_sens_alterations as a_function } 
                    <li onclick={(ev) => { show_function_details(a_function) }} style={g_current_function_details === a_function ? "background-color:rgba(132, 226, 145, 1);" : ""}>{a_function}</li>
                {/each}
                </ul>

                <ul class="unknown">
                {#each function_list_sens_alpha as a_function } 
                    <li onclick={(ev) => { show_function_details(a_function) }} style={g_current_function_details === a_function ? "background-color:rgba(132, 226, 145, 1);" : ""}>{a_function}</li>
                {/each}
                </ul>
            </div>
            <div class="func-ops" >
                {#if g_show_patches || g_show_agreements }
                    <div>
                    {#each files_defining_func as fname }
                        <button style={fname === g_current_alpha_file ? "background-color:lightgreen;" : "background-color:rgba(135, 141, 146, 0.521);"} onclick={(ev) => { next_implementation_instance(fname) }}>{fname}</button>
                    {/each}
                    </div>
                    {#if g_show_patches }
                        <div id="patcher">
                            {#each patches_on_display_keys as patch }
                                <span style="font-weight:bold">Example:&nbsp;</span>
                                <span class="select_OK">{render_patch_example_file(patch)}</span>
                                <button class="subtle_button" onclick={(ev) => { open_in_editor(render_patch_example_file(patch)) }}>open in editor</button>
                                <div id="patcher-{patch}" onclick={(ev) => { get_altered(patches_on_display[patch].stage_code) }}>
                                    {@html patches_on_display[patch].patch_display}
                                </div>
                            {/each}
                        </div>
                    {:else if g_show_agreements }
                        <span style="font-weight:bold">Endpoint Files :: Matching Function Definitions Same as Alpha</span>
                        {#each g_end_point_files as file }
                            <div  style="border-bottom: solid 1px darkgreen">
                                <div style="display:inline-block;cursor:pointer;" onclick={(ev) => { get_altered(end_point_files_on_display[file]) }}>
                                    <span style="font-weight:bold">Example:&nbsp;</span>
                                    <span class="select_OK">{file}</span>
                                </div>
                                <div style="display:inline-block" >
                                <button class="subtle_button" onclick={(ev) => { open_in_editor(file) }}>open in editor</button>
                                </div>
                            </div>
                        {/each}
                    {/if}
                {:else}
                    <div>
                        <button onclick={setup_alpha_selection} >Add to Alpha File</button>
                        <span style="font-weight:bold">Endpoint Files Defining Function Missing From Alpha</span>
                        {#each g_end_point_files as file }
                            <div  style="border-bottom: solid 1px darkgreen">
                                <div style="display:inline-block;cursor:pointer;" onclick={(ev) => { get_altered(end_point_files_on_display[file]) }}>
                                    <span style="font-weight:bold">Example:&nbsp;</span>
                                    <span class="select_OK">{file}</span>
                                </div>
                                <div style="display:inline-block" >
                                <button class="subtle_button" onclick={(ev) => { open_in_editor(file) }}>open in editor</button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
            <div class="prefs_select">
                <span class="prefs_label" >updated:&nbsp;</span>{g_function_preferences.updated}<br>
                {#if g_has_code_choice }
                <span class="prefs_label" >choice:&nbsp;</span>
                <select>
                    {#each  g_current_patch_choices as poption }
                        <option>{poption}</option>
                    {/each}
                </select>
                <br>
                {:else}
                <span class="prefs_label" >choice:&nbsp;</span>{g_function_preferences.choice}<br>
                {/if}
                <span class="prefs_label" >date:&nbsp;</span>{g_function_preferences.date}
                {#if showing_alpha_assignment }
                <div>
                    <label>Add New Alpha: <input checked={alpha_selected === "new"} onchange={onAlphaSelChange}  type="radio" name="alpha-choice" value="new" /></label>
                    <br>
                    <label>Add To Existing Alpha: <input checked={alpha_selected === "old"} onchange={onAlphaSelChange} type="radio" name="alpha-choice" value="old"  /></label>
                    {#if alpha_selected === "old" }
                        <div>
                            <select>
                                {#each g_all_alphas as alpha }
                                    <option>{alpha}</option>
                                {/each}
                            </select>
                        </div>
                        {/if}
                    <div>
                        <button onclick={alpha_selection_action} >close</button>
                    </div>
                </div>
                {/if}
            </div>
        </div>
    {:else}  <!-- When plugins are used... the above display will be shutdown for the duration of use of the plugin-->
        <div id="snippet-{a_plugin}" style="{ gl_plugin === a_plugin ? `display:block`  : `display:none` }">
            WILL INSERT HTML HERE  {a_plugin}
        </div> 
    {/if}
{/each}
</div>

<style>

    ul {
        background-color: rgb(255, 255, 247);
    }

    .multisourced {
        background-color: rgba(243, 220, 250, 1);
    }

    .has_substitutions {
        background-color: rgba(215, 250, 187, 1);
    }
    .unaltered {
        background-color: rgba(247, 219, 160, 1);
    }

    .unknown {
        background-color: rgba(232, 244, 248, 1);
    }

    li {
        cursor: pointer;
    }
    li:hover {
        background-color: rgba(233, 255, 181, 1);
    }

    #patcher {
        background-color: white;
    }
    
    #patcher > div {
        border: solid 1px purple;
        margin-bottom: 2px;
    }

    .subtle_button {
        font-size: 0.82em;
        font-weight: bold;
        border: none;
        background-color: transparent;
        border-left: rgba(135, 141, 146, 0.521) 1px solid;
        border-bottom: rgba(126, 136, 145, 0.79) 1px solid;
    }

    .subtle_button:hover {
        background-color: rgba(173, 181, 187, 0.52) 1px solid;
        border-left: rgba(97, 118, 134, 1) 1px solid;
        border-bottom: rgba(64, 76, 87, 1) 1px solid;

    }

    .function-title {
        background-color: rgb(255, 254, 247);
        font-weight: bold;
        font-size: 0.82em;
        padding: 4px;
        margin-top: 4px;
        border-bottom: 1px solid darkgreen;
    }


    button {
        padding: 4px;
        width: fit-content;
        height: fit-content;
        border-radius: 4%;
    }

    .function-list {
        display: inline-block;
        vertical-align: top;
        width: 25%;
        margin: 0px;
        background-color: rgb(220, 253, 220);
        border: 1px solid navy;
        bottom: 0;
        max-height: 499px;
        overflow: auto;
    }

    .func-ops {
        display: inline-block;
        vertical-align: top;
        width: 50%;
        height:99%;
        min-height:99%;
        border: 1px solid rgb(34, 9, 34);
        padding: 2px;
        bottom: 0;
        max-height: 499px;
        overflow: auto;
    }

    .prefs_select {
        display: inline-block;
        vertical-align: top;
        width: 23%;
        height:499px;
        min-height:499px;
        border: 1px solid rgb(34, 9, 34);
        padding: 2px;
        bottom: 0;
        max-height: 499px;
        overflow: auto;

    }

    .feedback-controls {
        width:100%;
        height:90%;
        min-height:100%;
        max-height: 600px;
        vertical-align: top;
        border: 1px solid darkgreen;
    }

    .prefs_label {
        font-weight: bold;
    }

</style>
