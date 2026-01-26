

let {FileOperations,PathManager} = require("extra-file-class")
let fs = require("extra-file-class")()

let csstree = require("css-tree")
let CSSSurfaceTree = require('./css-surface-tree.js')
let OneScriptDependencies = require('./depenencies-staging.js')

/**
 * 
 */
class SnippetFinder {

    constructor(conf) {
        this.fos = new FileOperations()
        this.paths = null
        if ( typeof conf.inputs  === 'object' ) {
            this.paths = new PathManager(conf.inputs)
        }
        this.concerns_to_snippet_map_file = {}
        this.conf = conf

        this.script_order = {}
        this.func_alpha_staging_diffs = {}
        this.alpha_func_usage_count = {}
        

        this.css_surface_syntax = new CSSSurfaceTree()
    }

    /**
     * 
     * loads staged files
     * 
     */
    async init() {
        for ( let concern in this.conf.concerns ) {
            let mappable_file =  `[websites]/${concern}/staging/*.html`
            mappable_file = this.paths.compile_one_path(mappable_file)
            let loading_files = []
            let file_map = {}
            for await ( let file of fs.glob(mappable_file) ) {
                console.log(file)
                file_map[file] = { "data" : false }
                loading_files.push(fs.load_data_at_path(file))
            }
            let files_loaded = await Promise.all(loading_files)
            for ( let file of Object.keys(file_map) ) {
                file_map[file].data = files_loaded.shift()
                if ( file_map[file].data  === false ) {
                    delete file_map[file]
                }
            }

            this.concerns_to_snippet_map_file[concern] = file_map
        }
        //
    }



    extract_between_tags(data,start_tag,end_tag) {
        let start_of_data = data.substring(data.indexOf(start_tag))
        let i = 0;
        if ( start_tag[start_tag.length - 1] !== '>' ) {
            while ( start_of_data[i] !== '>' ) i++
            i++
        } else {
            i = start_tag.length + 1
        }
        let subdat = start_of_data.substring(i,start_of_data.indexOf(end_tag))
        return subdat
    }


    extract_css(data) {
        let subdat = this.extract_between_tags(data,"<style","</style>")
        return subdat
    }

    extract_body(data) {
        let subdat = this.extract_between_tags(data,"<body","</body>")
        return subdat
    }
    
    extract_last_script(data) {
        let subdat = data.substring(data.lastIndexOf("<script"))
        subdat = this.extract_between_tags(subdat,"<script","</script>")
        return subdat
    }

    extract_header(data) {
        let subdat = this.extract_between_tags(data,"<head","</head>")
        return subdat
    }


    /**
     * 
     */
    process_parts() {
        for ( let [concern,fmap] of Object.entries(this.concerns_to_snippet_map_file) ) {
            console.log(concern)
            for ( let [file,fdescr] of Object.entries(fmap) ) {
                console.log(file)
                //
                let data = fdescr.data
                if ( data !== false ) {
                    let first_css = this.extract_css(data)
                    fdescr.style = first_css
                    let html_body = this.extract_body(data)
                    fdescr.body = html_body
                    let final_script = this.extract_last_script(data)
                    fdescr.app_script = final_script
                    let header = this.extract_header(data)
                    fdescr.header = header
                } else {
                    delete fmap[file]
                }
                //
            }
        }
    }


    /**
     * 
     */
    css_analysis() {
        let css_order = {}
        //
        for ( let [concern,fmap] of Object.entries(this.concerns_to_snippet_map_file) ) {
            for ( let [file,fdescr] of Object.entries(fmap) ) {
                //
                css_order[file] = {}
                let css_data = css_order[file]
                //
                let css_code = fdescr.style.trim()
                css_data.length = css_code.length
                css_data.concern = concern

                if ( css_code.length ) {
                    css_data.ast = csstree.parse(css_code);
                    css_data.top_down = this.css_surface_syntax.parse(css_code)
                    this.css_surface_syntax.infer_variables(css_data.top_down)
                }

                // count entries ???
                // repeated forms ???
                //
            }
        }

        let ckys = Object.keys(css_order)
        ckys.sort((ky1,ky2) => {
            let l1 = css_order[ky1].length
            let l2 = css_order[ky2].length
            return l1 - l2
        })
        //
        let final_css_order = {}
        for ( let cky of ckys ) {
            final_css_order[cky] = css_order[cky]
        }
        //
        this.css_order = final_css_order
    }


    /**
     * 
     */
    async script_analysis() {
        //
        for ( let [concern,fmap] of Object.entries(this.concerns_to_snippet_map_file) ) {
            let snippet_source_analysis = await fs.load_json_data_at_path("data/map_of_files.json")
            for ( let [file,fdescr] of Object.entries(fmap) ) {
                //
                this.script_order[file] = {}
                let script_data = this.script_order[file]
                //
                if ( fdescr.app_script ) {
                    //
                    let script_code = fdescr.app_script.trim()
                    script_data.length = script_code.length
                    script_data.concern = concern
                    //
                    if ( script_code.length ) {
                        script_data.info = new OneScriptDependencies(file,script_code,this.paths)
                        let ssa = structuredClone(snippet_source_analysis)
                        await script_data.info.set_alpha_source_analysis(ssa)
                        script_data.info.set_shared_func_diff_stats(this.func_alpha_staging_diffs)
                        script_data.info.set_func_usage_count(this.alpha_func_usage_count)
                        try {
                            await script_data.info.analyze_target_file()
                            script_data.info.find_functions_alpha_sources()
                            script_data.info.function_matching()
                            script_data.info.function_usage()
                        } catch (e) {
                            console.log(file,"\n",e)
                        }
                    }
                }
            }
        }
        //
    }




    /**
     * 
     */
    report_functions() {
        for ( let file in this.script_order ) {
            console.log(this.script_order[file].concern)
            console.log(file,this.script_order[file].length)
            let func_names_repot = Object.keys(this.script_order[file].info.all_funcs)
            func_names_repot = func_names_repot.map((fname) => {
                let fdescr = this.script_order[file].info.all_funcs[fname]
                return `${fname}, ==>> ${fdescr.is_method ? "METHOD" : "FUNC"} :: ${fdescr.file}`
            })
            for ( let rep of func_names_repot ) {
                console.log('\t',rep)
            }
        }
    }

    
    async analysis() {
        //
        {
            this.css_analysis()
        }
        //
        {
            await this.script_analysis()
        }
        //
    }


    /**
     * 
     */
    report_on_analysis() {
        for ( let [concern,fmap] of Object.entries(this.concerns_to_snippet_map_file) ) {
            console.log(concern)
            for ( let [file,fdescr] of Object.entries(fmap) ) {
                let n = this.css_order[file].length
                console.log("css",`\t${file}\t${n}`)
            }
        }
        //
        console.log("------------------------------------------------------")
        //
        for ( let file in this.css_order ) {
            console.log("css",file,this.css_order[file].length)
        }
        //
        console.log("------------------------------------------------------")
        //

        let special_targets = [
            '/home/richard/GitHub/alphas/websites/villa-family/staging/index.html',
            '/home/richard/GitHub/alphas/websites/copious/staging/index.html',
            '/home/richard/GitHub/alphas/websites/bakersfield-robots/staging/index.html',
            '/home/richard/GitHub/alphas/websites/docs.copious.world/staging/index.html',
            '/home/richard/GitHub/alphas/websites/shops.copious.world/staging/index.html'
        ]

        let n = special_targets.length
        for ( let i = 1; i < n; i++ ) {
            console.log(this.css_order[special_targets[i]].length - this.css_order[special_targets[i-1]].length)
        }

        for ( let i = n-1; i > 0 ; i-- ) {
            let file = special_targets[i]
            let descr1 = this.css_order[file]
            let descr2 = this.css_order[special_targets[i-1]]
            console.log(descr1.concern,descr2.concern)
            //
            //
            console.log(descr1.length - descr2.length)
            let concern_data = this.concerns_to_snippet_map_file[descr1.concern]
            // 
            console.log(concern_data[file].style.substring(descr2.length))
            console.log("------------------------------------------------------")
        }

        // special
        {
            let descr = this.css_order['/home/richard/GitHub/alphas/websites/shops.copious.world/staging/index.html']
            console.log("TRIMMED-------")
            console.log(descr.top_down.trimmed)
            fs.write_out_pretty_json("css.tmp",descr.top_down.vars_classified,2)
        }

        console.log("REPORT ON FUNCTIONS")
        this.report_functions()

        this.fos.write_out_pretty_json("./data/alpha_staging_diffs.json",this.func_alpha_staging_diffs,4)

        this.fos.write_out_pretty_json("./data/alpha_usage_count.json",this.alpha_func_usage_count,4)

    }


    /**
     * 
     * @param {*} max_chars 
     */
    report_on_loaded_files(max_chars = 16) {
        for ( let [concern,fmap] of Object.entries(this.concerns_to_snippet_map_file) ) {
            console.log(concern)
            for ( let [file,fdescr] of Object.entries(fmap) ) {
                console.log(`\t${file}\t${fdescr.header.substring(0,max_chars)}`)
            }
        }
    }




    has_diffs(o1,o2) {
        return true
    }

    async apply(method,args) {
        switch (method) {
            case "get_subsitutions_map" : {
                
            }
            case "save_subsitutions_map" : {
            
            }
        }
        return false
    }

}


module.exports = SnippetFinder