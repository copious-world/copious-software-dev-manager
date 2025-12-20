<script>

let { active_plugins = $bindable({}), ...props } = $props();


let g_plugin = $derived.by(() => {
    return active_plugins["editor"].current
});

let g_plugin_selections = $derived.by(() => {
    let the_keys = [].concat(active_plugins["editor"].keys)
    the_keys.unshift("markdown")
    return the_keys
});

let g_plugins = $derived.by(() => {
    return active_plugins["editor"].plugins
});


let gl_plugin = $state("markdown")


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
    <div id="editor-{a_plugin}" style="{ gl_plugin === a_plugin ? `display:block`  : `display:none` }">
        WILL INSERT HTML HERE  {a_plugin}
    </div> 
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

