import { useEffect, type RefObject } from 'react';

export function useDialogFocus(ref: RefObject<HTMLElement | null>, onClose: () => void, deferRestore=false) {
  useEffect(() => {
    const before = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = ref.current;
    if(!dialog) return;
    const items = () => [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,textarea,[tabindex="0"]')];
    (items()[0] ?? dialog).focus();
    function handle(event: KeyboardEvent) {
      if(event.key === 'Escape') {event.preventDefault();onClose();}
      if(event.key !== 'Tab') return;
      const list=items(), first=list[0], last=list.at(-1);
      if(!first) {event.preventDefault();return;}
      if(!list.includes(document.activeElement as HTMLElement)){event.preventDefault();first.focus();return;}
      if(event.shiftKey && document.activeElement === first) {event.preventDefault();last?.focus();}
      else if(!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
    }
    document.addEventListener('keydown',handle);
    return () => {document.removeEventListener('keydown',handle);const restore=()=>{if(before?.isConnected)before.focus();};if(deferRestore)queueMicrotask(restore);else restore();};
  }, [ref,onClose,deferRestore]);
}
