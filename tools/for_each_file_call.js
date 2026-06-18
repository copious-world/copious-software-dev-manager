const fs = require('fs')
const { exec } = require('child_process')
const { promisify } = require('util')

// Convert exec into a promise-returning function
const execAsync = promisify(exec);


//
let src_dir = process.argv[2]
let cmd =  process.argv[3]
//
console.log("for_each_file_call:  ",cmd,src_dir)


async function main() {
    let files = fs.readdirSync(src_dir)
    let all_promises = []
    for ( let file of files ) {
        //
        let cmd = `terser ${src_dir}/${file} --compress --mangle --output ${src_dir}/${file}`
        all_promises.push(execAsync(cmd))
        console.log(cmd)
        //
    }

    await Promise.all(files)
}
main()
