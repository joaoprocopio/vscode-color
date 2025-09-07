import Color from "colorjs.io";
import * as vscode from "vscode";

type ColorFormat = "hex" | "oklch" | "hsl" | "rgb";

type ConvertColorFormatCommand<Color extends ColorFormat = ColorFormat> = {
  type: Color;
  convert: (input: string) => string;
} & vscode.QuickPickItem;

const conversions = {
  hex: {
    type: "hex",
    label: "Hex",
    description: "Convert color format to hex",
    convert: (input) => {
      let color = new Color(input);
      color = color.to("srgb");
      return color.toString({ format: "hex" });
    },
  },
  oklch: {
    type: "oklch",
    label: "OKLCH",
    description: "Convert color format to oklch",
    convert: (input) => {
      let color = new Color(input);
      color = color.to("oklch");
      return color.toString();
    },
  },
  hsl: {
    type: "hsl",
    label: "HSL",
    description: "Convert color format to hsl/hsla",
    convert: (input) => {
      let color = new Color(input);
      color = color.to("hsl");
      return color.toString();
    },
  },
  rgb: {
    type: "rgb",
    label: "RGB",
    description: "Convert color format to rgb/rgba",
    convert: (input) => {
      let color = new Color(input);
      color = color.to("srgb");
      return color.toString({});
    },
  },
} as const satisfies {
  [Color in ColorFormat]: ConvertColorFormatCommand<Color>;
};

export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("colorParser");

  context.subscriptions.push(diagnosticCollection);

  const disposable = vscode.commands.registerCommand(
    "vscode-color.convert",
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
          } catch (error) {
            console.error(error);

            // TODO: do better error diagnostics
            // TODO: look for text movement to update diagnostic
            const diagnostic = new vscode.Diagnostic(
              selection.with(),
              `Failed to parse "${text}" as a color.`,
              vscode.DiagnosticSeverity.Error,
            );

            diagnostics.push(diagnostic);
          }
        }
      });

      diagnosticCollection.set(editor.document.uri, diagnostics);
    },
  );

  context.subscriptions.push(disposable);
}
