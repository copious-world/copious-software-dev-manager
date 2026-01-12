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

let g_plugins = $derived.by(() => {
    return active_plugins["snippets"].plugins
});


let gl_plugin = $state("feedback")

let g_function_map = $state({
    "f1" : {},
    "f2" : {}
})


let snippet_list = $state([]);


async function get_snippet_table(event) {
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
    let result = await window.fetch_snippet_table(params)

    if ( !result ) alert("Error")

    // update
    g_function_map = result

console.log(result)
    snippet_list = Object.keys(g_function_map)

  } catch (e) {
    alert(e.message)
  }
}




get_snippet_table()



</script>

<div id="app-editor-header"  style="text-align: top;width:100%;background-color:rgba(245, 227, 203, 0.4)">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <rect width="30" height="30" x="3" y="5" rx="2" ry="2" fill="rgba(250,235,215,0.4)" />
    </svg>
    {#each g_plugin_selections as a_plugin }
        <button class="subtle_button" onclick={(ev) => { gl_plugin = a_plugin; }}>{a_plugin}</button> 
    {/each}
</div>

{#each g_plugin_selections as a_plugin }
    {#if a_plugin === "feedback" }
        <div id="editor-feedback" class="feedback-controls" style="{ gl_plugin === "feedback" ? `display:block`  : `display:none` }">
            <div class="function-list" >
                <ul>
                {#each g_function_map as a_function } 
                    <li>{a_function}</li>
                {/each}
                </ul>
            </div>
            <div class="func-ops" >
some edifying description and code
            </div>
        </div> 
    {:else}
        <div id="editor-{a_plugin}" style="{ gl_plugin === a_plugin ? `display:block`  : `display:none` }">
            WILL INSERT HTML HERE  {a_plugin}
        </div> 
    {/if}
{/each}

<style>

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

    button {
        padding: 4px;
        width: fit-content;
        height: fit-content;
        border-radius: 4%;
    }


    .function-list {
        display: inline-block;
        vertical-align: top;
        width: 26%;
        margin: 0px;
        background-color: rgb(220, 253, 220);
        border: 1px solid navy;
    }

    .func-ops {
        display: inline-block;
        vertical-align: top;
        width: 73%;
        height:99%;
        min-height:99%;
        border: 1px solid rgb(34, 9, 34);
        padding: 2px;
    }

    .feedback-controls {
        width:100%;
        height:90%;
        min-height:90%;
        vertical-align: top;
        border: 1px solid darkgreen;
    }
</style>

