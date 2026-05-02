// tracked_desktop_view.svelte.js

export const g_open_directories = $state({ dirs : {} });

export const od_keys = $state({ keys: [], length : 0 })


export function add_open_directory(dir_name) {
    console.log(dir_name)
    g_open_directories.dirs[dir_name] = new Date()
    od_keys.keys = Object.keys(g_open_directories.dirs)
    od_keys.length = od_keys.keys.length
}



export const g_open_editors = $state({ editors : {} });

export const g_open_terminals = $state({ terminals : {} });


