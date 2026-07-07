<script>

let { active_url = $bindable(""),  active_addr = $bindable(""), active_plugins = $bindable({}), ...props } = $props();


let g_current_flow_state = $state("")

let g_alpha_owner = "copious"

let special_flow_states = {
    "full-skeletons" : {},
    "skeletons" : {},
    "prepare" : {
        "concern" : "@concern",
        "no_concern_selected" :  "@concern",
        "concern_forms" : {
            "to" :  "[target]/@concern/templates",
            "from" :  `[alpha-${g_alpha_owner}]/pre-template`,
            "namers" : "[websites]/@concern/templates/name-drop.json",
            "indexdb" : "[websites]/@concern/templates/index_calc.db",
            "parse" : "[template-configs]/parsed.json",
            "ogroups" : "[template-configs]/ogroups_intermediate_files.json",
            "cfiles" : "[template-configs]/concerns_to_files.json"
        }
    },
    "template" : {
        "concern" : "@concern",
        "no_concern_selected" :  "@concern",
        "concern_forms" : {
            "to" :  "[target]/@concern/templates",
            "from" :  `[alpha-${g_alpha_owner}]/pre-template`,
            "index_tmplt" : "[websites]/@concern/templates/index.tmplt",
            "index_subst" : "[websites]/@concern/pre-staging/index_html.subst"
        }
    },
    "pages" : {
        "concern" : "@concern",
        "no_concern_selected" :  "@concern",
        "concern_forms" : {
            "to" :  "[target]/@concern/pre-staging",
            "from" :  `[target]/@concern/templates`,
            "index_html" : "[websites]/@concern/pre-staging/index.html",
            "ith_bundle" : "[websites]/@concern/pre-staging/bundles/bundle'$i'.js"
        }
    },
    "staging" : {
        "concern" : "@concern",
        "no_concern_selected" :  "@concern",
        "concern_forms" : {
            "to" :  "[target]/@concern/staging",
            "from" :  `[target]/@concern/pre-staging`,
            "index_html" : "[websites]/@concern/staging/index.html",
            "ith_bundle" : "[websites]/@concern/staging/bundles/bundle'$i'.js"
        }
    }
}


let updated_special_flow_states = $state({})
updated_special_flow_states = structuredClone(special_flow_states)

// "full-skeletons"
// "skeletons"
// "prepare"
// "template"
// "pages"
// "staging"



let g_popover_timeout = null
function display_dir_ops(e,ky) {
    g_current_flow_state = ky
    let targ = e.target
    let rect = targ.getBoundingClientRect()
    let id="file_ops"
    let ops = document.getElementById(id)
    if ( ops ) {
        ops.style.top = `${rect.y - 50}px`
        ops.style.left = `${rect.right}px`
        ops.style.display = 'block'
    }
}

function show_this_display(e) {
    if ( g_popover_timeout ) {
        clearTimeout(g_popover_timeout)
        g_popover_timeout = null
    }
}

function hide_dir_ops(e,ky) {
    let id="file_ops"
    let ops = document.getElementById(id)
    if ( ops ) {
        g_popover_timeout = setTimeout(() => {
            g_current_flow_state = ""
            ops.style.display = 'none'
        },1000)
    }
}

function hide_this_display(e) {
    let ops = e.target
    if ( ops ) {
        ops.style.display = 'none'
    }
}

function select_focus(e) {}

let g_panel_file_ops = [
    "open",
    "restore",
    "close",
    "bring to front"
]


function restore_all_directories(e) {

}

function close_all_directories(e) {
    
}

function list_focused_operation(e,which_list,a_panel_op) {
    // g_current_flow_state

}


async function open_directory_manager_window(species,the_directory,concern) {
    //
    let params = {
        "admin_pass" : props._admin_pass,
        "host" : (props._manual_url.length ? props._manual_url : undefined),
        "species" : species,
        "dir" : the_directory,
        "concern" : concern ? concern : false 
    }
    //
    let dir_info = await window.fetch_flow_directory(params)
    window.show_directory_section(species,the_directory,dir_info)
}


async function open_tracking_manager_window(species,the_directory) {
    //
    let params = {
        "admin_pass" : props._admin_pass,
        "host" : (props._manual_url.length ? props._manual_url : undefined),
        "species" : species,
        "dir" : the_directory
    }
    //
    let tracking_info = await window.fetch_flow_tracking(params)
    window.show_tracking_section(species,the_directory,tracking_info)
}


function map_concerns_to_skeletons(tracking_info) {
    let concerns_to_seletons = {}
    let conf_file = Object.keys(tracking_info)[0]
    let ogroups = tracking_info[conf_file]?.outputs
    if ( ogroups ) {
        let n = ogroups.length
        for ( let i = 0; i < n; i++ ) {
            let ogroup = ogroups[i]
            let concerns = ogroup.targets?.concerns
            if ( concerns ) {
                for ( let concern of concerns ) {
                    let skeletons = (typeof ogroup.skeletons === "object") ? ogroup.skeletons : {}
                    concerns_to_seletons[concern] = { "index" : i, skeletons }
                }

            }
        }
    }
    return concerns_to_seletons
}


async function special_op_preparation(operation,params) {
    switch ( operation ) {
        case "skeleton-choices" : {
            let tracking_info = await window.fetch_flow_tracking(params)
            let concerns_to_seletons = map_concerns_to_skeletons(tracking_info)
            window.prepare_skeleton_choices(concerns_to_seletons)
            break
        }
        case "run-prepare" : {
            let tracking_info = await window.fetch_flow_tracking(params)
            let conf_file = Object.keys(tracking_info)[0]
            
            let confile_parts = conf_file.split('/')
            let sources = `${confile_parts[0]}/${confile_parts[1]}/`
            confile_parts.shift()
            confile_parts.shift()
            let generator = confile_parts.join('/')
            params.generator = generator
            params.sources = sources
            params.structure = "parsed.json"
            window.prepare_run_prepare(conf_file,params)
            break
        }

        case "run-templates" : {
            let tracking_info = await window.fetch_flow_tracking(params)
            let conf_file = Object.keys(tracking_info)[0]
            //
            let confile_parts = conf_file.split('/')
            let sources = `${confile_parts[0]}/${confile_parts[1]}/`
            confile_parts.shift()
            confile_parts.shift()
            let generator = confile_parts.join('/')
            params.generator = generator
            params.sources = sources
            params.structure = "parsed.json"
            //
            window.prepare_run_templates(conf_file,params)
            break
        }

        case "run-pages" : {
            let tracking_info = await window.fetch_flow_tracking(params)
            let conf_file = Object.keys(tracking_info)[0]
            //
            let confile_parts = conf_file.split('/')
            let sources = `${confile_parts[0]}/${confile_parts[1]}/`
            confile_parts.shift()
            confile_parts.shift()
            let generator = confile_parts.join('/')
            params.generator = generator
            params.sources = sources
            params.values = "assignments.json" 
            //
            window.prepare_run_pages(conf_file,params)
            break
        }

        case "edit-named-db" : {
            await window.fetch_instantiate_flow_plugin("calc_db",params,"flows")
            break;
        }
        case "substitutions" : {
            await window.fetch_instantiate_flow_plugin("substitutions",params,"flows")
            break;
        }
        case "release" : {
            await window.fetch_concerns_release_selector(params)
        }

    }
}


async function open_op_manager_window(species,operation) {
    //
    let params = {
        "admin_pass" : props._admin_pass,
        "host" : (props._manual_url.length ? props._manual_url : undefined),
        "species" : species,
        "operation" : operation
    }
    //
    await special_op_preparation(operation,params)
    //
    window.show_operation_section(params,species,operation)
}


let show_local_drop_down = $state(false)
let concerns_for_dropdown = $state([])
function drop_down_display(button_rect,tracked_concerns_map) {
    show_local_drop_down = !show_local_drop_down
    let drop_down = document.getElementById("concerns-menu")
    if ( show_local_drop_down && drop_down ) {
        for ( let tracked in tracked_concerns_map ) {
            let concerns_map = tracked_concerns_map[tracked]
            let concern_list = Object.keys(concerns_map)
            concerns_for_dropdown = concern_list
            if ( drop_down ) {
                setTimeout(() => {
                    drop_down.style.top = `${button_rect.top - 60}px`
                    drop_down.style.left = `${button_rect.left}px`
                },0)
            }
        }
    }
}


let focus_species = $state("prepare")
async function populate_concerns(target,species) {
    focus_species = species
    let params = {
        "admin_pass" : props._admin_pass,
        "host" : (props._manual_url.length ? props._manual_url : undefined),
        "species" : species
    }
    let concerns_map = await window.fetch_flow_tracking_concerns(params)
    drop_down_display(target.getBoundingClientRect(),concerns_map)
}

// "[target]/@concern/pre-staging"
async function open_concern_directory_manager_window(ev,species,directory_form) {
    await populate_concerns(ev.target,species)
}

async function fetch_concern(e,concern) {
    let species = focus_species
    show_local_drop_down = false

    let flow_state_info = special_flow_states[species]
    if ( flow_state_info ) {
        updated_special_flow_states[species].concern = (concern === "none") ? flow_state_info.no_concern_selected : concern
        concern = updated_special_flow_states[species].concern
        //
        let cform_map = flow_state_info.concern_forms
        if ( cform_map ) {
            for ( let cform in cform_map ) {
                let original_form = cform_map[cform]
                updated_special_flow_states[species].concern_forms[cform] = original_form.replaceAll(flow_state_info.no_concern_selected,concern)
            }
        }

//        let all_special_files = window.fetch_all_files_for_concern_and_species(species,concern)

    }
}

function get_special_file(species,filename) {
    if ( filename.indexOf("/@") >= 0 ) {
        alert("select a concern ")
        return
    }
    let params = {
        "admin_pass" : props._admin_pass,
        "host" : (props._manual_url.length ? props._manual_url : undefined),
        "species" : species
    }
    window.set_global_params(params)

    if ( (species === "template") && (filename.indexOf('.tmplt') > 0) ) {
        window.fetch_file_and_view_templates(null,filename)
    } else if ( (species === "pages") && (filename.indexOf('.html') > 0) ) {
        window.fetch_file_and_view_html_with_css(null,filename)
    } else if ( (species === "staging") && (filename.indexOf('.html') > 0) ) {
        window.fetch_file_and_view_html_with_css(null,filename)
    } else{
        window.fetch_file_and_view(null,filename)
    }
}

// "full-skeletons"
// "skeletons"
// "prepare"
// "template"
// "pages"
// "staging"


</script>

<div class="list-container">
    <div class="list-panel">
        <div>
        <span class="list-num">1.</span> <span class="list-title">Skeleton Collection:</span>
        </div>
        <div>
        <blockquote>
        <span class="direction">to:</span> [alpha-{g_alpha_owner}]/pre-pre-template<br>
        <span class="direction">from:</span> sources (hand and automation)
        </blockquote>
        <div class="controls">
        <button onclick={(e) => open_directory_manager_window("full-skeletons",`[alpha-${g_alpha_owner}]/pre-pre-template`) }>directory</button><br>
        <button onclick={(e) => open_op_manager_window("full-skeletons","curate")}>curate</button>
        </div>
        </div>
    </div>
    <div class="list-panel">
        <div>
        <span class="list-num">2.</span> <span class="list-title">Skeleton Reduction:</span>
        </div>
        <div>
        <blockquote>
        <span class="direction">to:</span> [alpha-{g_alpha_owner}]/pre-template<br>
        <span class="direction">from:</span> [alpha-{g_alpha_owner}]/pre-pre-template
        </blockquote>
        <div class="controls">
        <button onclick={(e) => open_directory_manager_window("skeletons",`[alpha-${g_alpha_owner}]/pre-template,[alpha-${g_alpha_owner}]/pre-skel-edit-directories`) }>directory</button><br>
        <button onclick={(e) => open_op_manager_window("skeletons","learn-bundles")}>learn bundles</button><br>
        <button onclick={(e) => open_op_manager_window("skeletons","prune-to-bundles")}>prune to bundles</button><br>
        <button onclick={(e) => open_op_manager_window("skeletons","skeletal-bundles")}>skeletal bundles</button><br>
        <button onclick={(e) => open_op_manager_window("skeletons","CSS")}>CSS</button>
        </div>
        </div>
    </div>
    <div class="list-panel">
        <div>
        <span class="list-num">3.</span> <span class="list-title">prepare (roll-right):</span>
        </div>
        <div>
        <blockquote>
        <span class="direction">to:</span> {updated_special_flow_states.prepare.concern_forms.to}<br>
        <span class="direction">from:</span> {updated_special_flow_states.prepare.concern_forms.from}
        </blockquote>
        <div class="controls">
        <button onclick={(e) => open_concern_directory_manager_window(e,"prepare",`${updated_special_flow_states.prepare.concern_forms.to}`) }>directory</button><br>
        <button class="standout-button" onclick={(e) => open_tracking_manager_window("prepare",`${updated_special_flow_states.prepare.concern_forms.to}`) } >tracking</button><br>
        <button class="wordy-button" onclick={(e) => open_op_manager_window("prepare","skeleton-choices")}>skeleton choices (generate.json)</button><br>
        <button onclick={(e) => open_op_manager_window("prepare","run-prepare") }>run prepare</button><br>
        <button onclick={(e) => open_op_manager_window("prepare","edit-named-db") }>edit named db</button><br>
        <button class="wordy-button" onclick={(e) => open_op_manager_window("prepare","fast-forward") }>fast forward to pre-staging</button>
        </div>
        <ul>
            <li onclick={(e) => {get_special_file("prepare",`${updated_special_flow_states.prepare.concern_forms.namers}`)}}>{updated_special_flow_states.prepare.concern_forms.namers}</li>
            <li onclick={(e) => {get_special_file("prepare",`${updated_special_flow_states.prepare.concern_forms.indexdb}`)}}>{updated_special_flow_states.prepare.concern_forms.indexdb}</li>
            <li onclick={(e) => {get_special_file("prepare",`${updated_special_flow_states.prepare.concern_forms.parse}`)}}>{updated_special_flow_states.prepare.concern_forms.parse}</li>
            <li onclick={(e) => {get_special_file("prepare",`${updated_special_flow_states.prepare.concern_forms.ogroups}`)}}>{updated_special_flow_states.prepare.concern_forms.ogroups}</li>
            <li onclick={(e) => {get_special_file("prepare",`${updated_special_flow_states.prepare.concern_forms.cfiles}`)}}>{updated_special_flow_states.prepare.concern_forms.cfiles}</li>
        </ul>
        </div>
    </div>
    <div class="list-panel">
        <div>
        <span class="list-num">4.</span> <span class="list-title">templates (roll-right):</span>
        </div>
        <div>
        <blockquote>
        <span class="direction">to:</span> {updated_special_flow_states.template.concern_forms.to}<br>
        <span class="direction">from:</span> {updated_special_flow_states.template.concern_forms.from}
        </blockquote>
        <div class="controls">
        <button onclick={(e) => open_concern_directory_manager_window(e,"template",`${updated_special_flow_states.template.concern_forms.to}`) }>directory</button><br>
        <button class="standout-button" onclick={(e) => open_tracking_manager_window("template",`${updated_special_flow_states.template.concern_forms.to}`) } >tracking</button><br>  
        <button onclick={(e) => open_op_manager_window("template","run-templates") }>run templates</button><br>
        <button onclick={(e) => open_op_manager_window("template","ghosting") }>ghosting</button>
        </div>
        <ul>
            <li onclick={(e) => {get_special_file("template",`${updated_special_flow_states.template.concern_forms.index_tmplt}`)}}>{updated_special_flow_states.template.concern_forms.index_tmplt}</li>
            <li onclick={(e) => {get_special_file("template",`${updated_special_flow_states.template.concern_forms.index_subst}`)}}>{updated_special_flow_states.template.concern_forms.index_subst}</li>
        </ul>
        </div>
    </div>
    <div class="list-panel">
        <div>
        <span class="list-num">5.</span> <span class="list-title">pages (roll-right):</span>
        </div>
        <div>
        <blockquote>        
        <span class="direction">to:</span> {updated_special_flow_states.pages.concern_forms.to}<br>
        <span class="direction">from:</span> {updated_special_flow_states.pages.concern_forms.from}
        </blockquote>
        <div class="controls">
        <button onclick={(e) => open_concern_directory_manager_window(e,"pages",`${updated_special_flow_states.pages.concern_forms.to}`) }>directory</button><br>
        <button class="standout-button" onclick={(e) => open_tracking_manager_window("pages",`${updated_special_flow_states.pages.concern_forms.to}`) } >tracking</button><br>  
        <button onclick={(e) => open_op_manager_window("pages","colorize") }>colorize (css)</button><br>
        <button onclick={(e) => open_op_manager_window("pages","substitutions") }>substitutions</button><br>
        <button onclick={(e) => open_op_manager_window("pages","bundle-updates") }>bundle updates</button><br>
        <button onclick={(e) => open_op_manager_window("pages","run-pages") }>run pages</button>
        </div>
        <ul>
            <li onclick={(e) => {get_special_file("pages",`${updated_special_flow_states.pages.concern_forms.index_html}`)}}>{updated_special_flow_states.pages.concern_forms.index_html}</li>
            <li onclick={(e) => {get_special_file("pages",`${updated_special_flow_states.pages.concern_forms.ith_bundle}`)}}>{updated_special_flow_states.pages.concern_forms.ith_bundle}</li>
        </ul>
        </div>
    </div>
    <div class="list-panel">
        <div>
        <span class="list-num">6.</span> <span class="list-title">Compress and stage:</span>
        </div>
        <div>
        <blockquote>
        <span class="direction">to:</span> {updated_special_flow_states.staging.concern_forms.to}<br>
        <span class="direction">from:</span> {updated_special_flow_states.staging.concern_forms.from}
        </blockquote>
        <div class="controls">
        <button onclick={(e) => open_concern_directory_manager_window(e,"staging",`${updated_special_flow_states.staging.concern_forms.to}`) }>directory</button><br>
        <button class="standout-button" onclick={(e) => open_tracking_manager_window("staging",`${updated_special_flow_states.staging.concern_forms.to}`) } >tracking</button><br>  
        <button onclick={(e) => open_op_manager_window("staging","view") }>view</button><br>
        <button onclick={(e) => open_op_manager_window("staging","release") }>release</button>
        </div>
        <ul>
            <li onclick={(e) => {get_special_file("staging",`${updated_special_flow_states.staging.concern_forms.index_html}`)}}>{updated_special_flow_states.staging.concern_forms.index_html}</li>
            <li onclick={(e) => {get_special_file("staging",`${updated_special_flow_states.staging.concern_forms.ith_bundle}`)}}>{updated_special_flow_states.staging.concern_forms.ith_bundle}</li>
        </ul>
        </div>
    </div>
</div>

<div id="file_ops" role="navigation" class="dropdown-content" onmouseover={show_this_display} onfocus={(e)=>{}} onmouseleave={hide_this_display}>
<span>{g_current_flow_state}</span>

</div>

<div id="concerns-menu" class="local-dropdown" style={ show_local_drop_down ? "display:block;" : "display:none;" } >
    <ul>
        {#each concerns_for_dropdown as concern }
        <li><button onclick={(e) => {fetch_concern(e,concern)}}>{concern}</button></li>
        {/each}
    </ul>
    <button onclick={(e) => {show_local_drop_down = false;fetch_concern(e,"none")}}>close</button>
</div>

<style>


:root {
	--cl_items_itembackground_wk_c0 : rgba(242, 242, 210, 0.3);
	--cl_items_itembackground_wk_c1 : white;
	--cl_items_itembackground_c0 : rgba(242, 242, 210, 0.3);
	--cl_items_itembackground_c1 : white;
	--cl_items_itembackground_wk : -webkit-linear-gradient(to right, var(--cl_items_itembackground_wk_c0), var(--cl_items_itembackground_wk_c1));
	--cl_items_itembackground : linear-gradient(to right, var(--cl_items_itembackground_c0), var(--cl_items_itembackground_c1) );
	--cl_items_itemcolor : #171e42;
}

.list-container {
	display: flex;
	flex-wrap: wrap;
	margin-left: 0px;
	margin-top: 0px;
    width: 100%;
    min-height:inherit;
}

.list-container .list-panel {
	flex: 1 0 10%;
	box-sizing: border-box;
	background: var(--cl_items_itembackground_wk);
	background: var(--cl_items_itembackground);
	color: var(--cl_items_itemcolor);
	padding: 10px;
}
.list-panel {
	margin-left: 2px;
	margin-top: 0px;
    border: solid 1px green;
    border-right: none;
    min-height: calc(70dvh - var(--el_nav_height) - var(--el_footer-height) - var(--header_padding));
    max-height: calc(90dvh - var(--el_nav_height) - var(--el_footer-height) - var(--header_padding));
    font-size: smaller;
    font-weight: bold;
}

.list-panel blockquote {
    border : 1px solid navy;
    font-size: 0.89em;
}

.list-panel  .controls {
    margin-top:2px;
    border: 1px solid blue;
    background-color: rgba(240, 236, 233, 0.29);
}

.list-num {
    font-weight: 800;
    font-size:1.02em;
    color: rgb(0, 0, 0);
}

.list-title {
    color: rgb(20, 66, 20);
}

.direction {
    color : rgb(41, 92, 41);
}

ul {
    padding-left: 5%;
    font-size: 0.89em;
    margin-top:3px;
}
li:hover {
    border: 1px solid black;
    cursor:pointer;
}
li {
    border: 1px solid transparent;
}


.wordy-button {
    width:fit-content;
    padding-left: 3px;
    padding-right: 3px;
}

.standout-button {
    color: rgb(173, 65, 14);
    background-color: rgba(255, 233, 199, 0.637);
}

.dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 200px;
    height:max-content;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    padding: 12px 16px;
    z-index: 1;
    border-left: solid 1px rgb(14, 1, 1);
    border-top: solid 1px rgb(62, 112, 62);
    cursor: pointer;
}


.local-dropdown {
    position: absolute;
    background-color: rgb(255, 255, 253);
    border: solid 1px rgb(56, 36, 56);
    box-shadow: 2px 2px rgba(128, 128, 128, 0.384);
    width:250px;
    padding-left:4px;
}

.local-dropdown li > button, .special-file-click {
    padding-left: 2px;
    padding-right: 2px;
    width:fit-content;
    column-wrap: nowrap;
    border: 1px solid transparent;
}

</style>