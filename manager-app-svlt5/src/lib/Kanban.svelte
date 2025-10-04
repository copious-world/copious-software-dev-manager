<script>


let { active_url = $bindable(""),  active_addr = $bindable(""), ...props } = $props();


let g_panel = $state("kanban");

// panels don't change necessarily
let g_panel_selections = [
  "kanban",
  "focus",
  "dates",
  "graph"
]

let g_panels = {
  "kanban" : "Kanban",
  "focus" : "Focus",
  "dates" : "Calendar",
  "graph" : "Visuals"
}


let g_panels_displayed = {
  "kanban" : "block",
  "focus" : "none",
  "dates" : "none",
  "graph" : "none"
}


let kb_info = {}


function update_panels(panel) {
  for ( let p in g_panels_displayed ) {
    if ( p === panel ) {
      g_panels_displayed[p] = "block"
    } else {
      g_panels_displayed[p] = "none"
    }
  }
}


function show_details(dialog_name) {
  // show modal...
  let dialog = document.getElementById(dialog_name)
  if ( !dialog ) return;
  dialog.style.left = "100px"
  dialog.style.top = "120px"
  dialog.showModal()
}

// ===========================================================================


let storage_actions = $state("save")

// ===========================================================================

let dragged = null;
let source_data = $state({ "title" : "none" })

function dragStart(e,b_ky,idx) {
    let txt = boardData[b_ky][idx]
    dragged = {
        status: b_ky,
        index: idx,
        text: txt
    };
}


function dropCard(e) {
  const newStatus = e.currentTarget.id;

  // Remove from old column
  boardData[dragged.status].splice(dragged.index, 1);
  // Add to new column
  boardData[newStatus].push(dragged.text);

  saveBoard();
  boardDataUpdate = boardData
}


function focusCardCopy(e) {

  // Remove from old column
  if ( dragged.status === "focus" ) {
    boardData[dragged.status].splice(dragged.index, 1);
  }
  // Add to new column
  if ( boardData["focus"].indexOf(dragged.text) >= 0 ) {
    return
  } else {
    //
    boardData["focus"].push(dragged.text);
    saveBoard();
    boardDataUpdate = boardData
    //
  }

}

function loseCard(ev) {
  // Remove from old column
  boardData[dragged.status].splice(dragged.index, 1);
  // Add to new column
  saveBoard();
  boardDataUpdate = boardData
}

// ===========================================================================

let test = `
{
  "Kanban solution (might just be an app section of a copious-host-manager)": {
    "title": "Kanban solution (might just be an app section of a copious-host-manager)",
    "description": "<br>   &#129966; Can move things around by using fuse.<br>      &#129966; Will need some way to share within the copious.world stack"
  },
  "Git Repository List (for copious-host-manager)": {
    "title": "Git Repository List (for copious-host-manager)",
    "description": "<br>   &#9745; clear out downloads for interest or possible use (make not of them ... see “possible external feature providers”)<br>   &#9745; figure out which repos are fully represented on the current machine for fast work and update<br>   &#129966; manage via a web page (update the copious-host-manager)"
  }
}
`

let kanban_title = $state("vanilla title")

// app.js
let boardData = JSON.parse(localStorage.getItem('kanban')) ||
 {
    todo: [],
    focus: [],
    planning: [],
    doing: [],
    staging: [],
    done: []
};


let boardDataUpdate = $state({})

let boardTitles = $state({
                            todo: "To Do",
                            focus: "Today's Focus",
                            planning: "Planning",
                            doing: "Active",
                            staging: "Staged",
                            done: "Released"
                        })



function saveBoard() {
    localStorage.setItem('kanban', JSON.stringify(boardData));
    localStorage.setItem('kanban-map', JSON.stringify(source_data))
    localStorage.setItem('kanban-info', JSON.stringify(kb_info));
}


function prepBoard() {

    let kb_info_str = localStorage.getItem('kanban-info')
    kb_info = kb_info_str ? JSON.parse(kb_info_str) : {}


    let data = localStorage.getItem('kanban-map')
    if ( data ) {
        source_data = JSON.parse(data)
    } else {
        test = test.trim()
        source_data = JSON.parse(test)
    }

    if ( boardData.todo.length === 0  ) {
      for ( let key of Object.keys(source_data) ) {
        if ( key === "title" ) continue
        boardData.todo.push(key)
      }
    }

    
    if ( kb_info ) {
        kanban_title = kb_info.title
        boardTitles = kb_info.board_titles
    }

    if ( kanban_title === undefined ||  kanban_title.length === 0 ) {
        kanban_title = "Development Support"
        kb_info = {
            "title" : kanban_title,
            "board_titles" : {
                todo: "To Do",
                focus: "Today's Focus",
                planning: "Planning",
                doing: "Active",
                staging: "Staged",
                done: "Released"
            }
        }
        localStorage.setItem('kanban-info', JSON.stringify(kb_info));
    }

    boardDataUpdate = boardData
    saveBoard();

    document.querySelectorAll('.dropzone').forEach(zone => {
        zone.addEventListener('dragover', e => e.preventDefault());
        zone.addEventListener('drop', dropCard);
    });

}





function addCard(status) {
  const text = prompt('Enter card text:');
  if (text) {
    boardData[status].push(text);
    source_data[text] = {
        "title" : text,
        "description" : "tbd"
    }
    saveBoard();
    boardDataUpdate = boardData
  }
}


function addFocusCard(original,fcopy) {
    const text = prompt('Enter card text:');
    if (text) {
        boardData[original].push(text);
        if ( fcopy ) {
            boardData[fcopy].push(text);
        }
        source_data[text] = {
            "title" : text,
            "description" : "tbd"
        }
        saveBoard();
        boardDataUpdate = boardData
    }
}



// ===========================================================================


let r_edit_name = $state("")
let r_description = $state("")
let store_edit_name = ""

function editTask(e,name,ignore_dialog) {
    e.preventDefault()
    //
    r_edit_name = name
    store_edit_name = name
    //
    let descr = source_data[name]
    if ( descr === undefined ) {
        source_data[name] = {
            "title" : name,
            "description" : "tbd"
        }
        descr = source_data[name]
    }
    r_description = descr.description

    if ( !(ignore_dialog) ) {
        show_details("edit-task") 
    }

}



function editTaskSave(e) {
    let descr = source_data[store_edit_name]
    //
    if ( typeof descr === "object" ) {
        descr.title = r_edit_name
        descr.description = r_description
        if ( store_edit_name !== r_edit_name ) {

            for ( let bname in boardData ) {
                let tlist = boardData[bname]
                let idx = tlist.indexOf(store_edit_name)
                if ( idx >= 0 ) {
                    tlist.splice(idx,1,r_edit_name)
                }
            }

            // take the description out of every list it appears in and replace it with the new key

            source_data[r_edit_name] = descr
            delete source_data[store_edit_name]
            store_edit_name = r_edit_name // just in case
            //
            boardDataUpdate = boardData
        }
        saveBoard();
    }
}


function updateEditedTask(e) {
    let return_value = e.target.returnValue
    if ( return_value === "accept" ) {
        editTaskSave(e) 
    }
}


function saveAll(e) {
    e.preventDefault()
    show_details("storage_manager")
}


async function saveAllComplete(e) {
    let return_value = e.target.returnValue
    if ( return_value === "accept" ) {
        switch ( storage_actions ) {
            case "save-all" : {

                let board_list = localStorage.getItem("boards")
                let all_boards = {}
                let all_maps = {}
                if ( Array.isArray(board_list) ) {
                    for ( let board_id of board_list ) {
                        let k = localStorage.getItem(`kb-${board_id}`)
                        let km = localStorage.getItem(`kbm-${board_id}`)
                        if ( k && km ) {
                            all_boards[board_id] = k
                            all_maps[board_id] = km
                        }
                    }
                }
                let params = {
                    "admin_pass" : props._admin_pass,
                    "host" : (props._manual_url.length ? props._manual_url : undefined),
                    "kanban" : JSON.stringify(all_boards),
                    "kmap" :  JSON.stringify(all_maps),
                    "scope" : "all-boards"
                }

                await window.post_kanban_boards(params)
                break
            }
            case "save-board" : {
                let params = {
                    "admin_pass" : props._admin_pass,
                    "host" : (props._manual_url.length ? props._manual_url : undefined),
                    "kanban" : localStorage.getItem("kanban"),
                    "kmap" :  localStorage.getItem("kanban-map"),
                    "scope" : "single-board",
                    "title" :  encodeURIComponent(kanban_title)
                }

                await window.post_kanban_boards(params)
                break;
            }
            case "discard-board" : {
                //
                let params = {
                    "admin_pass" : props._admin_pass,
                    "host" : (props._manual_url.length ? props._manual_url : undefined),
                    "title" : encodeURIComponent(kanban_title)
                }
                //
                let board_data = await window.fetch_kanban_boards(params)
                if ( board_data ) {
                    let kb = board_data.kanban
                    let kbm = board_data.kb_map

                    source_data = JSON.parse(kbm)
                    delete source_data.title

                    boardData = JSON.parse(kb)
                    boardDataUpdate = boardData
                    saveBoard();
                }
                //
                break;
            }
        }
    }
}

function manage_boards(e) {
    e.preventDefault()
    show_details("board_manager")
}


prepBoard()

</script>


<div class="k_wrap">
    <div style="width: 100%;" >
        <div class="the_selectors">
            {#each g_panel_selections as a_panel }
                <button class="petite" onclick={(ev) => { g_panel = a_panel; update_panels(a_panel) }}>{g_panels[a_panel]}</button> 
            {/each}
            {#if g_panel === "kanban" }
                <button class="dropper"  onclick={(ev) => { g_panel = "focus"; update_panels("focus") }}
                                ondragover={(e) => e.preventDefault()} ondrop={focusCardCopy}>&#x1F441;</button>
            {/if}
        </div>
        <div class="the_title">
            <span class="button_like" onclick={manage_boards}>📋</span> <span id="big_board">{kanban_title}</span> 
        </div>
        <div class="the_envelope" onclick={saveAll} > &#9993; </div>
        <div class="the_trash" ondragover={(e) => e.preventDefault() } ondrop={loseCard} > &#128465; </div>
    </div>

    {#if g_panel === "kanban" }
        <div id="board">
            {#each Object.keys(boardTitles) as b_ky }
                {#if b_ky !== "focus" }
                <div class="column" data-status="{b_ky}">
                    <h2>{boardTitles[b_ky]}</h2>
                    <div class="dropzone" id="{b_ky}" ondragover={(e) => e.preventDefault() } ondrop={dropCard} >
                        {#each Object.keys(boardDataUpdate[b_ky]) as bdu_text }
                            <div class="card" draggable=true ondragstart={(ev) => {dragStart(ev,b_ky,bdu_text)}}
                                    onclick={(e) => {editTask(e,boardDataUpdate[b_ky][bdu_text])}}>
                                {boardDataUpdate[b_ky][bdu_text]}
                            </div>
                        {/each}
                    </div>
                    <button onclick={(ev) => {addCard(b_ky)}}>+ Add Card</button>
                </div>
                {/if}
            {/each}
        </div>
    {:else if g_panel === "focus" }
    <div style="width: 100%;">
        <div class="column add-inline" data-status="focus">
            <h2>{boardTitles["focus"]}</h2>
            <div class="dropzone" id="focus" ondragover={(e) => e.preventDefault() } ondrop={dropCard} >
                {#each Object.keys(boardDataUpdate["focus"]) as bdu_text }
                    <div class="card" draggable=true ondragstart={(ev) => {dragStart(ev,"focus",bdu_text)}}
                            onclick={(e) => {editTask(e,boardDataUpdate["focus"][bdu_text],true)}}>
                        {boardDataUpdate["focus"][bdu_text]}
                    </div>
                {/each}
            </div>
            <button onclick={(ev) => {addFocusCard("focus","todo")}}>+ Add Card</button>
        </div>
        <div id="other-half-focus" >
            <div class="div-splitter">
                <p>{r_edit_name}</p>
                <label>Task name (may change):<br>
                    <input type="text" bind:value={r_edit_name} style="width:85%"/>
                </label>

                <p><b>Task Description:</b></p>
                <textarea class="embedded-textarea" bind:value={r_description}>
                </textarea>

                <p>
                    <button onclick={editTaskSave}>save</button>
                </p>
            </div>

            <div class="div-splitter">
                <blockquote>
                    {@html r_description}
                </blockquote>
            </div>

        </div>
    </div>
    {:else if g_panel === "dates" }
        Dates
    {:else if g_panel === "graph" }
        Graphs
    {/if}

</div>


<dialog id="edit-task" onclose={updateEditedTask}   style="width:40%;">

    <p>{r_edit_name}</p>
    <label>Task name (may change):<br>
    <input type="text" bind:value={r_edit_name} style="width:85%"/>
    </label>

    <p><b>Task Description:</b></p>
    <div style="width:100%;border: solid 1px gray;vertical-align:top;">
        <div style="display:inline-block;width:48%;vertical-align:top;">
            <textarea style="height:inherit;max-width:100%;min-width:100%;" bind:value={r_description}>
            </textarea>
        </div>
        <div style="display:inline-block;width:48%;vertical-align:top;border:solid 1px darkgreen;padding:3px;">
            {@html r_description}
        </div>
    </div>

    <form method="dialog">
        <button value="accept">OK</button>
        <button value="cancel" formmethod="dialog">Cancel</button>
    </form>
</dialog>


<dialog id="board_manager" >
    <p>Board manager</p>

    <form method="dialog">
        <button>OK</button>
    </form>
</dialog>



<dialog id="storage_manager" onclose={saveAllComplete}>
    <p>Storage manager</p>

    <div>
        <label>save all<input type="radio" name="save_action" value="save-all" bind:group={storage_actions} /></label>
    </div>
    <div>
        <label>save board<input type="radio"  name="save_action" value="save-board" bind:group={storage_actions} /></label>
    </div>
    <div>
        <label>discard changes<input type="radio"  name="save_action"  value="discard-board" bind:group={storage_actions} /></label>
    </div>

    <form method="dialog">
        <button value="accept">OK</button>
        <button value="cancel" formmethod="dialog">Cancel</button>
    </form>
</dialog>


<style>
/* style.css */
.k_wrap {
  font-family: sans-serif;
  text-align: center;
}

#board {
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
}

.column {
  background: #f4f4f4;
  padding: 1rem;
  border-radius: 8px;
  width: 30%;
}

.dropzone {
  min-height: 300px;
  max-height: 340px;
  overflow-y: auto;

  padding: 1rem;
  background: #fff;
  border: 2px dashed #ccc;
  border-radius: 4px;
}

.card {
  background: #ffe;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: grab;
}

.the_selectors {
    display: inline-block;
    text-align:left;
    width:30%;
}
.the_title {
    display: inline-block;
    text-align:center;
    width:30%;
}
.the_envelope {
    cursor: pointer;
    display: inline-block;
    text-align:right;
    width:5%;
    font-size:x-large;
    height: fit-content;   
}
.the_trash {
    display: inline-block;
    text-align:right;
    width:25%;
    padding-right:15%;
    font-size:x-large;
    height: fit-content;
}

.petite {
    font-size: x-small;
    width: 15%;
}

.dropper {
    font-size:large;
    height: 30px;
    border-radius: 35%;
    width: 10%;
    background-color: rgba(252, 252, 216, 1);
    border: 1px solid rgb(1, 25, 90);
}


.button_like {
    cursor: pointer;
}

.button_like:hover {
    color: orange;
    background-color: rgb(247, 232, 205);
    border: 1px rgb(208, 208, 221) dotted;
    
}


.add-inline {
    float: left;
    margin-right:  4px;
}

#other-half-focus {
    vertical-align: top;
    float: left;
    text-align: left;
}


.embedded-textarea {
    height : 35%;
    min-height: 350px;
    width : 90%;
    max-width: calc(30vw - 20px);
}

.div-splitter {
    min-height: 450px;
    height: 65vh;
    display:inline-block;
    width: calc(30vw - 5px);
    vertical-align: top;
    padding-left: 4px;
    border : 1px solid rgb(221, 220, 220);
}

</style>
