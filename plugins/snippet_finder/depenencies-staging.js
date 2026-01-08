
const Walker = require('node-source-walk');



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
                            this.all_funcs[node.key.name] = {
                                "depends_on" : {},
                                "file" : this.target_file,
                                "is_method" : true
                            }
                            this.last_func_def = node.key.name
                            this.last_func_def_type = "method"
                            break;
                        }
                        case "FunctionDeclaration" : {
                            this.noisy_output("!! FunctionDeclaration:",node.id.name)
                            this.all_funcs[node.id.name] = {
                                "depends_on" : {},
                                "file" : this.target_file,
                                "is_method" : false
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


    async set_alpha_source_analysis(ssa) {
        //
        this._snippet_source_info = ssa
        //
    }


    find_functions_alpha_sources() {

//console.log("find_functions_alpha_sources",typeof this.all_funcs,Array.isArray(this.all_funcs))

        if ( typeof this.all_funcs === "object" && !(Array.isArray(this.all_funcs)) ) {

            let func_file_map = this._snippet_source_info.funcs_to_file

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

        } else {
            console.log("find_functions_alpha_sources ====> ",this.all_funcs)
        }

    }

}



module.exports = OneScriptDependencies