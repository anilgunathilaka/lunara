export interface InlineErrorProps {
  /** States what to do, not merely that something is wrong — e.g. "Enter a 10-digit phone number". */
  message: string;
  id?: string;
}

/** docs/3-components.md §6.1. For errors not already covered by Input/Select's own error prop. */
export function InlineError({ message, id }: InlineErrorProps) {
  return (
    <p id={id} role="alert" className="field-message field-message-error">
      {message}
    </p>
  );
}
