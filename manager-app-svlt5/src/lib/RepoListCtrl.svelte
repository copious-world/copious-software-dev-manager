<script>

let { active_url = $bindable(""),  active_addr = $bindable(""), ...props } = $props();



let repo_list = $state([]);
let fetched_lans = $state({})

let repo_list_data = []


let display_editor = $state(false)



let ask_for_repo_directory = $state("")


// ----
let ask_for_repo_selected = $state();
let ask_for_repo_answer = $state('');


let will_update = $state(false)
let entry_number = $state(0)
let updating_show_status = $state(false)
let updating_url = $state("")
let updating_addr = $state("")
let updating_cloud = $state("")
let updating_ssh_location = $state("")
let updating_user =  $state("")

let show_lan_master_status = $state(false)


let active_repo = false
let active_repo_index = 0

function link_finder(event,repo,n) {
  let dialog = document.getElementById("ask-for-repo")
  if ( !dialog ) return;

  let repo_parts = repo.name.split('/')

  if ( repo_parts.length ) {
    
    active_repo = repo
    active_repo_index = n
    ask_for_repo_directory = repo_parts[repo_parts.length-1]

    dialog.showModal()
  }

}



function update_repo_remote(new_remote) {
  if ( active_repo !== false ) {
    active_repo.remote = new_remote
    repo_list_data[active_repo_index].remote = new_remote
  }
}



function populate_current_list_or_zero() {

  // let n = repo_list.length
  // if ( n > 0 ) {
  //   for ( let i = 0; i < n; i++ ) {
  //     if ( repo_list[i].addr == active_addr ) {
  //       populate_details(null,repo_list[i],i)
  //       return;
  //     }
  //   }
  //   populate_details(null,repo_list[0],0)
  // }

}


async function  update_repo_list(event) {
  let params = {
    "admin_pass" : props._admin_pass,
    "host" : (props._manual_url.length ? props._manual_url : undefined)
  }
  try {
    let result = await window.fetch_repo_list_update(params)

    if ( !result ) alert("Error")

    repo_list = result
    repo_list_data = result

  } catch (e) {
    alert(e.message)
  }

}

async function get_repo_list(event) {
  // if ( props._admin_pass.length === 0 ) {
  //   alert("no admin pass")
  //   return
  // }

  let params = {
    "admin_pass" : props._admin_pass,
    "host" : (props._manual_url.length ? props._manual_url : undefined)
  }
  try {
    let result = await window.fetch_repo_list(params)

    if ( !result ) alert("Error")

    repo_list = result
    repo_list_data = result
    //populate_current_list_or_zero()
 
    //console.log(repo_list)


  } catch (e) {
    alert(e.message)
  }
}


async function save_repo_list(event) {
  //
  // if ( props._admin_pass.length === 0 ) {
  //   alert("no admin pass")
  //   return
  // }
  //
  let repo_list_update = [].concat(repo_list_data)
  let params = {
    "admin_pass" : props._admin_pass,
    "host" : (props._manual_url.length ? props._manual_url : undefined),
    "repo-list" : repo_list_update
  }
  try {
    //
    let result = await window.post_repo_list(params)

    if ( !result ) alert("Error")
    //
  } catch (e) {
    alert(e.message)
  }
  
}

let command = $state("")

async function run_repo_cmd(event) {

  let params = {
    "admin_pass" : props._admin_pass,
    "host" : (props._manual_url.length ? props._manual_url : undefined),
    "command" : command
  }

  try {
    //
    let result = await window.post_repo_cmd(params)

    if ( !result ) alert("Error")
    //
  } catch (e) {
    alert(e.message)
  }

}

async function fetch_lan(event) {
  // if ( props._admin_pass.length === 0 ) {
  //   alert("no admin pass")
  //   return
  // }

  let params = {
    "admin_pass" : props._admin_pass,
    "host" : (props._manual_url.length ? props._manual_url : undefined)

  }
  try {
    let result = await window.fetch_lan_list(updating_addr,updating_user,params)

    if ( !result ) alert("Error")

    //console.log(repo_list)
    //fetched_lans[updating_addr] = result

  } catch (e) {
    alert(e.message)
  }
  
}


function edit_repo_list(event) {
  display_editor = !display_editor
}


function populate_details(event,repo,n) {
 // coming soon
}


function update_details(event,n) {
  // let obj = repo_list[n]
  // obj.url = updating_url
  // obj.addr = updating_addr
  // obj.cloud = updating_cloud
  // obj.ssh_file = updating_ssh_location
  // obj.user = updating_user
  // repo_list[n] = obj
}

function delete_active_host(event,n) {
  // let host = repo_list[n]
  // let tmp_list = repo_list
  // tmp_list.splice(n,1)
  // repo_list = tmp_list
  // if ( host.addr == active_addr ) {
  //   if ( repo_list.length > 0 ) {
  //     if ( (repo_list.length == n) ) {
  //       host = repo_list[n-1]
  //       populate_details(event,host,n-1)
  //     } else {
  //       host = repo_list[n]
  //       populate_details(event,host,n)
  //     }
  //   } else {
  //     active_addr = ""
  //     active_url = ""
  //   }
  // }
}

function clear_details_and_push_empty(event) {
//   let host = {
//     "url" : "",
//     "addr" : "",
//     "cloud" : "",
//     "ssh_file" : "",
//     "info" : "TBD"
//   }
//   entry_number = repo_list.length
//   updating_url = (host.url !== undefined) ? host.url : ""
//   updating_addr = host.addrlink_finder(event,repo,n)
//   updating_cloud = host.cloud
//   updating_ssh_location = (host.ssh_file !== undefined) ? host.ssh_file : ""
//   updating_user = host.user
//   repo_list = repo_list.concat([host])
}


populate_current_list_or_zero()

// ---- ---- ---- ---- ---- ---- ---- ----
//

</script>

  <div class="status-bar">

    <button onclick={get_repo_list}>get repository list</button>

    <button onclick={update_repo_list}>
      update repos
    </button>

    <button onclick={save_repo_list}>save repository list</button>

    <button onclick={ run_repo_cmd }>command</button><input type="text" bind:value={command} />

  </div>

  <div class="nicer_message">

    <div class="status-bar" >
      <span>Known Hosts:</span>
      
      <label for="cb-updater">Show Status</label> 
      <input id="cb-updater" type="checkbox" bind:checked={updating_show_status} />

      {#if show_lan_master_status }
      <span class="is_lan"> LAN </span>
      {:else}
      <span class="is_lan"> srv </span>      
      {/if}
    </div>
    
    <div class="big-list-container" >
  
    <table style="width: 100%;">
      {#each repo_list as repo, n }
        <tr>
          <td>
            <button onclick={(event) => populate_details(event,repo,n)}>{repo.name}</button>
          </td>
          <td>
            {#if repo.remote === "unknown" }
              <button onclick={(event) => link_finder(event,repo,n) }>unknown</button>
            {:else}
            <a href="{repo.remote}"  target="GITVIEW">{repo.remote}</a>
            {/if}
          </td>
          <td>
            {repo.owner}
          </td>
          <td>
            {#if repo.in_sync === true }
              <span style="color:green;font-weight:bolder">true</span>
            {:else}
              <span style="color:red;font-weight:bolder" >false</span>
            {/if}
          </td>
        </tr>
      {/each}
      </table>
    </div>


  </div>



  <dialog id="ask-for-repo">

    <p>check {ask_for_repo_directory}</p>

    <p>https:/github.com/{ask_for_repo_answer}/{ask_for_repo_directory}.git</p>
    
    <select bind:value={ask_for_repo_selected} onchange={() => (ask_for_repo_answer = ask_for_repo_selected,update_repo_remote(`https:/github.com/${ask_for_repo_selected}/${ask_for_repo_directory}.git`),ask_for_repo_selected ='default')} >
       <option value="default">Choose…</option>
        <option value="rleddy" >rleddy</option>
        <option value="copious-world" >copious-world</option>
    </select>

    <form method="dialog">
      <button>OK</button>
    </form>
  </dialog>

<style>

  .big-list-container {
		padding-left: 2px;
    border-top: 1px rgb(130, 166, 149) solid;
		border-left: 1px rgb(250, 249, 249) solid;
    background-color: rgb(241, 241, 233);

    height: calc(100% - 10px);
    overflow-y: scroll;
    vertical-align: top;
  }

  .status-bar {
    height: fit-content;
  }

  .nicer_message {
    vertical-align: top;

    height: 500px;
    max-height: 500px;

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

  .is_lan {
    font-weight: bold;
    font-size: smaller;
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

  /* Open state of the dialog  */
  dialog:open {
    opacity: 1;
    transform: scaleY(1);
  }

  /* Closed state of the dialog   */
  dialog {
    padding: 4px;
    opacity: 0;
    transform: scaleY(0);
    transition:
      opacity 0.7s ease-out,
      transform 0.7s ease-out,
      overlay 0.7s ease-out allow-discrete,
      display 0.7s ease-out allow-discrete;
    /* Equivalent to
    transition: all 0.7s allow-discrete; */
  }

  /* Before open state  */
  /* Needs to be after the previous dialog:open rule to take effect,
      as the specificity is the same */
  @starting-style {
    dialog:open {
      opacity: 0;
      transform: scaleY(0);
    }
  }

  /* Transition the :backdrop when the dialog modal is promoted to the top layer */
  dialog::backdrop {
    background-color: transparent;
    transition:
      display 0.7s allow-discrete,
      overlay 0.7s allow-discrete,
      background-color 0.7s;
    /* Equivalent to
    transition: all 0.7s allow-discrete; */
  }

  dialog:open::backdrop {
    background-color: rgb(0 0 0 / 25%);
  }

  /* This starting-style rule cannot be nested inside the above selector
  because the nesting selector cannot represent pseudo-elements. */

  @starting-style {
    dialog:open::backdrop {
      background-color: transparent;
    }
  }

</style>
