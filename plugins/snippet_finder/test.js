

const SnippetFinder = require('./index.js')



let conf = {
    "@target" : "templates/",
    "inputs" : {
        "path_abreviations" : {
            "[websites]" : "[alphas]/websites",
            "[alphas]" : "[github]/alphas",
            "[alpha-copious]" : "[alphas]/alpha-copious",
            "[github]" : "~/GitHub/",
            "[skeletons]" : "[alpha-copious]/pre-template",
            "[names]" : "[alpha-copious]/name-drops"
        }
    },
    "ext_default_dirs" : {
        "tmplt" : "[alpha-copious]/html",
        "js" : "[alpha-copious]/client",
        "svg" : "[alpha-copious]/icons"
    },
    "top_dir_locations" : {
        "script" : "[alpha-copious]/client",
        "alt-script" : "[alpha-copious]/script",
        "for-humans" : "[alpha-copious]/for-humans",
        "html" : "[alpha-copious]/html",
        "css" : "[alpha-copious]/css",
        "icons" : "[alpha-copious]/icons",
        "names" : "[alpha-copious]/name-drops"
    },
    "concerns" : {
        "copious" : {},
        "popsong" : {},
        "villa-family" : {},
        "bakersfield-robots": {},
        "docs.copious.world": {},
        "shops.copious.world": {},
        "shops.for-humans.net": {}
    }

}





let snippeter = new SnippetFinder(conf)

async function main(a_snippeter) {
    //
    await a_snippeter.init()
    a_snippeter.process_parts()
    await a_snippeter.analysis()
    a_snippeter.report_on_analysis()
    //
}


main(snippeter)
