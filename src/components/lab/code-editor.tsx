import CodeMirror from "@uiw/react-codemirror";
import { githubLight } from "@uiw/codemirror-theme-github";
import { sql as sqlLang } from "@codemirror/lang-sql";
import { python as pythonLang } from "@codemirror/lang-python";
import { StreamLanguage } from "@codemirror/language";
import { r as rLang } from "@codemirror/legacy-modes/mode/r";
import { EditorView } from "@codemirror/view";

const languages = {
  sql: sqlLang,
  python: pythonLang,
  r: () => StreamLanguage.define(rLang),
};

const transparentBg = EditorView.theme({
  "&": { backgroundColor: "transparent !important" },
  ".cm-gutters": { backgroundColor: "transparent !important", border: "none" },
});

export function CodeEditor({
  value, onChange, language, readOnly = false, height = "auto", className = "",
}: {
  value: string;
  onChange?: (value: string) => void;
  language: keyof typeof languages;
  readOnly?: boolean;
  height?: string;
  className?: string;
}) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      editable={!readOnly}
      readOnly={readOnly}
      theme={githubLight}
      extensions={[languages[language](), transparentBg]}
      basicSetup={{ lineNumbers: !readOnly, foldGutter: false, highlightActiveLine: !readOnly }}
      height={height}
      className={`text-xs font-mono ${className}`}
    />
  );
}
