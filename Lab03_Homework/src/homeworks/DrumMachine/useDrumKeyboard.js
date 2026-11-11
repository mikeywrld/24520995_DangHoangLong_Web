import { useEffect, useRef } from 'react';

const TYPING_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

function isTypingTarget(target) {
  return Boolean(target) && (TYPING_TAGS.includes(target.tagName) || target.isContentEditable === true);
}

/**
 * Global drum shortcuts.
 *  - e.code (never keyCode)            - e.repeat guard (no OS auto-repeat flood)
 *  - ignored while typing in a field   - ignored with Ctrl/Meta/Alt (never hijack browser shortcuts)
 *  - keyup/blur release pads           - cleanup removes every listener
 */
export function useDrumKeyboard(padMap, onTriggerPad, isEnabled = true, onReleasePad) {
  const heldRef = useRef(new Set()); // survives effect re-subscription (e.g. toggling Sound while a key is down)
  useEffect(() => {
    if (!isEnabled) return undefined;
    const held = heldRef.current;

    const onKeyDown = (e) => {
      if (e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      const pad = padMap.get(e.code);
      if (!pad) return;
      e.preventDefault();
      held.add(pad.id);
      onTriggerPad(pad.id);
    };
    const onKeyUp = (e) => {
      const pad = padMap.get(e.code);
      if (pad && held.delete(pad.id)) onReleasePad?.(pad.id);
    };
    const onBlur = () => {
      held.forEach((id) => onReleasePad?.(id));
      held.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [padMap, onTriggerPad, isEnabled, onReleasePad]);
}
