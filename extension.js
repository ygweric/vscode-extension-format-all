// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

async function saveAllFiles(args) {
  openAndFormatAllFiles(args, "workbench.action.files.save");
}
async function formatAllFiles(args) {
  openAndFormatAllFiles(args, "editor.action.formatDocument");
}
async function openAndFormatAllFiles(args, codeCommond) {
  let uri, incomingPath;
  if (!args) {
    uri = vscode.workspace.workspaceFolders[0].uri;
    incomingPath = uri.fsPath;
  } else {
    incomingPath = args.fsPath;
    uri = vscode.Uri.file(incomingPath);
  }
  const configuration = vscode.workspace.getConfiguration(
    "open-all-files",
    uri
  );
  let glob = "*";
  const recurisve = configuration.get("recursive", false);
  if (recurisve) {
    glob += "*";
  }
  const findFiles = await vscode.workspace.findFiles(
    new vscode.RelativePattern(incomingPath, glob),
    vscode.workspace.getConfiguration(undefined, uri).get("files").exclude
  );
  const filesPaths = findFiles.map((file) => file.fsPath);
  if (filesPaths.length == 0) {
    vscode.window.showInformationMessage("No files found in folder.");
    return;
  }
  const maxFilesWithoutConfirmation = configuration.get(
    "maxFilesWithoutConfirmation",
    10
  );
  if (
    maxFilesWithoutConfirmation >= 0 &&
    filesPaths.length >= maxFilesWithoutConfirmation
  ) {
    await vscode.window
      .showWarningMessage(
        `Are you sure you want to open ${filesPaths.length} files at once?`,
        "Yes",
        "No"
      )
      .then(async (answer) => {
        if (answer == "Yes") {
          await openAll();
        }
      });
  } else {
    await openAll();
  }

  async function openAll() {
    const filesPathsSorted = filesPaths.sort();
    for (let i = 0; i < filesPathsSorted.length; i++) {
      await foramtFile(filesPathsSorted[i], codeCommond);
    }
  }
}

async function delay(ms) {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, ms);
  });
}

async function foramtFile(path, codeCommond) {
  await openFile(path);
  const uri = vscode.Uri.file(path);
  await vscode.commands
    // .executeCommand("editor.action.formatDocument", uri)
    // .executeCommand("editor.action.formatDocument", uri)
    .executeCommand(codeCommond, uri)
    .then(
      (data) => {
        console.log("success ", data, uri);
      },
      (_err) => {
        console.error(_err);
      }
    );
  await delay(100);
}

async function openFile(path) {
  const uri = vscode.Uri.file(path);
  //vscode.commands.executeCommand('vscode.open', uri);
  await vscode.workspace.openTextDocument(uri).then(
    (doc) => vscode.window.showTextDocument(doc, { preview: false }),
    (_err) => {
      console.error(_err);
    }
  );
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "format-all" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  //   let disposable = vscode.commands.registerCommand(
  //     "fomat-all.saveAllFiles",
  //     saveAllFiles
  //   );
  //   let disposable = vscode.commands.registerCommand(
  //     "fomat-all.formatAllFiles",
  //     formatAllFiles
  //   );

  context.subscriptions.push(
    vscode.commands.registerCommand("fomat-all.saveAllFiles", saveAllFiles)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("fomat-all.formatAllFiles", formatAllFiles)
  );
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
