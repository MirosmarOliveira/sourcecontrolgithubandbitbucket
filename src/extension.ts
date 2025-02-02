import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  vscode.window.registerTreeDataProvider(
    "githubBitbucketPanel",
    new GitHubBitbucketProvider()
  );
}

class GitHubBitbucketProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    return Promise.resolve([
      new vscode.TreeItem("Repositório GitHub"),
      new vscode.TreeItem("Repositório Bitbucket")
    ]);
  }
}

export function deactivate() {}
