<script>

let { active_url = $bindable(""),  active_addr = $bindable(""), ...props } = $props();

import { g_open_directories, od_keys  } from './tracked_desktop_views.svelte.js'



let g_open_editors = $state({})
let oe_keys = Object.keys(g_open_editors)
let n_oe_keys = oe_keys.length


let g_open_terminals = $state({})
let ot_keys = Object.keys(g_open_terminals)
let n_ot_keys = ot_keys.length

let g_current_dir = $state("")



let g_popover_timeout = null
function display_dir_ops(e,ky) {
    g_current_dir = ky
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
            g_current_dir = ""
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
    "close"
]


</script>

<div class="list-container">
    <div class="list-panel">
        <div class="title">
            <span class="title">directories opened</span>
            <button class="light-button">restore all</button>
            <button class="light-button">close all</button>
        </div>
        <div>
        {#if od_keys.length > 0 }
            <ul>
                {#each od_keys.keys as ky}
                <li>
                    <button class="light-button" onmouseleave={(e) => {hide_dir_ops(e,ky)}} onmouseover={(e) => {display_dir_ops(e,ky)}} onfocus={select_focus}>{ky}</button> :: {g_open_directories.dirs[ky]}
                </li>
                {/each}
            </ul>
        {:else}
            <span class="title">NO directories opened</span>
        {/if}
        </div>
    </div>
    <div class="list-panel">
        <div class="title">
            <span class="title">editors opened</span>
            <button class="light-button">restore all</button>
            <button class="light-button">close all</button>
        </div>
        <div>
        {#if n_oe_keys > 0 }
            <ul>
                {#each oe_keys as ky}
                <li>
                    <button class="light-button">{ky}</button> :: {g_open_editors[ky]}
                </li>
                {/each}
            </ul>
        {:else}
            <span class="title">NO editors opened</span>
        {/if}
        </div>
    </div>
    <div class="list-panel">
        <div class="title">
            <span class="title">terminals opened</span>
            <button class="light-button">restore all</button>
            <button class="light-button">close all</button>
        </div>
        <div>
        {#if n_ot_keys > 0 }
            <ul>
                {#each ot_keys as ky}
                <li>
                    <button class="light-button">{ky}</button> :: {g_open_terminals[ky]}
                </li>
                {/each}
            </ul>
        {:else}
            <span class="title">NO terminals opened</span>
        {/if}
        </div>
    </div>
</div>

<div id="file_ops" role="navigation" class="dropdown-content" onmouseover={show_this_display} onfocus={(e)=>{}} onmouseleave={hide_this_display}>
<span>{g_current_dir}</span>
<ul>
    {#each g_panel_file_ops as a_panel }
    <li >
        <button >{a_panel}</button>
    </li>
    {/each}
</ul>
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
	flex: 1 0 300px;
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
}


ul {
    padding-left: 5%;
    font-size: 0.89rem;
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