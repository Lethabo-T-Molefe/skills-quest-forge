import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  htmlFor?: string | undefined;
  children: ReactNode;
}) {
  const generatedId = useId();
  const controlId = htmlFor ?? generatedId;
  const errorId = `${controlId}-error`;
  const hintId = `${controlId}-hint`;

  const control = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const props: Record<string, unknown> = {
      id: (child.props as { id?: string }).id ?? controlId,
    };
    if (error) {
      props["aria-invalid"] = true;
      props["aria-describedby"] = errorId;
    } else if (hint) {
      props["aria-describedby"] = hintId;
    }
    return cloneElement(child as ReactElement<Record<string, unknown>>, props);
  });

  return (
    <label htmlFor={controlId} className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5">{control}</div>
      {hint && !error ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          className="mt-1.5 flex items-start gap-1.5 text-xs text-destructive"
          role="alert"
        >
          <span aria-hidden>!</span>
          {error}
        </p>
      ) : null}
    </label>
  );
}

export { inputClass, textareaClass, TextArea, TextInput } from "./TextInput";
