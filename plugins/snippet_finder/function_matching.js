const fs = require('fs');
const Walker = require('node-source-walk');
const escodegen = require('escodegen'); // A tool to generate code from AST

// Helper function to read and parse a file
function parseFile(filePath) {
    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    const walker = new Walker();
    // Use the internal parser to get the full AST
    const ast = walker.parse(sourceCode); 
    return ast;
}

// Helper function to find a specific function in an AST by name
function findFunction(ast, functionName) {
    let functionNode = null;
    const walker = new Walker();
    walker.walk(ast, node => {
        if (
            (node.type === 'FunctionDeclaration' && node.id && node.id.name === functionName) ||
            (node.type === 'VariableDeclarator' && node.id && node.id.name === functionName && (node.init.type === 'FunctionExpression' || node.init.type === 'ArrowFunctionExpression')) ||
            (node.type === 'Property' && node.key && node.key.name === functionName && (node.value.type === 'FunctionExpression' || node.value.type === 'ArrowFunctionExpression'))
        ) {
            functionNode = node;
            walker.stopWalking(); // Stop searching once found
        }
    });
    return functionNode;
}

// Main comparison logic
function compareFunctions(file1Path, file2Path, functionName) {
    const ast1 = parseFile(file1Path);
    const ast2 = parseFile(file2Path);

    const func1 = findFunction(ast1, functionName);
    const func2 = findFunction(ast2, functionName);

    if (!func1 || !func2) {
        console.error(`Error: Could not find function "${functionName}" in one or both files.`);
        return false;
    }

    // Convert function AST nodes back to source code for comparison
    const source1 = escodegen.generate(func1.body);
    const source2 = escodegen.generate(func2.body);

    if (source1 === source2) {
        console.log(`The function "${functionName}" is identical in both files.`);
        return true;
    } else {
        console.log(`The function "${functionName}" is different in the two files.`);
        // You can use a diff library for a more detailed comparison if needed
        return false;
    }
}

// Example usage (replace with your file paths and function name)
compareFunctions('./file1.js', './file2.js', 'myFunction');


