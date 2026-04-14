const vscode = require('vscode');

const activeStateByDocument = new Map();
const MAX_UNFOLD_DEPTH = 20;

function flattenSymbols(symbols, collection = []) {
  for (const symbol of symbols) {
    collection.push(symbol);
    if (symbol.children?.length) {
      flattenSymbols(symbol.children, collection);
    }
  }
}

function isFunctionSymbol(symbol) {
  return [
    vscode.SymbolKind.Function,
    vscode.SymbolKind.Method,
    vscode.SymbolKind.Constructor
  ].includes(symbol.kind);
}

function symbolContainsLine(symbol, line) {
  return symbol.range.start.line <= line && symbol.range.end.line >= line;
}

function findCurrentFunctionSymbol(symbols, cursorLine) {
  return symbols
    .filter((symbol) => isFunctionSymbol(symbol) && symbolContainsLine(symbol, cursorLine))
    .sort((a, b) => {
      const aSize = a.range.end.line - a.range.start.line;
      const bSize = b.range.end.line - b.range.start.line;
      return aSize - bSize;
    })[0];
}

async function toggleOnlyCurrentFunction() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const docKey = editor.document.uri.toString();
  const isActive = activeStateByDocument.get(docKey);

  if (isActive) {
    await vscode.commands.executeCommand('editor.unfoldAll');
    activeStateByDocument.delete(docKey);
    return;
  }

  const rawSymbols = await vscode.commands.executeCommand(
    'vscode.executeDocumentSymbolProvider',
    editor.document.uri
  );

  const symbols = [];
  if (Array.isArray(rawSymbols)) {
    flattenSymbols(rawSymbols, symbols);
  }
  const currentLine = editor.selection.active.line;
  const currentFunction = findCurrentFunctionSymbol(symbols, currentLine);

  if (!currentFunction) {
    vscode.window.showInformationMessage('Only Function: No function found at the cursor location.');
    return;
  }

  await vscode.commands.executeCommand('editor.unfoldAll');
  await vscode.commands.executeCommand('editor.foldAll');
  await vscode.commands.executeCommand('editor.unfold', {
    levels: MAX_UNFOLD_DEPTH,
    selectionLines: [currentFunction.range.start.line]
  });

  editor.revealRange(currentFunction.range, vscode.TextEditorRevealType.InCenter);
  activeStateByDocument.set(docKey, true);
}

function activate(context) {
  const disposable = vscode.commands.registerCommand('onlyFunction.toggle', toggleOnlyCurrentFunction);
  context.subscriptions.push(disposable);
}

function deactivate() {
  activeStateByDocument.clear();
}

module.exports = {
  activate,
  deactivate
};
