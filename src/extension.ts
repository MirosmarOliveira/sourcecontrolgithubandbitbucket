import * as vscode from "vscode";
import * as path from "path";
import { exec } from "child_process";

// Classe para os itens da interface
class GitHubBitbucketItem extends vscode.TreeItem {
  constructor(label: string, command?: vscode.Command) {
    super(label, vscode.TreeItemCollapsibleState.None);
    if (command) {
      this.command = command;
    }
  }
}

// Classe principal para gerenciar a interface
class GitHubBitbucketDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event;

  commitMessage: string = "";
  githubBranch: string = "main";
  bitbucketBranch: string = "main";
  githubRepo: string = "";
  bitbucketRepo: string = "";

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.TreeItem[] {
    return [
      new GitHubBitbucketItem(`Commit Message: ${this.commitMessage || "(Digite a mensagem)"}`, {
        command: "sourcecontrolgithubandbitbucket.setCommitMessage",
        title: "Set Commit Message",
      }),
      new GitHubBitbucketItem("Commit", {
        command: "sourcecontrolgithubandbitbucket.commit",
        title: "Commit",
      }),
      new GitHubBitbucketItem(`GitHub Repo: ${this.githubRepo || "(Selecione o repositório GitHub)"}`, {
        command: "sourcecontrolgithubandbitbucket.setGitHubRepo",
        title: "Select GitHub Repo",
      }),
      new GitHubBitbucketItem(`Bitbucket Repo: ${this.bitbucketRepo || "(Selecione o repositório Bitbucket)"}`, {
        command: "sourcecontrolgithubandbitbucket.setBitbucketRepo",
        title: "Select Bitbucket Repo",
      }),
      new GitHubBitbucketItem(`GitHub Branch: ${this.githubBranch}`, {
        command: "sourcecontrolgithubandbitbucket.setGitHubBranch",
        title: "Select GitHub Branch",
      }),
      new GitHubBitbucketItem(`Bitbucket Branch: ${this.bitbucketBranch}`, {
        command: "sourcecontrolgithubandbitbucket.setBitbucketBranch",
        title: "Select Bitbucket Branch",
      }),
      new GitHubBitbucketItem("Push", {
        command: "sourcecontrolgithubandbitbucket.push",
        title: "Push",
      }),
    ];
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

// Obtém o caminho do repositório Git
export function getGitRepositoryPath(): string | undefined {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (workspaceFolder) {
    const repoPath = path.join(workspaceFolder.uri.fsPath, ".git");
    return path.dirname(repoPath);
  }
  return undefined;
}

// Executa comandos Git
function runGitCommand(command: string, repoPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: repoPath }, (err, stdout, stderr) => {
      if (err) {
        vscode.window.showErrorMessage(`Erro ao executar Git: ${stderr || err.message}`);
        reject(stderr || err.message);
      } else {
        vscode.window.showInformationMessage(`Git: ${stdout.trim()}`);
        resolve(stdout);
      }
    });
  });
}

// Ativa a extensão
export function activate(context: vscode.ExtensionContext) {
  const provider = new GitHubBitbucketDataProvider();
  vscode.window.registerTreeDataProvider("gitHubBitbucketView", provider);

  // Define a mensagem do commit
  context.subscriptions.push(
    vscode.commands.registerCommand("sourcecontrolgithubandbitbucket.setCommitMessage", async () => {
      const message = await vscode.window.showInputBox({
        prompt: "Digite a mensagem do commit",
        placeHolder: "Exemplo: Ajustes no layout",
      });

      if (message !== undefined) {
        provider.commitMessage = message;
        provider.refresh();
      }
    })
  );

  // Define o repositório do GitHub
  context.subscriptions.push(
    vscode.commands.registerCommand("sourcecontrolgithubandbitbucket.setGitHubRepo", async () => {
      const repoUrl = await vscode.window.showInputBox({
        prompt: "Digite a URL do repositório GitHub",
        placeHolder: "Exemplo: https://github.com/username/repository.git",
      });

      if (repoUrl) {
        provider.githubRepo = repoUrl;
        provider.refresh();
      }
    })
  );

  // Define o repositório do Bitbucket
  context.subscriptions.push(
    vscode.commands.registerCommand("sourcecontrolgithubandbitbucket.setBitbucketRepo", async () => {
      const repoUrl = await vscode.window.showInputBox({
        prompt: "Digite a URL do repositório Bitbucket",
        placeHolder: "Exemplo: https://bitbucket.org/username/repository.git",
      });

      if (repoUrl) {
        provider.bitbucketRepo = repoUrl;
        provider.refresh();
      }
    })
  );

  // Define a branch do GitHub
  context.subscriptions.push(
    vscode.commands.registerCommand("sourcecontrolgithubandbitbucket.setGitHubBranch", async () => {
      const repoPath = getGitRepositoryPath();
      if (!repoPath) {
        vscode.window.showErrorMessage("Nenhum repositório Git encontrado.");
        return;
      }

      exec("git branch --remote", { cwd: repoPath }, async (err, stdout) => {
        if (err) {
          vscode.window.showErrorMessage("Erro ao listar branches.");
          return;
        }

        const branches = stdout
          .split("\n")
          .map((b) => b.trim().replace("origin/", ""))
          .filter((b) => b.length > 0);

        const selectedBranch = await vscode.window.showQuickPick(branches, {
          placeHolder: "Escolha a branch do GitHub",
        });

        if (selectedBranch) {
          provider.githubBranch = selectedBranch;
          provider.refresh();
        }
      });
    })
  );

  // Define a branch do Bitbucket
  context.subscriptions.push(
    vscode.commands.registerCommand("sourcecontrolgithubandbitbucket.setBitbucketBranch", async () => {
      const repoPath = getGitRepositoryPath();
      if (!repoPath) {
        vscode.window.showErrorMessage("Nenhum repositório Git encontrado.");
        return;
      }

      exec("git branch --remote", { cwd: repoPath }, async (err, stdout) => {
        if (err) {
          vscode.window.showErrorMessage("Erro ao listar branches.");
          return;
        }

        const branches = stdout
          .split("\n")
          .map((b) => b.trim().replace("origin/", ""))
          .filter((b) => b.length > 0);

        const selectedBranch = await vscode.window.showQuickPick(branches, {
          placeHolder: "Escolha a branch do Bitbucket",
        });

        if (selectedBranch) {
          provider.bitbucketBranch = selectedBranch;
          provider.refresh();
        }
      });
    })
  );

  // Comando de Commit
  context.subscriptions.push(
    vscode.commands.registerCommand("sourcecontrolgithubandbitbucket.commit", async () => {
      const repoPath = getGitRepositoryPath();
      if (!repoPath) {
        vscode.window.showErrorMessage("Nenhum repositório Git encontrado.");
        return;
      }

      if (!provider.commitMessage) {
        vscode.window.showErrorMessage("Digite uma mensagem de commit antes de confirmar.");
        return;
      }

      try {
        await runGitCommand(`git add . && git commit -m "${provider.commitMessage}"`, repoPath);
        vscode.window.showInformationMessage(`✅ Commit realizado: "${provider.commitMessage}"`);
      } catch (error) {
        vscode.window.showErrorMessage(`❌ Erro ao fazer commit: ${error}`);
      }
    })
  );

  // Comando de Push
  context.subscriptions.push(
    vscode.commands.registerCommand("sourcecontrolgithubandbitbucket.push", async () => {
      const repoPath = getGitRepositoryPath();
      if (!repoPath) {
        vscode.window.showErrorMessage("Nenhum repositório Git encontrado.");
        return;
      }

      if (!provider.githubBranch || !provider.bitbucketBranch) {
        vscode.window.showErrorMessage("Selecione as branches antes de fazer push.");
        return;
      } 
 
      try {
        await runGitCommand(`git pull --rebase origin ${provider.githubBranch}`, repoPath);
        await runGitCommand(`git push origin ${provider.githubBranch}`, repoPath);
        await runGitCommand(`git push bitbucket ${provider.bitbucketBranch}`, repoPath);
        vscode.window.showInformationMessage(`✅ Push feito para GitHub (${provider.githubBranch}) e Bitbucket (${provider.bitbucketBranch})`);
      } catch (error) {
        vscode.window.showErrorMessage(`❌ Erro ao fazer push: ${error}`);
      }
    })
  );
}
