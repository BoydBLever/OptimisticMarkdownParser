const blogpostMarkdown = `# control

*humans should focus on bigger problems*

## Setup

\`\`\`bash
git clone git@github.com:anysphere/control
\`\`\`

\`\`\`bash
./init.sh
\`\`\`

## Folder structure

**The most important folders are:**

1. \`vscode\`: this is our fork of vscode, as a submodule.
2. \`milvus\`: this is where our Rust server code lives.
3. \`schema\`: this is our Protobuf definitions for communication between the client and the server.

Each of the above folders should contain fairly comprehensive README files; please read them. If something is missing, or not working, please add it to the README!

Some less important folders:

1. \`release\`: this is a collection of scripts and guides for releasing various things.
2. \`infra\`: infrastructure definitions for the on-prem deployment.
3. \`third_party\`: where we keep our vendored third party dependencies.

## Miscellaneous things that may or may not be useful

##### Where to find rust-proto definitions

They are in a file called \`aiserver.v1.rs\`. It might not be clear where that file is. Run \`rg --files --no-ignore bazel-out | rg aiserver.v1.rs\` to find the file.

## Releasing

Within \`vscode/\`:

- Bump the version
- Then:

\`\`\`
git checkout build-todesktop
git merge main
git push origin build-todesktop
\`\`\`

- Wait for 14 minutes for gulp and ~30 minutes for todesktop
- Go to todesktop.com, test the build locally and hit release
`;

let currentContainer: HTMLElement | null = null; 
// Do not edit this method
function runStream() {
    currentContainer = document.getElementById('markdownContainer')!;

    // this randomly split the markdown into tokens between 2 and 20 characters long
    // simulates the behavior of an ml model thats giving you weirdly chunked tokens
    const tokens: string[] = [];
    let remainingMarkdown = blogpostMarkdown;
    while (remainingMarkdown.length > 0) {
        const tokenLength = Math.floor(Math.random() * 18) + 2;
        const token = remainingMarkdown.slice(0, tokenLength);
        tokens.push(token);
        remainingMarkdown = remainingMarkdown.slice(tokenLength);
    }

    const toCancel = setInterval(() => {
        const token = tokens.shift();
        if (token) {
            addToken(token);
        } else {
            clearInterval(toCancel);
        }
    }, 20);
}

// dont be afraid of using globals for state

/*YOUR CODE HERE
this does token streaming with no styling right now
your job is to write the parsing logic to make the styling work
 */
// function addToken(token: string) {
//     if(!currentContainer) return;

//     const span = document.createElement('span');
//     span.innerText = token;
//     currentContainer.appendChild(span);
// }

let isCodeBlock = false; // Indicates if currently parsing a code block
let isInlineCode = false; // Indicates if currently parsing an inline code block
let buffer = ''; // Buffer to accumulate text for current state

function addToken(token: string) {
    if (!currentContainer) return;

    // Combine token with buffer for easier processing
    buffer += token;

    // Process buffer for code blocks and inline code
    while (buffer.length > 0) {
        if (!isCodeBlock && !isInlineCode) {
            // Check if the buffer starts a code block or inline code
            if (buffer.startsWith('```')) {
                isCodeBlock = true;
                buffer = buffer.substring(3); // Remove the backticks
            } else if (buffer.startsWith('`')) {
                isInlineCode = true;
                buffer = buffer.substring(1); // Remove the backtick
            } else {
                // Output text until the next backtick or end of buffer
                let nextBacktick = buffer.indexOf('`');
                let text;
                if (nextBacktick !== -1) {
                    text = buffer.substring(0, nextBacktick);
                    buffer = buffer.substring(nextBacktick);
                } else {
                    text = buffer;
                    buffer = '';
                }
                appendText(text);
            }
        } else if (isCodeBlock) {
            // Handling for ending a code block
            let endCodeBlock = buffer.indexOf('```');
            if (endCodeBlock !== -1) {
                appendCodeBlock(buffer.substring(0, endCodeBlock));
                buffer = buffer.substring(endCodeBlock + 3); // Remove the ending backticks
                isCodeBlock = false;
            } else {
                appendCodeBlock(buffer);
                buffer = '';
            }
        } else if (isInlineCode) {
            // Handling for ending an inline code
            let endInlineCode = buffer.indexOf('`');
            if (endInlineCode !== -1) {
                appendInlineCode(buffer.substring(0, endInlineCode));
                buffer = buffer.substring(endInlineCode + 1); // Remove the ending backtick
                isInlineCode = false;
            } else {
                appendInlineCode(buffer);
                buffer = '';
            }
        }
    }
}

function appendText(text: string) {
    const span = document.createElement('span');
    span.innerText = text;
    if (currentContainer) currentContainer.appendChild(span);
}

function appendCodeBlock(text: string) {
    const pre = document.createElement('pre');
    pre.innerText = text;
    if (currentContainer) currentContainer.appendChild(pre);
}

function appendInlineCode(text: string) {
    const code = document.createElement('code');
    code.innerText = text;
    if (currentContainer) currentContainer.appendChild(code);
}
// Boyd Lever February 22 2024