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
        <button>directory</button><br>
        <button>curate</button>
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
        <button>directory</button><br>
        <button>learn bundles</button><br>
        <button>prune to bundles</button><br>
        <button>skeletal bundles</button><br>
        <button>CSS</button>
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
        <button>directory</button><br>
        <button style="width:fit-content">skeleton choices (generate.json)</button><br>
        <button>edit named db</button>
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
        <button>directory</button><br>
        <button>ghosting</button>
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
        <button>directory</button><br>
        <button>colorize</button><br>
        <button>substitutions</button>
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
        <button>directory</button><br>
        <button>view</button><br>
        <button>release</button>
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


.title {
    width: 100%;
    font-weight: bold;
    padding: 2px;
    border-bottom: solid 1px rgb(53, 75, 202);
    background-color: rgb(255, 248, 209);
}

.light-button {
    padding: 4px;
    width: fit-content;
    height: fit-content;
    border-radius: 4%;
    font-size: 0.7em;
    font-weight: bold;
    color: rgb(58, 39, 39);
    background-color: transparent;
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