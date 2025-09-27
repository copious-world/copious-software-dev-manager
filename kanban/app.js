
// https://javascript.plainenglish.io/how-i-built-a-simple-javascript-kanban-board-from-scratch-7318844b70a2
// Mariyam Mahmood
// Add to app.js

let dragged = null;

function dragStart(e) {
  dragged = {
    status: e.target.dataset.status,
    index: e.target.dataset.index,
    text: e.target.textContent
  };
}

function dropCard(e) {
  const newStatus = e.currentTarget.id;

  // Remove from old column
  boardData[dragged.status].splice(dragged.index, 1);
  // Add to new column
  boardData[newStatus].push(dragged.text);

  saveBoard();
  renderBoard();
}

let test = `
{
  "title": "Development Support",
  "Kanban solution (might just be an app section of a copious-host-manager)": {
    "title": "Kanban solution (might just be an app section of a copious-host-manager)",
    "description": "<br>   &#129966; Can move things around by using fuse.<br>      &#129966; Will need some way to share within the copious.world stack"
  },
  "Git Repository List (for copious-host-manager)": {
    "title": "Git Repository List (for copious-host-manager)",
    "description": "<br>   &#9745; clear out downloads for interest or possible use (make not of them ... see “possible external feature providers”)<br>   &#9745; figure out which repos are fully represented on the current machine for fast work and update<br>   &#129966; manage via a web page (update the copious-host-manager)"
  },
  "Css layout for larger screens": {
    "title": "Css layout for larger screens",
    "description": ""
  },
  "some way to open files/dirs (as folders) from within apps such as this": {
    "title": "some way to open files/dirs (as folders) from within apps such as this",
    "description": "<br>   &#129966; looking for clusters of work (want to open windows in Nemo, not in the editor or other..)"
  },
  "local file sharing (local file server) 4": {
    "title": "local file sharing (local file server) 4",
    "description": "<br>   &#129966; can be fuse based"
  },
  "module dependency graph (need to go beyond npm ... but their might be an npm tool to start with)": {
    "title": "module dependency graph (need to go beyond npm ... but their might be an npm tool to start with)",
    "description": "<br>   &#9745; found one https://npmgraph.js.org/<br>   &#129966; make use of https://npmgraph.js.org/<br>      &#129966; self hosting is possible<br>      &#129966; might be some way to check configurations for late loading modules or other language modules."
  },
  "backup process (clear and fast)": {
    "title": "backup process (clear and fast)",
    "description": "<br>   &#129966; backup this computer and restore its state (this file, too)."
  },
  "configuration as code https://dev.to/rannn505/configuration-as-code-automating-application-configuration-45k6": {
    "title": "configuration as code https://dev.to/rannn505/configuration-as-code-automating-application-configuration-45k6",
    "description": ""
  },
  "view computers in stack, local/remote, view processes (export htop), view network, asses configurations, etc.": {
    "title": "view computers in stack, local/remote, view processes (export htop), view network, asses configurations, etc.",
    "description": ""
  },
  "open directories by project in nemo (or default) xdg-open ~/GitHub/alphas/copious-hosts-manager/": {
    "title": "open directories by project in nemo (or default) xdg-open ~/GitHub/alphas/copious-hosts-manager/",
    "description": ""
  }
}
`

// app.js
let boardData = JSON.parse(localStorage.getItem('kanban')) ||
 {
  todo: [],
  planning: [],
  doing: [],
  staging: [],
  done: []
};

let boardTitles = {
  todo: "To Do",
  planning: "Planning",
  doing: "Active",
  staging: "Staged",
  done: "Released"
}

function saveBoard() {
  localStorage.setItem('kanban', JSON.stringify(boardData));
}


function prepBoard() {
    let b = `
    <div class="column" data-status="$id">
      <h2>$title</h2>
      <div class="dropzone" id="$id"></div>
      <button onclick="addCard('$id')">+ Add Card</button>
    </div>
    `
    test = test.trim()
    let source_data = JSON.parse(test)

    if ( boardData.todo.length === 0  ) {
      for ( let key of Object.keys(source_data) ) {
        if ( key === "title" ) continue
        boardData.todo.push(key)
      }
    }

    let name_board = document.getElementById('big_board')

    name_board.innerHTML = source_data.title
    delete source_data.title

    let board = document.getElementById("board")
    if ( !board ) return;

    let kys = Object.keys(boardData)
    for ( let ky of kys ) {
        let html = "" + b
        let title = boardTitles[ky]
        html = html.replace("$title",title)
        html = html.replace("$id",ky)
        html = html.replace("$id",ky)
        html = html.replace("$id",ky)
        board.innerHTML += html
    }


    document.querySelectorAll('.dropzone').forEach(zone => {
        zone.addEventListener('dragover', e => e.preventDefault());
        zone.addEventListener('drop', dropCard);
    });

}

function renderBoard() {
    let colums = Object.keys(boardData)
    colums.forEach(status => {
    const dropzone = document.getElementById(status);
    dropzone.innerHTML = '';
    boardData[status].forEach((text, idx) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.draggable = true;
        card.textContent = text;  
        card.dataset.status = status;
        card.dataset.index = idx;
        card.addEventListener('dragstart', dragStart);
        dropzone.appendChild(card);
      });
    });
}

function addCard(status) {
  const text = prompt('Enter card text:');
  if (text) {
    boardData[status].push(text);
    saveBoard();
    renderBoard();
  }
}


prepBoard()
renderBoard();

