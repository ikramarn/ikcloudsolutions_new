import { useId } from 'react';

/**
 * Off-screen (not display:none, which bots detect) text field with a non-semantic name so
 * password managers and autofill leave it alone. The server rejects any submission that fills it
 * with an honest error and a mailto, never a fake success. Place it inside a `relative` form.
 */
export function Honeypot() {
  const id = useId();
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={id}>Leave this field empty</label>
      <input id={id} type="text" name="hp_confirm_ref" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
