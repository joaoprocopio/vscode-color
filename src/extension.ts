import Color from "colorjs.io";
import * as vscode from "vscode";

type ColorFormat = "hex" | "oklch" | "hsl";

type ConvertColorFormatCommand<Color extends ColorFormat = ColorFormat> = {
  type: Color;
  convert: (input: string) => void;
} & vscode.QuickPickItem;

const formats = {
  hex: {
    type: "hex",
    label: "Hex",
    description: "Convert color format to hex",
    convert: (input) => {
      const color = new Color(input);
      console.log(color);
    },
  },
  oklch: {
    type: "oklch",
    label: "OKLCH",
    description: "Convert color format to oklch",
    convert: (input) => {
      const color = new Color(input);
      console.log(color);
    },
  },
  hsl: {
    type: "hsl",
    label: "HSL",
    description: "Convert color format to hsl/hsla",
    convert: (input) => {
      const color = new Color(input);
      console.log(color);
    },
  },
} as const satisfies {
  [Color in ColorFormat]: ConvertColorFormatCommand<Color>;
};

function convertAndReplace(
  command: ConvertColorFormatCommand<ColorFormat>,
): void {
  // This is valid because `when == editor.hasSelection`
  const editor = vscode.window.activeTextEditor!;

  for (const selection of editor.selections) {
    const text = editor.document.getText(selection);
    console.log(text);
  }
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "vscode-color.convert",
    async () => {
      const command =
        await vscode.window.showQuickPick<ConvertColorFormatCommand>(
          Object.values(formats),
          {
            placeHolder: "Which color format would you want to convert to?",
            matchOnDescription: true,
          },
        );

      if (!command) return undefined;

      convertAndReplace(command);
    },
  );

  context.subscriptions.push(disposable);
}
