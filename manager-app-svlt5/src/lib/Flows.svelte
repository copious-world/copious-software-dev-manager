<script>

let { active_url = $bindable(""),  active_addr = $bindable(""), active_plugins = $bindable({}), ...props } = $props();


let g_current_flow_state = $state("")



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


function open_op_manager_window(species,the_directory) {
    window.show_operation_section(species,the_directory)
}


</script>

<div class="list-container">
    <div class="list-panel">
        <div>
        <span class="list-num">1.</span> <span class="list-title">Skeleton Collection:</span>
        </div>
        <div>
        <blockquote>
        <span class="direction">to:</span> [alpha-copious]/pre-pre-template<br>
        <span class="direction">from:</span> sources (hand and automation)
        </blockquote>
        <div class="controls">
        <button onclick={(e) => open_directory_manager_window("full-skeletons","[alpha-copious]/pre-pre-template") }>directory</button><br>
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
        <span class="direction">to:</span> [alpha-copious]/pre-template<br>
        <span class="direction">from:</span> [alpha-copious]/pre-pre-template
        </blockquote>
        <div class="controls">
        <button onclick={(e) => open_directory_manager_window("skeletons","[alpha-central]/pre-template,[alpha-central]/pre-skel-edit-directories") }>directory</button><br>
        <button onclick={(e) => open_op_manager_window("full-skeletons","learn-bundles")}>learn bundles</button><br>
        <button onclick={(e) => open_op_manager_window("full-skeletons","prune-to-bundles")}>prune to bundles</button><br>
        <button onclick={(e) => open_op_manager_window("full-skeletons","skeletal-bundles")}>skeletal bundles</button><br>
        <button onclick={(e) => open_op_manager_window("full-skeletons","CSS")}>CSS</button>
        </div>
        </div>
    </div>
    <div class="list-panel">
        <div>
        <span class="list-num">3.</span> <span class="list-title">prepare (roll-right):</span>
        </div>
        <div>
        <blockquote>
        <span class="direction">to:</span> [target]/@concern/templates<br>
        <span class="direction">from:</span> [alpha-copious]/pre-template
        </blockquote>
        <div class="controls">
        <button onclick={(e) => open_directory_manager_window("prepare"," [target]/@concern/templates") }>directory</button><br>
        <button class="standout-button" onclick={(e) => open_tracking_manager_window("prepare"," [target]/@concern/templates") } >tracking</button><br>
        <button class="wordy-button" onclick={(e) => open_op_manager_window("full-skeletons","skeleton-choices")}>skeleton choices (generate.json)</button><br>
        <button onclick={(e) => open_op_manager_window("prepare","run-prepare") }>run prepare</button><br>
        <button class="wordy-button" onclick={(e) => open_op_manager_window("prepare","fast-forward") }>fast forward to pre-staging</button><br>
        <button onclick={(e) => open_op_manager_window("prepare","edit-named-db") }>edit named db</button>
        </div>
        <ul>
            <li>[template-configs]/@concern/templates/name-drops.db</li>
            <li>[template-configs]/@concern/templates/index.db</li>
            <li>[template-configs]/parsed.json</li>
            <li>[template-configs]/ogroups_intermediate_files.json</li>
            <li>[template-configs]/concerns_to_files.json</li>
        </ul>
        </div>
    </div>
    <div class="list-panel">
        <div>
        <span class="list-num">4.</span> <span class="list-title">templates (roll-right):</span>
        </div>
        <div>
        <blockquote>
        <span class="direction">to:</span> [target]/@concern/templates<br>
        <span class="direction">from:</span> [alpha-copious]/pre-template
        </blockquote>
        <div class="controls">
        <button onclick={(e) => open_directory_manager_window("template"," [target]/@concern/templates") }>directory</button><br>
        <button class="standout-button" onclick={(e) => open_tracking_manager_window("template"," [target]/@concern/templates") } >tracking</button><br>  
        <button onclick={(e) => open_op_manager_window("template","run-templates") }>run templates</button><br>
        <button onclick={(e) => open_op_manager_window("template","ghosting") }>ghosting</button>
        </div>
        <ul>
            <li>[target]/@concern/templates/index.tmplt</li>
            <li>[target]/@concern/templates/index.subst</li>
        </ul>
        </div>
    </div>
    <div class="list-panel">
        <div>
        <span class="list-num">5.</span> <span class="list-title">pages (roll-right):</span>
        </div>
        <div>
        <blockquote>
        <span class="direction">to:</span> [target]/@concern/pre-staging<br>
        <span class="direction">from:</span> [target]/@concern/templates
        </blockquote>
        <div class="controls">
        <button onclick={(e) => open_directory_manager_window("pages","[target]/@concern/pre-staging") }>directory</button><br>
        <button class="standout-button" onclick={(e) => open_tracking_manager_window("pages"," [target]/@concern/pre-staging") } >tracking</button><br>  
        <button onclick={(e) => open_op_manager_window("pages","colorize") }>colorize (css)</button><br>
        <button onclick={(e) => open_op_manager_window("pages","substitutions") }>substitutions</button><br>
        <button onclick={(e) => open_op_manager_window("pages","substitutions") }>substitutions</button><br>
        <button onclick={(e) => open_op_manager_window("pages","bundle-updates") }>bundle updates</button><br>
        <button onclick={(e) => open_op_manager_window("pages","run-pages") }>run pages</button>
        </div>
        <ul>
            <li>[target]/@concern/pre-staging/index.html</li>
            <li>[target]/@concern/pre-staging/bundles/bundle"i".js (commented for testing)</li>
        </ul>
        </div>
    </div>
    <div class="list-panel">
        <div>
        <span class="list-num">6.</span> <span class="list-title">Compress and stage:</span>
        </div>
        <div>
        <blockquote>
        <span class="direction">to:</span> [target]/@concern/staging<br>
        <span class="direction">from:</span> [target]/@concern/pre-staging<br>
        </blockquote>
        <div class="controls">
        <button onclick={(e) => open_directory_manager_window("staging","[target]/@concern/staging") }>directory</button><br>
        <button class="standout-button" onclick={(e) => open_tracking_manager_window("staging"," [target]/@concern/staging") } >tracking</button><br>  
        <button onclick={(e) => open_op_manager_window("staging","view") }>view</button><br>
        <button onclick={(e) => open_op_manager_window("staging","release") }>release</button>
        </div>
        <ul>
            <li>[target]/@concern/staging/index.html</li>
            <li>[target]/@concern/staging/bundles/bundle"i".js (compressed for publish)</li>
        </ul>
        </div>
    </div>
</div>

<div id="file_ops" role="navigation" class="dropdown-content" onmouseover={show_this_display} onfocus={(e)=>{}} onmouseleave={hide_this_display}>
<span>{g_current_flow_state}</span>

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


</style>