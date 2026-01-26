
const ParseUtils = require('./utils.js')

let basic_ex_colors = 
`
black 	#000000 	
silver 	#c0c0c0 	
gray 	#808080 	
white 	#ffffff 	
maroon 	#800000 	
red 	#ff0000 	
purple 	#800080 	
fuchsia #ff00ff 	
green 	#008000 	
lime 	#00ff00 	
olive 	#808000 	
yellow 	#ffff00 	
navy 	#000080 	
blue 	#0000ff 	
teal 	#008080 	
aqua 	#00ffff
aliceblue       #f0f8ff 	
antiquewhite 	#faebd7 	
aqua 	    #00ffff 	
aquamarine 	#7fffd4 	
azure 	#f0ffff 	
beige 	#f5f5dc 	
bisque 	#ffe4c4 	
black 	#000000 	
blanchedalmond 	#ffebcd 	
blue 	#0000ff 	
blueviolet 	#8a2be2 	
brown 	#a52a2a 	
burlywood 	#deb887 	
cadetblue 	#5f9ea0 	
chartreuse 	#7fff00 	
chocolate 	#d2691e 	
coral 	#ff7f50 	
cornflowerblue 	#6495ed 	
cornsilk 	#fff8dc 	
crimson 	#dc143c 	
cyan        #00ffff
darkblue 	#00008b 	
darkcyan 	#008b8b 	
darkgoldenrod 	#b8860b 	
darkgray 	#a9a9a9 	
darkgreen 	#006400 	
darkgrey 	#a9a9a9 	
darkkhaki 	#bdb76b 	
darkmagenta 	#8b008b 	
darkolivegreen 	#556b2f 	
darkorange 	#ff8c00 	
darkorchid 	#9932cc 	
darkred 	#8b0000 	
darksalmon 	#e9967a 	
darkseagreen 	#8fbc8f 	
darkslateblue 	#483d8b 	
darkslategray 	#2f4f4f 	
darkslategrey 	#2f4f4f 	
darkturquoise 	#00ced1 	
darkviolet 	#9400d3 	
deeppink 	#ff1493 	
deepskyblue 	#00bfff 	
dimgray 	#696969 	
dimgrey 	#696969 	
dodgerblue 	#1e90ff 	
firebrick 	#b22222 	
floralwhite 	#fffaf0 	
forestgreen 	#228b22 	
fuchsia 	#ff00ff 	
gainsboro 	#dcdcdc 	
ghostwhite 	#f8f8ff 	
gold 	#ffd700 	
goldenrod 	#daa520 	
gray 	#808080 	
green 	#008000 	
greenyellow 	#adff2f 	
grey 	#808080 (synonym of gray) 	
honeydew 	#f0fff0 	
hotpink 	#ff69b4 	
indianred 	#cd5c5c 	
indigo 	#4b0082 	
ivory 	#fffff0 	
khaki 	#f0e68c 	
lavender 	#e6e6fa 	
lavenderblush 	#fff0f5 	
lawngreen 	#7cfc00 	
lemonchiffon 	#fffacd 	
lightblue 	#add8e6 	
lightcoral 	#f08080 	
lightcyan 	#e0ffff 	
lightgoldenrodyellow 	#fafad2 	
lightgray 	#d3d3d3 	
lightgreen 	#90ee90 	
lightgrey 	#d3d3d3 	
lightpink 	#ffb6c1 	
lightsalmon 	#ffa07a 	
lightseagreen 	#20b2aa 	
lightskyblue 	#87cefa 	
lightslategray 	#778899 	
lightslategrey 	#778899 	
lightsteelblue 	#b0c4de 	
lightyellow 	#ffffe0 	
lime 	#00ff00 	
limegreen 	#32cd32 	
linen 	#faf0e6 	
magenta	#ff00ff
maroon 	#800000 	
mediumaquamarine 	#66cdaa 	
mediumblue 	#0000cd 	
mediumorchid 	#ba55d3 	
mediumpurple 	#9370db 	
mediumseagreen 	#3cb371 	
mediumslateblue 	#7b68ee 	
mediumspringgreen 	#00fa9a 	
mediumturquoise 	#48d1cc 	
mediumvioletred 	#c71585 	
midnightblue 	#191970 	
mintcream 	#f5fffa 	
mistyrose 	#ffe4e1 	
moccasin 	#ffe4b5 	
navajowhite 	#ffdead 	
navy 	#000080 	
oldlace 	#fdf5e6 	
olive 	#808000 	
olivedrab 	#6b8e23 	
orange 	#ffa500 	
orangered 	#ff4500 	
orchid 	#da70d6 	
palegoldenrod 	#eee8aa 	
palegreen 	#98fb98 	
paleturquoise 	#afeeee 	
palevioletred 	#db7093 	
papayawhip 	#ffefd5 	
peachpuff 	#ffdab9 	
peru 	#cd853f 	
pink 	#ffc0cb 	
plum 	#dda0dd 	
powderblue 	#b0e0e6 	
purple 	#800080 	
rebeccapurple 	#663399 	
red 	#ff0000 	
rosybrown 	#bc8f8f 	
royalblue 	#4169e1 	
saddlebrown 	#8b4513 	
salmon 	#fa8072 	
sandybrown 	#f4a460 	
seagreen 	#2e8b57 	
seashell 	#fff5ee 	
sienna 	#a0522d 	
silver 	#c0c0c0 	
skyblue 	#87ceeb 	
slateblue 	#6a5acd 	
slategray 	#708090 	
slategrey 	#708090 	
snow 	#fffafa 	
springgreen 	#00ff7f 	
steelblue 	#4682b4 	
tan 	#d2b48c 	
teal 	#008080 	
thistle 	#d8bfd8 	
tomato 	#ff6347
transparent 	#0000000
turquoise 	#40e0d0 	
violet 	#ee82ee 	
wheat 	#f5deb3 	
white 	#ffffff 	
whitesmoke 	#f5f5f5
yellow 	#ffff00 	
yellowgreen 	#9acd32
`

let g_color_names = (() => {
    let clines = basic_ex_colors.split('\n')
    let all_names = []
    for ( let line of clines ) {
        line = line.trim()
        if ( line.length ) {
            line = line.replace(/\s+/g,' ')
            line = line.split(' ')
            let name = line[0].trim()
            if ( all_names.indexOf(name) < 0 ) {
                all_names.push(name)
            }
        }
    }
    return all_names
})()

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

let g_css_variable_groups = {
    ":root" : {
        "--primary-color": "#3498db",
        "--fill-lower-border-color" : "darkred",
        "--item-background-color": "linear-gradient(to right, rgba(242, 242, 250, 0.3), white )",
        "--item-text-color" : "#171e42"
    }
}

/**
 * classname : CSSSurfaceTree
 * 
 * 
 */
class CSSSurfaceTree {

    constructor() {
        this.putils = new ParseUtils()
        this.css_variable_groups = structuredClone(g_css_variable_groups)

        this.hex_recognizer = /#([0-9a-fA-F]{6,8})/
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


    /**
     * 
     * @param {string} var_fodder 
     * @returns {string}
     */
    cleanup(var_fodder) {
        let vf = var_fodder.trim()
        vf = vf.replace(/\s+/g,'_')
        vf = vf.replace(/\W/g,"")
        return vf
    }


    // ---- ---- ---- ---- ---- ---- ----

    /**
     * 
     * @param {string} cssdef 
     * @param {number} i 
     * @returns {pair}
     */
    seek_colon(cssdef,i) {
        let n = cssdef.length
        let j = i
        let usage = ""
        while ( j < n ) {
            let c = cssdef[j]
            if ( c === ':' ) {
                break;
            } else {
                if ( /\w/.test(c) ) {
                    usage += c
                }
            }
            j++
        }
        return [usage,j-i]
    }

    /**
     * 
     * @param {string} cssdef 
     * @param {number} i 
     * @returns {string|boolean}
     */
    get_start_hex(cssdef,i) {
        let chck = cssdef.substring(i,i+10)
        let did_chck = this.hex_recognizer.exec(chck)
        if ( did_chck ) {
            return did_chck[0]
        }
        return false
    }


    next_css_def(str,i) {
        // 

        let defstr = ""
        let j = i

        let brc = str.indexOf("{",i)
        if ( brc < 0 ) return false
        let prefix = str.substring(i,brc)
        let rest = str.substring(brc)

        let defbody = this.putils.extract_nested(rest,"{","}")

        defstr += prefix + defbody

        return {
            "length" : defstr.length,
            "i" : j,
            "str" : defstr.trim()
        }
    }

    /**
     * 
     * @param {string} defs_string 
     */
    * find_sub_css_defs(defs_string) {
        //
        let str = defs_string.trim()
        let n = str.length
        let i = 0
        while ( i < n ) {
            let def = this.next_css_def(str,i)
            if ( def ) {
                i += def.length
                yield def
            } else break
        }
        //
    }


    // ---- ---- ---- ---- ---- ---- ----

    is_gradient_definition(cssdef,i) {
        let end_of_def = cssdef.indexOf(';',i)
        let maybe_grad_txt = (end_of_def > 0) ? cssdef.substring(i,end_of_def) : cssdef.substring(i)
        if ( maybe_grad_txt.length ) {
            if ( maybe_grad_txt.indexOf('gradient') >= 0 ) return true
        }
        return false
    }

    named_color(cword) {
        if ( g_color_names.indexOf(cword) >= 0 ) {
            return true
        }
        return false
    }

    // ---- ---- ---- ---- ---- ---- ----
    //
    
    /**
     * 
     * (AI assist)
     * @param {string} cssdef 
     * @param {number} i 
     * @returns {string} -- first alpha word of the string
     */
    extract_word(cssdef,i) {
        const match = cssdef.substring(i).match(/^[a-zA-Z]+/);
        // If a match is found, return it. Otherwise, return an empty string or null.
        return match ? match[0] : '';
    }

    /**
     * Same for both rbg and rbga
     * 
     * @param {string} cssdef 
     * @param {number} i 
     * @returns {string}
     */
    extract_rgb_parameters(cssdef,i) {
        let str = cssdef.substring(i,cssdef.lastIndexOf(')')+1)
        let params = this.putils.extract_nested(str,'(',')')
        return params
    }
    
    /**
     * 
     * @param {string} cssdef 
     * @param {number} i 
     */
    extract_gradient(cssdef,i = 0) {
        let nextsemi = cssdef.indexOf(';',i)
        let predef = nextsemi > 0 ? cssdef.substring(i,nextsemi) : cssdef.substring(i)

        let pari = predef.indexOf('(')
        //
        let parstart = predef.substring(pari)
        predef = predef.substring(0,pari)
        let params = this.putils.extract_nested(parstart,'(',')')
        return predef + params
    }


    extract_gradient2(cssdef) {

        let pari = cssdef.indexOf('(')
        //
        let parstart = cssdef.substring(pari)
        let predef = cssdef.substring(0,pari)

        let offset = cssdef.indexOf(predef)

        let params = this.putils.extract_nested(parstart,'(',')')
        return [offset,predef + params]
    }



    color_cases(str) {
        if ( this.is_gradient_definition(str) ) {
            let [offset,gradient_def] = this.extract_gradient2(str)
            return {
                "name" : gradient_def,
                "index" : offset,
                "length" : gradient_def.length
            }
        } else if ( str.indexOf('rgb') >= 0 ) {
            let offset = str.indexOf('rgb')
            if ( str.indexOf('rgba') >= 0 ) {
                let rgba_parameters = this.extract_rgb_parameters(str,4)
                let rgba_def = `rgba${rgba_parameters}`
                return({
                    "name" : rgba_def,
                    "index" : offset,
                    "length" : rgba_def.length
                })
            } else {
                let rgb_parameters = this.extract_rgb_parameters(str,3)
                let rgb_def = `rgba${rgb_parameters}`
                return({
                    "name" : rgb_def,
                    "index" : offset,
                    "length" : rgb_def.length
                })
            }
        } else if ( str.indexOf('#') >= 0) {
            let offset = str.indexOf('#')
            let hexvalue = this.get_start_hex(str,offset)
            if ( hexvalue ) {
                return({
                    "name" : hexvalue,
                    "index" : offset,
                    "length" : hexvalue.length
                })
            }
        } else {
            let color_name = this.extract_word(str)
            if ( this.named_color(color_name) ) {
                return ({
                    "name" : color_name,
                    "index" : 0,
                    "length" : color_name.length
                })
            }
        }
        return false 
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



    /**
     * 
     * (generated by AI)
     * 
     * @param {string} originalString
     * @param {number} start
     * @param {number} deleteCount
     * @param {string} newSubstr
     * @returns {string}
     */
    stringSplice(originalString, start, deleteCount, newSubstr = '') {
        // 1. Convert the string to an array of characters
        // Using Array.from() is more Unicode-aware than split('')
        const arr = Array.from(originalString);

        // 2. Use the standard Array.prototype.splice() method
        // start: Index at which to start changing the array
        // deleteCount: Number of elements to remove
        // newSubstr: The elements to add, if any (must be spread if it's a string)
        if (newSubstr !== '') {
            arr.splice(start, deleteCount, ...Array.from(newSubstr));
        } else {
            arr.splice(start, deleteCount);
        }

        // 3. Join the array back into a string
        return arr.join('');
    }



    /**
     * 
     * @param {string} cssdef 
     * @param {number} offset 
     * @returns {Array}
     */
    locate_colors(field_defs) {
        let color_list = []
        field_defs = field_defs.replace('}','').trim().split(';')
        let targets = field_defs.map((el,index) => {
            if ( el.length > 0 && el.indexOf(':') > 0 ) {
                let parts = el.trim().split(':')
                parts = parts.map((el) => { return el.trim()})
                return { "check" : true, "i" : index, "parts" : parts }
            } else {
                return { "check" : false, "i" : index, "def"  : el }
            }
        })
        //
        for ( let target of targets ) {
            if ( target.check ) {
                let parts = target.parts
                target.useage = parts[0]
                target.value = parts[1]
                delete target.parts
                target.color = this.color_cases(parts[1])
            }
        }
        
        for ( let i = 0; i < targets.length; i++ ) {
            let target = targets[i]
            if ( target.check && target.color ) {
                target.make_var = true
                let varsub = `var(--$$PLACE_VAR_HERE$$)`
                target.original_value = target.value
                target.value = this.stringSplice(target.value,target.color.index,target.color.length,varsub)
            } else {
                target.make_var = false
            }
            //
            color_list.push(target)
        }

        return color_list
    }

    reduce_fodder(var_fodder) {
        let vf = this.cleanup(var_fodder)
        return vf.substring(0,Math.min(20,vf.length))
    }

    eliminate_overlap(rvf,print_ky) {
        if ( rvf.indexOf(print_ky) === 0 ) {
            return ""
        }
        for ( let i = 0; i < print_ky.length; i++ ) {
            if ( rvf[i] !== print_ky[i] ) {
                return print_ky.substring(i)
            }
        }
        return print_ky
    }

    make_def_abstraction(b,cssdef,vname_keys,all_vars) {
        let [flag,ky] = vname_keys

        let var_fodder = cssdef.substring(0,cssdef.indexOf('{'))

        let print_ky = this.cleanup(ky)

        let varstem = `${flag}${b}_`
//
// console.log("1",varstem)
// console.log("2",var_fodder)
// console.log(cssdef)
// console.log("--------------------------------------------------------------------------")

        let def_lines = this.locate_colors(cssdef.substring(var_fodder.length + 1).trim())

        let final_def = ""

        for ( let df of def_lines ) {
            if ( df.make_var ) {
                let rvf = this.reduce_fodder(var_fodder)
                //
                print_ky = this.eliminate_overlap(rvf,print_ky)
                //
                let vname = varstem + print_ky + rvf + df.useage

                if ( df.color.name.indexOf("-webkit") === 0 ) {
                    vname += "_wk"
                }
                vname = vname.replace('-','_')

                all_vars[`--${vname}`] = df.color.name
                let value = df.value.replace("$$PLACE_VAR_HERE$$",vname)
                final_def += `\t${df.useage}: ${value};\n`
            } else {
                if ( df.useage && (df.value !== undefined) ) {
                    final_def += `\t${df.useage}: ${df.value};\n`
                } else {
                    final_def += df.def
                }
            }
        }

        let final = var_fodder + '{\n' + final_def + '}\n'
        return final
    }



    look_for_base_color(cssdef) {
        for ( let cname of g_color_names ) {
            if ( cssdef.indexOf(cname) > 0 ) {
                return true
            }
        }
        return false
    }



    has_color_use(cssdef) {
        if ( cssdef.indexOf('#')  > 0 ) {
            return true
        } else if ( cssdef.indexOf('color') >= 0 ) {
            return true
        } else if ( cssdef.indexOf('gradient') > 0 ) {
            return true
        } else if ( cssdef.indexOf('rgb') > 0 ) {
            return true
        } else if ( this.look_for_base_color(cssdef) ) {
            return true
        }
        return false
    }


    /**
     * 
     * @param {object} all_vars 
     * @returns {object}
     */
    sort_by_values(all_vars) {
        //
        let kys = Object.keys(all_vars)
        kys.sort((k1,k2) => {
            let v1 = all_vars[k1]
            let v2 = all_vars[k2]
            if ( v1 > v2 ) {
                return 1
            } else if ( v2 > v1 ) {
                return -1
            }
            return 0
        })
        //
        let newtable = {}
        for ( let ky of kys ) {
            newtable[ky] = all_vars[ky]
        }
        return newtable
    }

    /**
     * 
     * @param {object} css_data 
     */
    infer_variables(css_data) {
        let classified = structuredClone(css_data.classified)
        //
        let batches = [
            classified.classified.element,
            classified.classified.identified,
            classified.classified.class,
            classified.classified.control
        ]
        let flags = ["el", "id", "cl", "ctrl"]
        //
        let all_vars = {}
        //
        for ( let k = 0; k < 4; k++ ) {
            let batch = batches[k]
            let flag = flags[k]
            for ( let ky in batch ) {
                let list = batch[ky].list
                let b = 0
                for ( let i = 0; i < list.length; i++ ) {
                    let cssdef = list[i]
                    if ( this.has_color_use(cssdef) ) {
                        cssdef = this.make_def_abstraction(++b,cssdef,[flag,ky],all_vars)
                        list[i] = cssdef
                    }
                }
            }
        }
        //
        let all_vars_sorted = this.sort_by_values(all_vars)
        //
        return {all_vars, all_vars_sorted, classified}
    }


    generate_css_pages() {
        // by this point the css group has been defined 
        // and constants have been automatically extracted where ever possible
        let style_sheet = ""
        for ( let ky in this.css_variable_groups ) {
            style_sheet += ky + " {\n"
            let group_vars = this.css_variable_groups[ky]
            for ( let pvar in group_vars ) {
                style_sheet += `\t${pvar}: ${group_vars[pvar]};\n`
            }
        }
        style_sheet += '}\n\n'
    }

}


/*

:root {
    --primary-color: #3498db;
    --fill-lower-border-color : darkred;
    --item-background-color: linear-gradient(to right, rgba(242, 242, 250, 0.3), white );
    --item-text-color : navy;
}


*/

module.exports = CSSSurfaceTree