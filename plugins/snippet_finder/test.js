

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


// const { diff, styleText } = require('node:util'); // Import the function

// const actual = `
// async function postData(url = '', data = {}, creds = 'omit', do_stringify = true) {
//     // Default options are marked with *
// 	let options = {
// 		method: 'POST', // *GET, POST, PUT, DELETE, etc.
// 		mode: 'cors', // no-cors, *cors, same-origin
// 		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
// 		credentials: creds, // include, *same-origin, omit
// 		headers: {
// 			'Content-Type': content_type
// 		},
// 		redirect: 'follow', // manual, *follow, error
// 		referrerPolicy: 'no-referrer', // no-referrer, *client
// 		body: (do_stringify ? JSON.stringify(data)  : data)	// body data type must match "Content-Type" header
// 	}

//     const response = await fetch(url, options);
//     if ( response.ok == false ) {
//         console.log(response.status + ': ' + response.statusText)
//     }
//     return await response.json(); // parses JSON response into native JavaScript objects
// }
//  `


// const expected = `
// async function postData(url = '', data = {}, creds = 'omit', do_stringify = true, ctype) {
// 	let content_type = 'application/json'
// 	if ( ctype !== undefined ) {
// 		content_type = ctype            // ctype is content type
// 	}
// 	let options = {
// 		method: 'POST', // *GET, POST, PUT, DELETE, etc.
// 		mode: 'cors', // no-cors, *cors, same-origin
// 		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
// 		credentials: creds, // include, *same-origin, omit
// 		headers: {
// 			'Content-Type': content_type
// 		},
// 		redirect: 'follow', // manual, *follow, error
// 		referrerPolicy: 'no-referrer', // no-referrer, *client
// 		body: (do_stringify ? JSON.stringify(data)  : data)	// body data type must match "Content-Type" header
// 	}

// 	if ( ctype === 'multipart/form-data') {
// 		delete options.headers['Content-Type']  // content type will be set automatically with a boundary
// 	}

// 	// Default options are marked with *
// 	const response = await fetch(url, options);
// 	if ( response.ok == false ) {
// 		console.log(response.status + ': ' + response.statusText)
// 		return {}
// 	} else {
// 		return await response.json(); // parses JSON response into native JavaScript objects
// 	}
// }
// `

// const differences = diff(actual, expected);
// // Example output of differences:
// // [ [ -1, 'The' ], [ 1, 'A' ], [ 0, 'quick' ], [ -1, 'brown' ],
// //   [ 1, 'black' ], [ 0, 'fox' ], [ 0, 'jumps' ], [ 0, 'over' ],
// //   [ -1, 'the' ], [ 1, 'a' ], [ 0, 'lazy' ], [ -1, 'dog' ], [ 1, 'cat' ] ]

// console.log("Formatted Diff Output:");

// differences.forEach(([operation, value]) => {
//   if (operation === -1) {
//     // Deleted item, typically shown with a '-' and red color
//     console.log(styleText(['red'], `- ${value}`));
//   } else if (operation === 1) {
//     // Inserted item, typically shown with a '+' and green color
//     console.log(styleText(['green'], `+ ${value}`));
//   } else {
//     // Unchanged item, no prefix or color
//     console.log(`  ${value}`);
//   }
// });



// const unidiff = require('unidiff')

// let diff = unidiff.diffLines(actual,expected)
// let formatted_diff = unidiff.formatLines(diff)

// console.log(formatted_diff, {context: 2})



// console.log(require('unidiff').diffAsText(
//     'a quick\nbrown\nfox\njumped\nover\nthe\nlazy\ndog\n',
//     'a quick\nbrown\ncat\njumped\nat\nthe\nnot-so-lazy\nfox\n'
// ))
