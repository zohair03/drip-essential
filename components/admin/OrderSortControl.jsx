"use client";

import { useState, useEffect } from "react";

/**
 * OrderSortControl
 *
 * Dedicated sort order control for admin table rows.
 * Features:
 * - Direct number input for exact sequence positioning.
 * - Up (▲) and Down (▼) arrow buttons to reorder watches visually.
 * - Clean disabled states when the watch is at the top or bottom of the list.
 * - Keyboard support (Enter to commit, Escape to cancel, ArrowUp/ArrowDown to move).
 */
export default function OrderSortControl({
  order,
  index,
  totalItems,
  onMoveUp,
  onMoveDown,
  onOrderChange,
  disabled = false,
  className = "",
}) {
  const [localValue, setLocalValue] = useState(order ?? index + 1);

  // Sync if order or index changes from parent (e.g. after moving or sorting)
  useEffect(() => {
    setLocalValue(order ?? index + 1);
  }, [order, index]);

  const isFirst = index <= 0;
  const isLast = index >= totalItems - 1;

  const handleInputChange = (e) => {
    setLocalValue(e.target.value);
  };

  const commitChange = () => {
    const parsed = parseInt(localValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      if (parsed !== order && onOrderChange) {
        onOrderChange(parsed);
      }
    } else {
      // Revert to valid order if input was cleared or invalid
      setLocalValue(order ?? index + 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitChange();
      e.target.blur();
    } else if (e.key === "Escape") {
      setLocalValue(order ?? index + 1);
      e.target.blur();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isFirst && onMoveUp) {
        onMoveUp();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isLast && onMoveDown) {
        onMoveDown();
      }
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Number Input */}
      <input
        type="number"
        min="1"
        max="999"
        value={localValue}
        onChange={handleInputChange}
        onBlur={commitChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Watch sort order"
        className="w-12 text-center py-1.5 border border-neutral-200 rounded font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 text-xs bg-white shadow-2xs transition-colors"
      />

      {/* Up / Down Arrow Stepper */}
      <div className="flex flex-col border border-neutral-200 rounded overflow-hidden bg-neutral-100 shadow-2xs divide-y divide-neutral-200">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={disabled || isFirst}
          title={isFirst ? "Already at top" : "Move watch up (higher priority)"}
          aria-label="Move watch up"
          className="px-1.5 py-0.5 hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-25 disabled:hover:bg-neutral-100 disabled:cursor-not-allowed transition-colors text-neutral-800 flex items-center justify-center cursor-pointer"
        >
          <svg
            className="w-2.5 h-2.5 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 5l-7 8h14z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onMoveDown}
          disabled={disabled || isLast}
          title={isLast ? "Already at bottom" : "Move watch down (lower priority)"}
          aria-label="Move watch down"
          className="px-1.5 py-0.5 hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-25 disabled:hover:bg-neutral-100 disabled:cursor-not-allowed transition-colors text-neutral-800 flex items-center justify-center cursor-pointer"
        >
          <svg
            className="w-2.5 h-2.5 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 19l7-8H5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
