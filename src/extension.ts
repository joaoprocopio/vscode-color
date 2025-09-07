import Color from "colorjs.io";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "vscode-color.convert",
    async () => {
      const command = await vscode.window.showQuickPick([
        { label: "hex" },
        { label: "rgb" },
        { label: "hsl" },
        { label: "oklch" },
      ]);

      console.log(command);
    },
  );

  context.subscriptions.push(disposable);
}
