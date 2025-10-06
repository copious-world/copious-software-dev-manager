<script>

let { active_url = $bindable(""),  active_addr = $bindable(""), ...props } = $props();



let repo_list = $state([]);
let repo_list_view = $state([]);


let operations_panel = $state(false)

let repo_list_data = []
let repo_list_descriptions = {}
let repo_descriptions_update = {}


let display_editor = $state(false)

let toggle_checkboxes = $state(false)



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
    repo_list_view = [].concat(result)

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
    repo_list_view = [].concat(result)

  } catch (e) {
    alert(e.message)
  }
}



async function get_repo_list_descriptions(event) {
  // if ( props._admin_pass.length === 0 ) {
  //   alert("no admin pass")
  //   return
  // }

  let params = {
    "admin_pass" : props._admin_pass,
    "host" : (props._manual_url.length ? props._manual_url : undefined)
  }
  try {
    let result = await window.fetch_repo_list_descriptions(params)

    if ( !result ) alert("Error")

    repo_list_descriptions = result

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

async function run_repo_cmd(event,add_params) {

  let cmd_str = command
  cmd_str = cmd_str.trim()
  //
  let cmd_param = ""
  if ( cmd_str.indexOf(' ')  > 0 ) {
    let cmd_parts = cmd_str.split(' ')
    cmd_str = cmd_parts.shift().trim()
    
    cmd_parts = cmd_parts.filter((w) => {
      return w.length > 0
    })

    cmd_parts = cmd_parts.map((w) => {
      if ( w.endsWith(',') ) {
        w = w.substring(0,w.length-1)
      }
      return w
    })

    cmd_param = cmd_parts.join(',')
  }

  let params = {
    "admin_pass" : props._admin_pass,
    "host" : (props._manual_url.length ? props._manual_url : undefined),
    "command" : cmd_str,
    "parameters" : cmd_param
  }

  if ( (add_params !== undefined) && (typeof add_params === "function") ) {
    add_params(params)
  }

  try {
    //
    let result = await window.post_repo_cmd(params)

    if ( !result ) alert("Error")

    return result
    //
  } catch (e) {
    alert(e.message)
  }

}



function sort_repo_list_by_date(ev) {
  // if filters
  let new_repo_order = ([].concat(repo_list_data)).sort((a,b) => {
    let date_a = new Date(a.date)
    let date_b = new Date(b.date)
    return date_b.getTime() - date_a.getTime()
  })
  //
  repo_list_view = new_repo_order
}

function sort_repo_list_by_name(ev) {
  let new_repo_order = ([].concat(repo_list_data)).sort((a,b) => {
    let a_str = a.name
    let b_str = b.name
    if ( a_str > b_str ) return 1
    if ( a_str === b_str ) return 0
    if ( a_str < b_str ) return -1
  })
  repo_list_view = new_repo_order
}
      
function sort_repo_list_by_file(ev) {

  let new_repo_order = ([].concat(repo_list_data)).sort((a,b) => {
    let a_str = a.name
    let b_str = b.name
    //
    a_str = a_str.substring(a_str.lastIndexOf("/"))
    b_str = b_str.substring(b_str.lastIndexOf("/"))
    //
    if ( a_str > b_str ) return 1
    if ( a_str === b_str ) return 0
    if ( a_str < b_str ) return -1
  })
  //
  repo_list_view = new_repo_order
}



async function open_git_directory(e) {
  command = "open-directory " + r_edit_name
  await run_repo_cmd(e)
}

async function get_repo_status(e) {

  command = "get-status " + r_edit_name
  let repo_info = await run_repo_cmd(e)

  if ( repo_info.modified.length > 0 ) {
    repo_needs_commit = true
    repo_change_list = repo_info.modified
  } else {
    repo_change_list = ["no changes detected"]
  }
 
  if ( repo_info.not_added.length > 0  ) {
    repo_needs_commit = true
    repo_added_list = repo_info.not_added    
  } else {
    repo_added_list = ["no files added"]
  }

}


async function commit_changes(event) {

  command = "commit " + r_edit_name

  let add_params = (pars) => {
    pars.messages = [repo_commit_message,repo_commit_message_2]
  }

  await run_repo_cmd(event,add_params)
  await get_repo_status(event)
}

async function git_push(event) {
  command = "push " + r_edit_name
  await run_repo_cmd(event)  
}

async function git_pull(event) {
  command = "pull " + r_edit_name
  await run_repo_cmd(event)    
}


function edit_repo_list(event) {
  display_editor = !display_editor
}

function show_details() {
  // show modal...
  let dialog = document.getElementById("edit-repo")
  if ( !dialog ) return;
  if ( !(dialog.open) ) {
    dialog.show()
    dialog.style.top = "40px"
  }
}

let r_description = $state("")
let r_edit_name = $state("nothing here yet")

async function populate_details(event,repo,n) {
  // coming soon
  if ( !(repo_list_descriptions) || (Object.keys(repo_list_descriptions).length === 0) ) {
    await get_repo_list_descriptions(null)
  }
  //
  let r_descr = repo_list_descriptions[repo.name]
  if ( r_descr ) {
    r_edit_name = repo.name
    r_description = r_descr.text
    //
    show_details()

    await get_repo_status(event)
  }
}



function show_git_ops_panel(ev) {

  if ( operations_panel ) {
    operations_panel = false
  } else {
    operations_panel = true
    setTimeout(() => {

      let ops = document.getElementById("ops_panel")
      let ref = document.getElementById("nicer-container")

      let ref_rect = ref.getBoundingClientRect()

      let l = ref_rect.left + 0.5*ref_rect.width
      let t = 0
      let h = ref_rect.height - 1
      let w = 0.5*ref_rect.width

      ops.style.left = `${l}px`
      ops.style.top = `${t}px`
      ops.style.width = `${w}px`
      ops.style.height = `${h}px`

    },0)
  }

}


async function add_decription_update(event) {
  let rname = r_edit_name
  repo_list_descriptions[rname].text = r_description
  repo_descriptions_update[rname] = repo_list_descriptions[r_edit_name]
}


async function send_description_update(event) {

  let params = {
    "admin_pass" : props._admin_pass,
    "host" : (props._manual_url.length ? props._manual_url : undefined),
    "descriptions" : repo_descriptions_update
  }
  try {
    //
    let result = await window.post_repo_descriptions(params)

    if ( !result ) alert("Error")
    else {
      repo_descriptions_update = {}   // clear it out 
    }
    //
  } catch (e) {
    alert(e.message)
  }
  

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


let repo_needs_commit = $state(false)
let repo_commit_message = $state("")
let repo_commit_message_2 = $state("")
let repo_change_list = $state(["no changes detected"])
let repo_added_list = $state(["no files added"])

let add_list_checker = $state(false)


</script>

<div class="container">

  <div class="status-bar">

    <button onclick={get_repo_list}>get repository list</button>

    <button onclick={update_repo_list}>
      update repos
    </button>

    <button onclick={save_repo_list}>save repository list</button>

    <button onclick={ run_repo_cmd }>command</button><input type="text" bind:value={command} />

    <div class="status-bar" >
      <label for="multi-selection">Multiple Selection
        <input id="multi-selection" type="checkbox" bind:checked={toggle_checkboxes} />
      </label> 
      <button class="light-button"  onclick={show_git_ops_panel}>
        {#if operations_panel }
          hide ops
        {:else}
          show ops
        {/if}
      </button>
      <button class="light-button"  onclick={sort_repo_list_by_date}>
        sort by date
      </button>
      <button class="light-button"  onclick={sort_repo_list_by_name}>
        sort by name
      </button>
      <button class="light-button"  onclick={sort_repo_list_by_file}>
        sort by files
      </button>
    </div>

  </div>

  <div id="nicer-container"  class="nicer_message">
    <div id="big-list-container" class="big-list-container"  >
      <table style="width: 100%;">
        {#each repo_list_view as repo, n }
          <tr>
            {#if toggle_checkboxes }
            <td>
              <input type="checkbox" />
            </td>
            {/if}
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
              {repo.date}
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

    {#if operations_panel }
      <div id="ops_panel" class="ops-panel">
        <br>
        <p><button class="refresher" onclick={get_repo_status}>&#10227;</button> &nbsp;{r_edit_name}</p>
        <br>

        <div style="width:100%;min-height: 450px;background-color:#FEFEFE;border: 1px solid blue;">
          <div class="ops-panel-descriptions">
          {@html r_description}
          </div>
          <!-- two panels-->
          <div class="ops-panel-descriptions" style="display:inline-block">
            <div class="ops-buttons">
              <button onclick={git_push}>push</button>
              <button onclick={git_pull}>pull</button>
              <button onclick={open_git_directory} >open directory</button>
              <button>open editor</button>
            </div>
            <div class="ops-commit" >
              <span class="commit-span">needs commit:</span>
              {#if repo_needs_commit}
                <span class="commit-span" style="color: brown;">yes</span>
                <label>commit message: <input type="text" bind:value={repo_commit_message}/></label>
                <button onclick={commit_changes}>commit</button>
                <blockquote>
                  <textarea bind:value={repo_commit_message_2}>

                  </textarea>
                </blockquote>
              {:else}
              <span class="commit-span" style="color: limegreen;">no</span>
              {/if}
              <br>
            </div>
            <div class="changed-list">
              <div style="border-bottom:1px solid darkblue;background-color:rgba(191, 219, 65, 0.705);">changed files:</div>
              <ul>
                {#each repo_change_list as changed}
                 <li>{changed}</li>
                {/each}
              </ul>
              <div style="border-bottom:1px solid darkblue;background-color:rgba(114, 219, 65, 0.7);">
                Added files:
                &nbsp;&nbsp;&nbsp;show selectors&nbsp;<input type="checkbox" bind:checked={add_list_checker} />
              </div>
              <ul>
                {#each repo_added_list as added}
                 <li style="color: darkorange;" >
                  {#if add_list_checker}
                    <input type="checkbox" name="select-for-add" />
                  {/if}
                  {added}
                </li>
                {/each}
              </ul>

              
            </div>
          </div>
        </div>

      </div>
    {/if}


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



  <dialog id="edit-repo">
    <button class="light-button"  onclick={show_git_ops_panel}>
      {#if operations_panel }
        hide ops
      {:else}
        show ops
      {/if}
    </button>

    <p>{r_edit_name}</p>

    <p><b>Why this repo:</b></p>
    <textarea bind:value={r_description}>
      {r_description}
    </textarea>
    <p>
      <button onclick={add_decription_update} >+ update</button>&nbsp;
      <button onclick={send_description_update}>send description update</button>
    </p>

    <form method="dialog">
      <button>OK</button>
    </form>
  </dialog>


<style>


  .container {
    display: flex;
    position:relative;
    bottom:0px;
    top:0px;
    width:100%;
    height: calc(100vh - 160px);
    flex-direction: column;
  }

  .big-list-container {
		padding-left: 2px;
    border-top: 1px rgb(130, 166, 149) solid;
		border-left: 1px rgb(250, 249, 249) solid;
    background-color: rgba(255, 255, 239, 1);

    height: calc(100vh - 40px);
    overflow-y: scroll;
    vertical-align: top;
  }


  .ops-panel {
    position:absolute;
    z-index: 100;
    top : 100px;
    left: 50vw;
    min-height: 450px;
    width: calc(45vw - 5px);
    max-width: 45vw;
    vertical-align: top;
    padding-left: 2px;
    background-color: white;
    color: black;
    background-color: rgba(237, 237, 248, 1);
    border : 1px solid rgba(45, 46, 49, 1);
  }


  .status-bar {
    height: fit-content;
  }

  .nicer_message {
    vertical-align: top;

    flex: 1; /* This makes it fill the remaining space */
    overflow-y: auto; /* Add scroll if content exceeds available space */
    

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


  #edit-repo {
    width : 500px;
    height : fit-content;
    padding-left: 2%;
  }


  #edit-repo textarea {
    width : 96%;
    height : 250px;
  }


  .ops-panel-descriptions {
    display: inline-block;
    vertical-align: top;
    width : 45%;
    border: 1px solid rgb(17, 17, 61);
    padding: 4px;
  }

  .ops-commit {
    padding: 3px;
    background-color: rgba(163, 163, 112, 0.603);
    margin-top:2px;
    margin-bottom:2px;
  }


  .ops-panel-descriptions textarea {
    width : 96%;
    height : 120;
  }

  .ops-panel-descriptions blockquote {
    border: solid 1px black;
    padding: 3px;
  }

  .changed-list {
    border: solid 1px green;
    max-height: 370px;
    overflow: auto;
    padding-left: 5px;
  }

  .ops-buttons {
    border-bottom: 1px solid rgb(14, 39, 14);
    margin-bottom: 3px;
    padding-bottom: 2px;
  }

  .refresher {
    font-size:xx-large;
    border:none;
    background-color: rgba(191, 219, 65, 0.705);
    border-radius: 24%;
    height: fit-content;
  }

  .refresher:hover {
    background-color: rgb(219, 219, 143);
  }

  .commit-span {
    border:none;
    font-weight: bold;
    font-size: 1.05em;
  }

</style>
