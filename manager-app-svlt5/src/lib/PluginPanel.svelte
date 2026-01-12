<script>

let { active_plugins = $bindable({}), ...props } = $props();



let plugin_list = $state([]);
let plugin_map = $state({})

plugin_map = active_plugins


let current_plugin = $state("none")
let current_plugin_cat = $state("overview")

let kinds_of_plugins = Object.keys(active_plugins)


async function get_plugin_list(event) {
  //
  if ( props._admin_pass.length === 0 ) {
    alert("no admin pass")
    return
  }
  //
  let params = {
    "admin_pass" : props._admin_pass,
    "host" : (props._manual_url.length ? props._manual_url : undefined)
  }
  //
  try {
    let result = await window.fetch_plugin_list(params)

    if ( !result ) alert("Error")

    let plugin_db = result

    plugin_list = Object.keys(plugin_db)

    plugin_map["editor"].keys = []
    plugin_map["tests"].keys = []
    plugin_map["snippets"].keys = []
    plugin_map["kanban"].keys = []

    for ( let plg of plugin_list ) {
      let plugin_descr = plugin_db[plg]
      plugin_map[plugin_descr.used_by].keys.push(plg)
      if ( plugin_descr.quick_load ) {
        plugin_map[plugin_descr.used_by].plugins[plg] = plugin_descr.html
        let html_to_set =  plugin_descr.html
        setTimeout(() => {
          let target_el = document.getElementById(`${plugin_descr.used_by}-${plg}`)
          if ( target_el ) {
            target_el.innerHTML = html_to_set
            load_plugin_data(null,plg)
          }
        },2)
      } else {
        plugin_map[plugin_descr.used_by].plugins[plg] = `
          <div id=${plugin_descr.element} >
            use the plugin-panel to load operational scripts<br>
            for ${plugin_descr.used_by}/${plg}
          </div>
        `
      }
    }
  
    plugin_list.unshift("overview")

    current_plugin = "overview"
    plugin_map["overview"] = "this is the overview"

    active_plugins = plugin_map
 
    //console.log(host_list)

  } catch (e) {
    alert(e.message)
  }
}

async function select_plugin(event,plugin_cat,n) {
  current_plugin_cat = plugin_cat
  // current_plugin = plugin
  // plugin_map["editor"].plugins.current = current_plugin
  active_plugins = plugin_map
}


async function load_plugin_data(ev,plugin) {
  if ( props._admin_pass.length === 0 ) {
    alert("no admin pass")
    return
  }
  //
  let params = {
    "admin_pass" : props._admin_pass,
    "host" : (props._manual_url.length ? props._manual_url : undefined)
  }
  //
  try {
    await window.fetch_instatiate_plugin(plugin,params)

  } catch (e) {
  }
}




get_plugin_list()

// ---- ---- ---- ---- ---- ---- ---- ----
//

</script>

<div class="nice_message">
  <button onclick={get_plugin_list}>update plugins</button>
  <div class="inner_div">
    <span>Plugins:</span>
    {#each kinds_of_plugins as plugin_cat, n }
        <button onclick={(event) => select_plugin(event,plugin_cat,n)}>{plugin_cat}</button>
    {/each}
  </div>
  <div>
    <div>
      {current_plugin_cat}
    </div>
    {#if current_plugin_cat === "overview" }
      <div class="outer_div">
        This is our overview for users
      </div>
    {:else}
      <div class="outer_div">
        <ul>
          {#each plugin_map[current_plugin_cat].keys as special_plugin}
            <li>
              {special_plugin}
              <button style="width:fit-content" onclick={(ev) => { load_plugin_data(ev,special_plugin) }}>load {special_plugin}</button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</div>

<style>

	.inner_div {
    display:inline-block;
		padding-left: 2px;
		border-bottom: 1px lightgray solid;
		min-height: 40px;
    max-height: 160px;
    vertical-align: top;
	}

	.outer_div {
    display:block;
		padding-left: 2px;
    border-top: solid 1px darkblue;
		border-bottom: 1px lightgray solid;
		min-height: 40px;
    height: calc(100vh - 60px);
    max-height: calc(100vh - 60px);
    width: 100%;
	}

	.nice_message {
    display:flexbox;
    vertical-align: top;
    height: fit-content;
		width: 100%;
    padding-left: 2px;
    padding-right: 2px;
		font-size: small;
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
		color:rgb(54, 81, 99);
		font-weight:600;
		background: -webkit-linear-gradient(to right, white ,rgb(252, 251, 248));
		background: linear-gradient(to right, white, rgb(252, 251, 248) );
	}

  button {
    padding: 4px;
    width: fit-content;
    height: fit-content;
    border-radius: 4%;
  }

  span {
    padding: 3px;
    width: fit-content;
    height: fit-content;
    border: 1px solid blanchedalmond;
    margin-left:4px;
  }

</style>
