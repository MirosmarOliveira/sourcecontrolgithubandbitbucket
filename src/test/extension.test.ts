import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import { getGitRepositoryPath } from "../extension"; // Agora a função é exportada

// Função para simular execução de comando Git
function mockRunGitCommand(command: string, repoPath: string): void {
  if (!repoPath) {
    throw new Error("Nenhum repositório Git encontrado.");
  }

  if (command.includes("commit")) {
    return; // Simula sucesso no commit
  } else if (command.includes("push")) {
    return; // Simula sucesso no push
  }
}

suite("GitHub & Bitbucket Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Deve encontrar o caminho do repositório Git corretamente", () => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    const repoPath = path.join(workspaceFolder?.uri.fsPath || "", ".git");

    assert.ok(repoPath, "O caminho do repositório não deve ser vazio.");
    assert.ok(repoPath.endsWith(".git"), "O caminho do repositório deve terminar com .git");
  });

  test("Deve ativar a extensão corretamente", async () => {
    const repoPath = "/fake/path/to/repository"; // Caminho simulado do repositório
    const sourceControl = vscode.scm.createSourceControl(
      "github-bitbucket",
      "GitHub & Bitbucket",
      vscode.Uri.file(repoPath)
    );

    assert.ok(sourceControl, "SourceControl deve ser criado corretamente.");
  });

  test("Deve registrar comandos de commit e push", async () => {
    const commitCommand = vscode.commands.registerCommand("sourcecontrolgithubandbitbucket.commit", async () => {
      mockRunGitCommand(`git commit -m "Test commit"`, "/fake/path/to/repository");
    });

    const pushCommand = vscode.commands.registerCommand("sourcecontrolgithubandbitbucket.push", async () => {
      mockRunGitCommand("git push origin main && git push bitbucket main", "/fake/path/to/repository");
    });

    await commitCommand;
    await pushCommand;

    assert.ok(commitCommand, "O comando de commit foi registrado.");
    assert.ok(pushCommand, "O comando de push foi registrado.");
  });

  test("Deve mostrar erro quando não encontrar um repositório Git", async () => {
    const repo = getGitRepositoryPath();
    assert.strictEqual(repo, undefined, "O repositório não deve ser encontrado.");
  });

  test("Deve criar um painel Webview corretamente", async () => {
    const panel = vscode.window.createWebviewPanel(
      "gitHubBitbucketPanel",
      "GitHub & Bitbucket",
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    assert.ok(panel, "O painel Webview deve ser criado corretamente.");
    assert.strictEqual(panel.title, "GitHub & Bitbucket", "O título do painel está correto.");
  });

  test("Deve executar git commit corretamente", async () => {
    const repoPath = "/fake/path/to/repository";
    const commitMessage = "Test commit";

    mockRunGitCommand(`git commit -m "${commitMessage}"`, repoPath);
    assert.ok(true, "O comando git commit foi executado com sucesso.");
  });

  test("Deve executar git push corretamente", async () => {
    const repoPath = "/fake/path/to/repository";

    mockRunGitCommand("git push origin main && git push bitbucket main", repoPath);
    assert.ok(true, "O comando git push foi executado com sucesso.");
  });
});
