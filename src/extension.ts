import Color from "colorjs.io";
import * as vscode from "vscode";

type ColorFormat = "hex" | "oklch" | "hsl" | "rgb";

type ConvertColorFormatCommand<C extends ColorFormat = ColorFormat> = {
  format: C;
  convert: (input: string) => string;
} & vscode.QuickPickItem;

const conversions = {
  hex: {
    format: "hex",
    label: "Hex",
    description: "Convert color format to hex",
    convert: (input) => new Color(input).to("srgb").toString({ format: "hex" }),
  },
  oklch: {
    format: "oklch",
    label: "OKLCH",
    description: "Convert color format to oklch",
    convert: (input) => new Color(input).to("oklch").toString(),
  },
  hsl: {
    format: "hsl",
    label: "HSL",
    description: "Convert color format to hsl/hsla",
    convert: (input) => new Color(input).to("hsl").toString(),
  },
  rgb: {
    format: "rgb",
    label: "RGB",
    description: "Convert color format to rgb/rgba",
    convert: (input) => new Color(input).to("srgb").toString(),
  },
} as const satisfies {
  [Color in ColorFormat]: ConvertColorFormatCommand<Color>;
};

export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("color-utils");

  const clear = vscode.commands.registerCommand(
    "vscode-color-utils.clear",
    () => diagnosticCollection.clear(),
  );

  const convert = vscode.commands.registerCommand(
    "vscode-color-utils.convert",
    async () => {
      const command =
        await vscode.window.showQuickPick<ConvertColorFormatCommand>(
          Object.values(conversions),
          {
            placeHolder: "Which color format would you want to convert to?",
            matchOnDescription: true,
          },
        );

      if (!command) return undefined;

      const editor = vscode.window.activeTextEditor!;
      const diagnostics: vscode.Diagnostic[] = [];

      editor.edit((edit) => {
        for (const selection of editor.selections) {
          const text = editor.document.getText(selection);

          try {
            let converted = command.convert(text);

            edit.replace(selection, converted);
          } catch {
            const diagnostic = new vscode.Diagnostic(
              selection.with(),
              `Failed to parse "${text}" as a color.`,
              vscode.DiagnosticSeverity.Information,
            );

            diagnostics.push(diagnostic);
          }
        }
      });

      diagnosticCollection.set(editor.document.uri, diagnostics);
    },
  );

  context.subscriptions.push(diagnosticCollection);
  context.subscriptions.push(clear);
  context.subscriptions.push(convert);
}
