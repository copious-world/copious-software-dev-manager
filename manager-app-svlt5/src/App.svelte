
<script>

import LoginBox from "./lib/LoginBox.svelte"
import URLBox from "./lib/URLBox.svelte"
import RepoListCtrl from "./lib/RepoListCtrl.svelte"
import PluginPanel from "./lib/PluginPanel.svelte";
import Kanban from "./lib/Kanban.svelte"
let g_admin_pass = $state("default");
let g_manual_url = $state("localhost");

let g_active_url  = $state("");
let g_active_addr = $state("");
let g_plugin_name = $state("")


let g_panel = $state("git-list");

let g_panel_selections = [
  "git-list",
  "dev-stats", 
  "dev-kb",
  "dev-snippets",
  "dev-edit",
  "dev-cmd-line",
  "dev-tests",
  "dev-plugins"
]

let g_panels = {
  "git-list" : "Git Repos (local)",
  "dev-stats" : "Statistic",
  "dev-kb" : "Kanban",
  "dev-snippets" : "Snippets",
  "dev-edit" : "Editor",
  "dev-cmd-line" : "command line",
  "dev-tests" : "Tests",
  "dev-plugins" : "plugins"
}

let g_panel_menu = {
  "git-list" : "repos",
  "dev-stats" : "statistics",
  "dev-kb" : "kanban",
  "dev-snippets" : "snippets",
  "dev-edit" : "editor",
  "dev-cmd-line" : "command line",
  "dev-tests" : "tests",
  "dev-plugins"  : "plugins"
}


let g_panels_displayed = {
  "git-list" : "block",
  "dev-stats" : "none",
  "dev-kb" : "none",
  "dev-snippets" : "none",
  "dev-edit" : "none",
  "dev-cmd-line" : "none",
  "dev-tests" : "none",
  "dev-plugins" : "none"
}

function update_panels(panel) {
  for ( let p in g_panels_displayed ) {
    if ( p === panel ) {
      g_panels_displayed[p] = "block"
    } else {
      g_panels_displayed[p] = "none"
    }
  }
}

</script>

<div class="inner_main">

  <div class="top-controls " >
    <div class="ui-controls-1 dropdown">
      <div class="admin-hover dropdown">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path class="heroicon-ui" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
        </svg>      
      </div>
      <div class="dropdown-content" >
        <div class="selected-panel">
          {g_panels[g_panel]}
        </div>
        <ol>
          {#each g_panel_selections as a_panel }
            <li >
              <button onclick={(ev) => { g_panel = a_panel; update_panels(a_panel) }} >{g_panel_menu[a_panel]}</button>
            </li>
          {/each}
        </ol>
      </div>
    </div>
    <div class="ui-controls-1 dropdown">
      <div class="admin-hover dropdown">Admin and Target</div>
      <div class="dropdown-content" >
          <LoginBox bind:admin_pass={g_admin_pass} />
          <URLBox bind:manual_url={g_manual_url} />
      </div>
    </div>
    <div>
    <span style="margin-bottom:4px;">Running admin from: {g_manual_url}</span>
    </div>
    
  </div>
  <div  style="text-align: top;width:100%;background-color:rgba(245, 227, 203, 0.4)">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <rect width="30" height="30" x="3" y="5" rx="2" ry="2" fill="rgba(250,235,215,0.4)" />
    </svg>
      {#each g_panel_selections as a_panel }
          <button class="subtle_button" onclick={(ev) => { g_panel = a_panel; update_panels(a_panel) }}>{g_panels[a_panel]}</button> 
      {/each}
  </div>



  <div style="max-height: calc(100vh - 200px);overflow-y:auto;"  >
    <div style="display:{g_panels_displayed['git-list']}" >

      <RepoListCtrl bind:active_url={g_active_url} bind:active_addr={g_active_addr}  _admin_pass={g_admin_pass} _manual_url={g_manual_url} />

    </div>
    <div style="display:{g_panels_displayed['dev-stats']}" >
      Statistics 
    </div>
    <div style="display:{g_panels_displayed['dev-kb']}" >
      <Kanban  bind:active_url={g_active_url} bind:active_addr={g_active_addr}  _admin_pass={g_admin_pass} _manual_url={g_manual_url} />
    </div>
    <div style="display:{g_panels_displayed['dev-snippets']}" >
      Snippets
    </div>
    <div style="display:{g_panels_displayed['dev-edit']}" >
      Editor
    </div>
    <div style="display:{g_panels_displayed['dev-cmd-line']}" >     
      <iframe class="terminal" title="terminal-frame" src="http://localhost:8080">

      </iframe>
    </div>
    <div style="display:{g_panels_displayed['dev-tests']}" >
      Tests 
    </div>
    <div style="display:{g_panels_displayed['dev-plugins']}" >
      <PluginPanel bind:active_plugin={g_plugin_name} _admin_pass={g_admin_pass} _manual_url={g_manual_url} />
    </div>

  </div>
</div>


<style>

  .inner_main {
    min-height:100%;
    max-height:100%;
    background-color:rgba(255, 255, 234, 0.17);
  }

  li {
    cursor: pointer;
    font-weight: bold;
  }

  li:hover {
    color: darkolivegreen;
    text-decoration: underline;
    background-color: antiquewhite;
    border-bottom: solid darkgreen 1px;
  }

  .dropdown {
    position: relative;
    display: inline-block;
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
  }

  .dropdown:hover .dropdown-content {
    display: block;
    width: fit-content;
    height: fit-content;
  }

  span {
    margin-left: 3px;
    margin-right: 3px;
    font-weight: bold;
    font-size: 0.88em;
  }

  .ui-controls-1 {
    width: fit-content;
    vertical-align: top;
    display: inline-block;
  }

  .top-controls {
    width:100%;
    height: 60px;
    text-align: left;
    vertical-align: text-tests;
    border-bottom: 1px solid darkslateblue;
  }

  .admin-hover {
    box-shadow: 2px 3px rgb(248, 230, 185);
    font-weight: bolder;
    box-shadow: gainsboro;
    text-decoration-line: underline;
    cursor: pointer;
  }

  .admin-hover:hover {
    cursor: pointer;
    background-color: rgba(176, 166, 143,0.2);;
    box-shadow: 3px 1px rgb(176, 166, 143);
    text-shadow: 1px 2px 0px #12100b;
    color: rgb(240, 208, 126);
  }


  .selected-panel {
    border-bottom: 1px solid rgb(5, 44, 5);
  }


  .terminal {
    width: 100%;
    height: calc(100vh - 180px)
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
  
</style>
