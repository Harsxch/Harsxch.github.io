import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { Option } from "../constants.ts";
import { Field } from "./Field.tsx";
import { CheckIcon, ChevronIcon, CloseIcon, SearchIcon } from "./icons.tsx";

interface Props {
  id: string;
  label: string;
  placeholder: string;
  options: Option[];
  value: string;
  error?: string;
  /** false => plain select-style dropdown (no typing). */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  clearable?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function SearchableDropdown({
  id,
  label,
  placeholder,
  options,
  value,
  error,
  searchable = true,
  searchPlaceholder,
  emptyText = "No matches found",
  clearable = true,
  onChange,
  onBlur,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const filtered = useMemo(() => {
    const q = norm(query);
    return q ? options.filter((o) => norm(o.value).includes(q)) : options;
  }, [options, query]);

  const openMenu = () => {
    if (open) return;
    setOpen(true);
    setQuery("");
    const i = options.findIndex((o) => o.value === value);
    setActive(i >= 0 ? i : 0);
  };
  const closeMenu = () => {
    setOpen(false);
    setQuery("");
  };

  const select = (v: string) => {
    onChange(v);
    closeMenu();
    inputRef.current?.focus();
  };

  // Keep the active option visible; keep the open menu in view on small screens.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [open, active, filtered]);
  useEffect(() => {
    if (open) rootRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openMenu();
        else setActive((a) => Math.min(a + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openMenu();
        else setActive((a) => Math.max(a - 1, 0));
        break;
      case "Home":
        if (open) { e.preventDefault(); setActive(0); }
        break;
      case "End":
        if (open) { e.preventDefault(); setActive(Math.max(filtered.length - 1, 0)); }
        break;
      case "Enter":
        if (open) {
          e.preventDefault();
          if (filtered[active]) select(filtered[active].value);
        } else {
          e.preventDefault();
          openMenu();
        }
        break;
      case " ":
        if (!searchable) { e.preventDefault(); open ? filtered[active] && select(filtered[active].value) : openMenu(); }
        break;
      case "Escape":
        if (open) { e.preventDefault(); e.stopPropagation(); closeMenu(); }
        break;
      case "Tab":
        closeMenu();
        break;
    }
  };

  const activeId = open && filtered[active] ? `${listId}-opt-${active}` : undefined;

  return (
    <Field id={id} label={label} error={error}>
      <div
        ref={rootRef}
        className={`dd${open ? " open" : ""}`}
        onBlur={(e) => {
          if (!rootRef.current?.contains(e.relatedTarget as Node)) {
            closeMenu();
            onBlur?.();
          }
        }}
      >
        <div className="dd-box control">
          {searchable && open && <SearchIcon className="dd-lead" />}
          <input
            ref={inputRef}
            id={id}
            className="dd-input"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete={searchable ? "list" : "none"}
            aria-activedescendant={activeId}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            autoComplete="off"
            readOnly={!searchable}
            placeholder={open && searchable ? searchPlaceholder ?? "Type to search" : placeholder}
            value={open && searchable ? query : value}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
              if (!open) setOpen(true);
            }}
            onClick={() => (open && !searchable ? closeMenu() : openMenu())}
            onFocus={() => searchable && openMenu()}
            onKeyDown={onKeyDown}
          />
          {clearable && value && (
            <button
              type="button"
              className="dd-icon-btn"
              aria-label={`Clear ${label}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange("");
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              <CloseIcon />
            </button>
          )}
          <ChevronIcon className="dd-chevron" onMouseDown={(e) => e.preventDefault()} onClick={() => (open ? closeMenu() : (inputRef.current?.focus(), openMenu()))} />
        </div>

        {open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            className="dd-menu"
            onMouseDown={(e) => e.preventDefault()}
          >
            {filtered.length === 0 && <li className="dd-empty" role="presentation">{emptyText}</li>}
            {filtered.map((o, i) => {
              const showGroup = o.group && o.group !== filtered[i - 1]?.group;
              return (
                <li key={o.value} role="presentation">
                  {showGroup && <div className="dd-group" role="presentation">{o.group}</div>}
                  <div
                    id={`${listId}-opt-${i}`}
                    role="option"
                    aria-selected={o.value === value}
                    data-active={i === active}
                    className={`dd-opt${i === active ? " active" : ""}${o.value === value ? " selected" : ""}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => select(o.value)}
                  >
                    <span>{o.value}</span>
                    {o.value === value && <CheckIcon className="dd-check" />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Field>
  );
}
