import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onToggleLegend?: () => void;
  onEscape?: () => void;
  onResetFocus?: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const useKeyboardShortcuts = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  onToggleLegend,
  onEscape,
  onResetFocus,
  searchInputRef,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow Ctrl+F in input fields to focus search
        if (event.ctrlKey && event.key === 'f') {
          event.preventDefault();
          if (searchInputRef?.current) {
            searchInputRef.current.focus();
            // For Material-UI InputBase, we need to select the underlying input element
            const inputElement = searchInputRef.current.querySelector('input');
            if (inputElement) {
              inputElement.select();
            }
          }
        }
        return;
      }

      // Handle keyboard shortcuts
      switch (event.key) {
        case 'F':
        case 'f':
          if (event.ctrlKey) {
            event.preventDefault();
            if (searchInputRef?.current) {
              searchInputRef.current.focus();
              // For Material-UI InputBase, we need to select the underlying input element
              const inputElement = searchInputRef.current.querySelector('input');
              if (inputElement) {
                inputElement.select();
              }
            }
          }
          break;

        case '+':
        case '=':
          if (event.ctrlKey) {
            event.preventDefault();
            onZoomIn?.();
          }
          break;

        case '-':
        case '_':
          if (event.ctrlKey) {
            event.preventDefault();
            onZoomOut?.();
          }
          break;

        case '0':
          if (event.ctrlKey) {
            event.preventDefault();
            onFitView?.();
          }
          break;

        case 'h':
        case 'H':
          if (event.ctrlKey) {
            event.preventDefault();
            onToggleLegend?.();
          }
          break;

        case 'Escape':
          onEscape?.();
          break;

        case 'r':
        case 'R':
          if (event.ctrlKey) {
            event.preventDefault();
            onResetFocus?.();
          }
          break;

        // Additional helpful shortcuts
        case ' ':
          // Space for pan mode (could be implemented later)
          event.preventDefault();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onZoomIn, onZoomOut, onFitView, onToggleLegend, onEscape, onResetFocus, searchInputRef]);
};

export default useKeyboardShortcuts;