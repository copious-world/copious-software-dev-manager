
const ParseUtils = require('./utils.js')

let g_element_order = [
    "*",
    "html",
    "body",
    "main",
    "footer",
    "section",
    "div",
    "span",
    "a",
    "button",
    "input",
    "textarea",
    "label"
]

/**
 * classname : CSSSurfaceTree
 * 
 * 
 */
class CSSSurfaceTree {

    constructor() {
        this.putils = new ParseUtils()
    }


    at_sections_coded(styles) {
        let at_parts = styles.split('@')
        let results = []
        results.push(at_parts.shift())
        for ( let at of at_parts ) {
            let closer_brace = this.putils.end_of_nested(at,'{','}')
            let pre_data = at.substring(0,closer_brace-1)
            let safe_data = this.putils.subst(pre_data,'}','&brc;')
            at = at.replace(pre_data,safe_data)
            results.push(at)
        }
        return results.join('@')
    }


    element_ordering(entry1,entry2) {
        let k1 = entry1.substring(0,entry1.indexOf(' '))
        let k2 = entry2.substring(0,entry2.indexOf(' '))
        k1 = k1.replace(',','')
        k2 = k2.replace(',','')

        let higher_class1 = "a"
        let colon_sep1 = k1.indexOf(':')
        let higher_class2 = "b"
        let colon_sep2 = k2.indexOf(':')
        if ( colon_sep1 > 0 ) {
            higher_class1 = k1.substring(0,colon_sep1)
        }
        if ( colon_sep2 > 0 ) {
            higher_class2 = k2.substring(0,colon_sep2)
        }
        if ( higher_class1 === higher_class2 ) {
            if ( k1 < k2 ) return -1
            else return 1
        }
        //
        // stems are different proceed normally except use the stem in any case
        if ( colon_sep1 > 0 ) { k1 = higher_class1 }
        if ( colon_sep2 > 0 ) { k2 = higher_class2 }
        //
        if ( k1 === k2 ) return 0
        let i1 = g_element_order.indexOf(k1)
        let i2 = g_element_order.indexOf(k2)
        //
        if ( (i1 < 0) && (i2 < 0) ) {
            if ( k1 < k2 ) return -1
            else return 1
        } else if ( i1 < 0 || i2 < 0 ) {
            return (i1 < 0) ? 1 : -1
        } else {
            return ((i1 < i2) ? -1 : 1)
        }
    }

    /**
     * 
     * @param {*} entry1 
     * @param {*} entry2 
     * @returns 
     */
    general_first(entry1,entry2) {
        let k1 = entry1.substring(0,entry1.indexOf(' '))
        let k2 = entry2.substring(0,entry2.indexOf(' '))
        k1 = k1.replace(',','')
        k2 = k2.replace(',','')
        //
        if ( k1 === k2 ) {
            let stem_k1 = entry1.substring(0,entry1.indexOf('{'))
            let stem_k2 = entry2.substring(0,entry2.indexOf('{'))
            let specializer_count1 = stem_k1.split(' ').length
            let specializer_count2 = stem_k2.split(' ').length
            if ( specializer_count1 === specializer_count2 ) return 0
            if ( specializer_count1 < specializer_count2 ) {
                return -1
            } else {
                return 1
            }
        } else {
            if ( k1 < k2 ) return -1
            else return 1
        }
    }


    /**
     * 
     * @param {*} entry_list 
     * @returns 
     */
    discover_classes(entry_list) {
        let classifcations = {}
        for ( let entry of entry_list ) {
            let prefix = entry.substring(0,entry.indexOf(' '))
            if ( prefix ) {
                //
                prefix = prefix.replace(/\d/g,'<i>')
                if ( prefix.indexOf(':') > 0 ) {
                    prefix = prefix.substring(0,prefix.indexOf(':'))
                }
                //
                if ( classifcations[prefix] ) {
                    classifcations[prefix].push(entry)
                } else {
                     classifcations[prefix] = [entry]
                }
                //
            } else {
                classifcations[entry] = classifcations[entry] ? classifcations[entry] : {}
            }
        }

        let singletons = []
        let ckeys = Object.keys(classifcations)
        let n = ckeys.length
        for ( let i = 0; i < n; i++ ) {
            let cky = ckeys[i]
            let data = classifcations[cky]
            if ( data.length === 1 ) {
                singletons.push(data[0])
                delete classifcations[cky]
            }
        }

        classifcations["singletons"] = singletons

        for ( let [prefix,clist] of Object.entries(classifcations) ) {
            //
//console.log(clist)
            clist.sort(this.general_first)
//console.log(clist)
            //
            let vcount = 0
            let collections = {}
            if ( prefix !== "singletons" ) {
                let n = clist.length
                if ( n > 2 ) {

                    if ( prefix.indexOf("<i>") > 0 ) {
                        for ( let i = 0; i < n; i++ ) {
                            let def_line = clist[i]
                            let lprefix = def_line.substring(0,def_line.indexOf('{')).trim()
                            let follow = false
                            if( lprefix.indexOf(' ') > 0 ) {
                                follow = lprefix.substring(lprefix.indexOf(' ')+1).trim()
                            }
                            lprefix = prefix + (follow ? ' ' + follow : "")
                            if ( collections[lprefix] === undefined ) {
                                collections[lprefix] = {}
                            }

                            let def_obj =  def_line.substring(def_line.indexOf('{')).trim()

                            let p = collections[lprefix][def_obj]
                            collections[lprefix][def_obj] = p ? p+1 : 1
                        }
                        vcount = Object.keys(collections).length
                    }

                } else vcount = 2
            }
            //
            classifcations[prefix] = {
                "list" : clist,
                "lsize" : clist.length,
                "variants" : ((prefix === "singletons") ? clist.length : vcount),
                "collections" : collections
            }
            //
        }

        return classifcations
    }


    classifier(processed_sections) {
        //
        let classes = {
            "line_count" : {
                "element"  : 0,
                "identified" : 0,
                "class" : 0,
                "control" : 0
            },
            "classified" : {
                "element"  : {},
                "identified" : {},
                "class" : {},
            },
            "element"  : [],
            "identified" : [],
            "class" : [],
            "control" : []
        }
        //
        for ( let sect of processed_sections ) {
            let str = sect.trim()
            if ( str[0] === '.' ) {
                classes.class.push(sect)
            } else if ( str[0] === '#' ) {
                classes.identified.push(sect)
            } else if ( str[0] === '@' ) {
                classes.control.push(sect)
            } else {
                classes.element.push(sect)
            }
        }
        //
        classes.line_count.element = classes.element.length
        classes.line_count.identified = classes.identified.length
        classes.line_count.class = classes.class.length
        classes.line_count.control = classes.control.length
        //
        classes.element = classes.element.map((entry) => {
            let str = this.putils.single_space_key(entry); return this.putils.fix_tabs_and_spaces(str)
        })
        classes.identified = classes.identified.map((entry) => {
            let str = this.putils.single_space_key(entry); return this.putils.fix_tabs_and_spaces(str)
        })
        classes.class = classes.class.map((entry) => {
            let str = this.putils.single_space_key(entry); return this.putils.fix_tabs_and_spaces(str)
        })
        classes.control = classes.control.map((entry) => {
            let str = this.putils.single_space_key(entry); return this.putils.fix_tabs_and_spaces(str)
        })
        //
        classes.element.sort(this.element_ordering)
        classes.identified.sort(this.general_first)
        classes.class.sort()
        //

        classes.classified.class = this.discover_classes(classes.class)
        classes.classified.identified = this.discover_classes(classes.identified)
        classes.classified.element = this.discover_classes(classes.element)
        //

        return classes
    }



    parse(styles) {
        let clear_styles = this.putils.clear_block_comments(styles)
        let timmed_lines = this.putils.remove_empty_lines(clear_styles.split('\n'))
        timmed_lines = this.putils.trim_line_ends(timmed_lines)

        let lcount = timmed_lines.length

        let cleaner = timmed_lines.join('\n')
        cleaner = this.at_sections_coded(cleaner)

        let sectioned = cleaner.split('}')
        let processed_sections = []
        let current_section = sectioned[0]
        for ( let i = 1; i < sectioned.length; i++ ) {
            let a_section = sectioned[i].trim()
            if ( a_section.length === 0 ) {
                current_section += "}"
            } else {
                processed_sections.push(current_section)
                current_section = a_section
            }
        }

        processed_sections = processed_sections.map((asection) => {
            asection = this.putils.subst(asection,'&brc;','}')
            return asection + "\n}"
        })

        let classifications = this.classifier(processed_sections)
        classifications.line_count.lines = lcount

        return({
            "raw" : clear_styles,
            "trimmed" : timmed_lines.join("\n"),
            "sectioned" : processed_sections,
            "classified" : classifications
        })
    }
}


module.exports = CSSSurfaceTree