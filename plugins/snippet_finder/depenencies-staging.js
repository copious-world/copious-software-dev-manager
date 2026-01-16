
const Walker = require('node-source-walk');
const unidiff = require('unidiff')
const ParseUtils = require('./utils')





const { execSync } = require('child_process');


// pygmentize -l diff -f html -O full -o file_diff.html

function pygmentizeSync(code, language, format = 'html') {
  // Pass the code via stdin to avoid command-line length limits or escaping issues
  const command = `pygmentize -l ${language} -f ${format} -O full`;

  try {
    // execSync runs the command and waits for it to complete
    const highlightedCode = execSync(command, {
      input: code,
      encoding: 'utf8',
      // Optional: Set a timeout to prevent the script from hanging indefinitely
      timeout: 5000 
    });
    return highlightedCode;
  } catch (error) {
    console.error(`Error during synchronous pygmentize execution: ${error.message}`);
    // You can choose to rethrow the error or return the original code
    throw error; 
  }
}


class OneScriptDependencies {

    constructor(target_file,src) {
        //
        this.all_funcs = {}
        this.all_calls = {}
        this.last_func_def = false
        this.last_func_def_type = "function"
        this.all_class_defs = {}
        //
        this.target_file = target_file
        this.src = src
        //
        this._noisy = false
        //
        this._snippet_source_info = false
        this._func_diff_stats = false
        this._func_usage_count = false

        this.putils = new ParseUtils()
    }

    //
    noisy_output(...args) {
        if ( this._noisy ) {
            console.log(...args)
        }
    }

    //
    noisy_object_output(obj) {
        if ( this._noisy ) {
            console.dir(obj)
        }
    }
    
    set_noisy(tf) {
        this._noisy = tf ? true : false
    }


    append_object_dots(the_obj,the_path) {
        if ( !the_obj ) return ""
        if ( the_path === undefined ) the_path = ""
        let object_path = ""
        if ( the_obj && the_obj.name === undefined ) {
            if ( the_obj.property && the_obj.property.name ) {
                the_path = "." + the_obj.property.name + the_path
                return this.append_object_dots(the_obj.object,the_path)
            }
        } else {
            object_path = the_obj.name + the_path
        }
        return object_path
    }



    /**
     * 
     */
    async analyze_target_file() {
        let src_lines = this.src.split("\n")
        //
        let walker = new Walker();
        //
        await walker.walk(this.src, node => {
            if (node.type !== undefined) {
                if ( node.type === "ClassDeclaration" ) {
                    //console.dir(node)
                    let extender = node.superClass
                    if ( extender ) {
                        extender = extender.name
                    } else extender = ""
                    this.noisy_output("ClassDeclaration",node.id.name,extender)
                    this.all_class_defs[node.id.name] = {
                        "is_subclass" : (extender.length > 0),
                        "depends_on" : ((extender.length > 0) ? {
                                                                    "class" : extender,
                                                                    "file" : "unknown"
                                                                } : "<base>"),
                        "file" : this.target_file
                    }
                } else {
                    switch ( node.type ) {
                        case "CallExpression" : {
                            //
                            //
                            let the_one_who_calls = this.last_func_def ? this.last_func_def : ""
                            let the_parent = node.parent
                            if ( Array.isArray(node.parent) ) {
                                the_parent = node
                            }
                            //
            //console.dir(node,{depth:3})
                            //
                            if ( this.last_func_def_type === "function" ) {
                                if ( typeof the_parent === "object"  && !(Array.isArray(the_parent))) {
                                    walker.moonwalk(the_parent,anode => {
                                        let a_line = parseInt(anode.loc.start.line)
                                        while ( a_line > 0 ) {
                                            a_line--
                                            let checker = src_lines[a_line]
                                            if ( checker.indexOf("function") >= 0 ) {
                                                let calling_def = checker.substring(checker.indexOf("function") + "function".length + 1,checker.indexOf("("))
                                                calling_def = calling_def.trim()
                                                the_one_who_calls = calling_def
                                                break
                                            }
                                        }
                                    })
                                } else {
                                    this.noisy_output("node.parent",node.parent)
                                }
                            }  
                            let call_ky = ""
                            let field_path = false
                            if ( node.callee ) {
                                if ( node.callee.name ) {
                                    call_ky = node.callee.name
                                    this.noisy_output("CallExpression:",node.callee.name)
                                } else if ( node.callee.object ) {
                                    if ( node.callee.object.name ) {
                                        call_ky = node.callee.object.name
                                        this.noisy_output("CallExpression:", node.callee.object.name, node.callee.property.name)                        
                                    } else {
                                        let object_path = this.append_object_dots(node.callee.object)
                                        call_ky = node.callee.property.name
                                        field_path = object_path
                                        this.noisy_output("CallExpression:", object_path, node.callee.property.name)                        
                                    }
                                }
                            } else {
                                this.noisy_object_output(node)
                            }

                            if ( call_ky && call_ky.length ) {
                                //
                                let call_def = this.all_calls[call_ky]
                                if ( call_def === undefined ) {
                                    call_def = {}
                                    this.all_calls[call_ky] = call_def
                                }
                                //
                                if ( typeof the_one_who_calls === "string" && the_one_who_calls.length ) {
                                    if ( typeof call_def.callers !== "object" ) {
                                        call_def.callers = {}
                                    }
                                    if ( typeof call_def.callers[the_one_who_calls] !== "object" ) {
                                        call_def.callers[the_one_who_calls] = {
                                            "def_file" : "unknown",
                                            "use_count" : 1,
                                            "o_path" : field_path
                                        }
                                    } else {
                                        call_def.callers[the_one_who_calls].use_count++
                                    }
                                    
                                    this.noisy_output(`\tcalled by ${the_one_who_calls}`)
                                }
                                //
                            }

                            break;
                        }
                        case "ClassMethod" : {
                            this.noisy_output("!! ClassMethod:",node.key.name)
                            let start = node.loc.start.line - 1
                            let end = node.loc.end.line + 1
                            let func_lines = src_lines.slice(start,end)
                            let source = func_lines.join("\n") // escodegen.generate(node.body);
                            this.all_funcs[node.key.name] = {
                                "depends_on" : {},
                                "file" : this.target_file,
                                "is_method" : true,
                                "source" : source
                            }
                            this.last_func_def = node.key.name
                            this.last_func_def_type = "method"
                            break;
                        }
                        case "FunctionDeclaration" : {
                            this.noisy_output("!! FunctionDeclaration:",node.id.name)
                            let start = node.loc.start.line - 1
                            let end = node.loc.end.line + 1
                            let func_lines = src_lines.slice(start,end)
                            let source = func_lines.join("\n") // escodegen.generate(node.body);
                            this.all_funcs[node.id.name] = {
                                "depends_on" : {},
                                "file" : this.target_file,
                                "is_method" : false,
                                "source" : source
                            }
                            this.last_func_def = node.id.name
                            this.last_func_def_type = "function"
                            break;
                        }                        
                        case "ArrowFunctionExpression" : {
                            break;
                        }
                    }
                }
            }
        });
    }


    /**
     * 
     */
    collect_dependencies() {
        //
        for ( let func in this.all_funcs ) {
            let fdef = this.all_funcs[func]
            for ( let [cky,callers] of Object.entries(this.all_calls) ) {
                if ( callers.callers !== undefined ) {
                    callers = callers.callers
                    if ( func in callers ) {
                        fdef.depends_on[cky] = callers[func].use_count
                    }
                } else {
                    callers.callers = { "_info" : "NO CALLERS" }
                }
            }
        }
        //
    }

    print_results() {

        // ALL FUNCTIONS
        console.dir(this.all_funcs)

        // ALL CALLS
        console.dir(this.all_calls,{depth:5})

        // ALL CLASS DEFS
        console.dir(this.all_class_defs,{depth:5})

    }

    list_funcs() {
        console.dir(this.all_funcs)
    }


    set_alpha_source_analysis(ssa) {
        //
        this._snippet_source_info = ssa
        //
    }

    set_shared_func_diff_stats(obj) {
        this._func_diff_stats = obj
    }

    set_func_usage_count(obj) {
        this._func_usage_count = obj
    }


    find_functions_alpha_sources() {
        //
        if ( typeof this.all_funcs === "object" && !(Array.isArray(this.all_funcs)) ) {
            //
            let func_file_map = this._snippet_source_info.funcs_to_file
            //
            for ( let ky of Object.keys(this.all_funcs)) {
                let descr = this.all_funcs[ky]
                if ( typeof descr === "string" ) {
                    console.log("STRING",ky,ky.length,descr)
                } else {
                    let func_name = ky
                    let src_f =  func_file_map[func_name]
                    if ( Array.isArray(src_f) ) {
                        descr.file = JSON.stringify(src_f)
                    } else {
                        descr.file = src_f ? src_f : "UNKNOWN"
                    }
                }
            }
            //
        } else {
            console.log("find_functions_alpha_sources ====> ",this.all_funcs)
        }
        //
    }


    /**
     * 
     */
    function_matching() {
        //
        if ( typeof this.all_funcs === "object" && !(Array.isArray(this.all_funcs)) ) {
            //
            let func_source_map = this._snippet_source_info.funcs_to_source
            if ( func_source_map ) {
                //
                for ( let ky of Object.keys(this.all_funcs)) {
                    let descr = this.all_funcs[ky]
                    if ( this._func_diff_stats === false ) {
                        this._func_diff_stats = {} // for testing
                    }
                    if ( this._func_diff_stats[ky] === undefined ) {
                        this._func_diff_stats[ky] = {}
                    }
                    if ( typeof descr === "string" ) {
                        console.log("STRING",ky,ky.length,descr)
                        this._func_diff_stats[ky][this.target_file] = { "_prp_comment" : `${ky}::${descr}` }
                    } else {
                        let staged_source = descr.source
                        //
                        let func_name = ky
                        if ( this._func_diff_stats[func_name]["_x_finals_only"] === undefined ) {
                            this._func_diff_stats[func_name]["_x_finals_only"] = {}
                        }
                        this._func_diff_stats[func_name]._x_finals_only[this.target_file] = staged_source
                        //
                        let src_f_obj = func_source_map[func_name]  // from the alpha
                        for ( let fsrc in src_f_obj  ) {        // one of the alpha sources that includes the function definition
                            if ( fsrc === "_x_finals_only" ) continue
                            let origin = src_f_obj[fsrc]
                            if ( origin === undefined ) {  // just in case
                                console.log(fsrc)
                                console.dir(src_f_obj[fsrc])
                                process.exit(0)
                            }
                            if ( typeof origin !== "string" ) {
console.log("NO SOURCE FOR FUNCTION: ",func_name,fsrc)
console.dir(origin)
                                continue
                            }
                            let stats = {}
                            //
                            let comps = this._func_diff_stats[func_name][fsrc]
                            if ( comps === undefined ) {
                                comps = {}
                                this._func_diff_stats[func_name][fsrc] = comps
                            }
                            if ( comps._x_patches === undefined ) {
                                comps._x_patches = {}
                                comps._x_origin = origin
                            }
                            comps[this.target_file] = stats     // the target file of this class instance has stats stored under an alpha
                            //
                            let staged_source_t = staged_source.trim()
                            let origin_t = origin.trim()

                            let staged_source_sans_comments = this.putils.clear_all_comments(staged_source_t)
                            let origin_sans_comments = this.putils.clear_all_comments(origin_t)

                            stats.size_dif = (staged_source_t.length - origin_t.length)
                            stats.same = (staged_source_t === origin_t) ? true : false
                            
                            stats.comment_free_size_dif = (staged_source_sans_comments.length - origin_sans_comments.length)
                            stats.comment_free_same = (staged_source_sans_comments === origin_sans_comments)
                            //
                            let staged_trimmed_lines = this.putils.trim_ends_and_empties(staged_source_sans_comments)
                            let origin_trimmed_lines = this.putils.trim_ends_and_empties(origin_sans_comments)
                            //
                            stats.trimmed_size_dif = (staged_trimmed_lines.length - origin_trimmed_lines.length)
                            stats.trimmed_same = (staged_trimmed_lines === origin_trimmed_lines)

                            if ( !(stats.trimmed_same) ) {
                                let diff = unidiff.diffLines(staged_trimmed_lines,origin_trimmed_lines)
                                let formatted_diff = unidiff.formatLines(diff)
                                stats.patch = formatted_diff
                                let pkey = this.putils.simpleHash(formatted_diff) 
                                stats.patch_key = pkey
                                //
                                let grouped_patches = comps._x_patches[pkey]
                                if ( grouped_patches === undefined ) {
                                    grouped_patches = {}
                                    comps._x_patches[pkey] = grouped_patches
                                }
                                //
                                if ( typeof grouped_patches.patch === "string" ) {
console.log(func_name,"repeat")
                                    stats.patch_display = pkey //grouped_patches.html
                                } else {
                                    //
                                    try {
                                        console.log("Formatting for:",func_name)
                                        const result = pygmentizeSync(formatted_diff, 'diff');
                                        stats.patch_display = result
                                    } catch (e) {
                                        stats.patch_display = "NO DISPLAY"
                                    }                                    
                                    grouped_patches.patch = formatted_diff
                                    grouped_patches.patch_display = stats.patch_display
                                    grouped_patches.stage_code = staged_source
                                }
                                //
                            } else {
                                stats.patch = "NOT APPLICABLE"
                            }
                            //
                        }
                    }
                }
                //
            }
        } else {
            console.log("find_functions_alpha_sources ====> ",this.all_funcs)
        }
        //   
    }


    function_usage() {
        // this._func_usage_count
        let func_source_map = this._snippet_source_info.funcs_to_file
        if ( typeof this.all_funcs === "object" && !(Array.isArray(this.all_funcs)) ) {
            if ( func_source_map ) {
                for ( let fky in func_source_map ) {
                    if ( this._func_usage_count[fky] === undefined ) {
                        this._func_usage_count[fky] = 0
                    }
                    if ( fky in this.all_funcs ) {
                        this._func_usage_count[fky]++
                    }
                }
            }
        }
    }

}



module.exports = OneScriptDependencies