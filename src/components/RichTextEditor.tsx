"use client";

import { useRef, useState } from "react";
import {
  Undo2, Redo2, Bold, Italic, Underline, Strikethrough, Baseline, Link2,
  Image as ImageIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, IndentDecrease, IndentIncrease, RemoveFormatting,
} from "lucide-react";

/** Lightweight, dependency-free rich-text editor (contentEditable + execCommand). */
export default function RichTextEditor({ placeholder, minHeight = 240 }: { placeholder?: string; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [empty, setEmpty] = useState(true);

  const refresh = () => {
    const el = ref.current;
    setEmpty(!el || (!el.textContent?.trim() && !el.querySelector("img,li")));
  };
  const exec = (cmd: string, val?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    refresh();
  };
  const openColor = () => {
    const s = window.getSelection();
    if (s && s.rangeCount) savedRange.current = s.getRangeAt(0);
    colorRef.current?.click();
  };
  const applyColor = (color: string) => {
    ref.current?.focus();
    if (savedRange.current) {
      const s = window.getSelection();
      s?.removeAllRanges();
      s?.addRange(savedRange.current);
    }
    document.execCommand("foreColor", false, color);
    refresh();
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 overflow-x-auto bg-[#F6F6F6] rounded-[12px] px-3" style={{ height: 48 }}>
        <Btn title="Undo" onClick={() => exec("undo")}><Undo2 size={16} /></Btn>
        <Btn title="Redo" onClick={() => exec("redo")}><Redo2 size={16} /></Btn>
        <Sep />
        <Btn title="Bold" onClick={() => exec("bold")}><Bold size={16} /></Btn>
        <Btn title="Italic" onClick={() => exec("italic")}><Italic size={16} /></Btn>
        <Btn title="Underline" onClick={() => exec("underline")}><Underline size={16} /></Btn>
        <Btn title="Strikethrough" onClick={() => exec("strikeThrough")}><Strikethrough size={16} /></Btn>
        <Btn title="Text colour" onClick={openColor}><Baseline size={16} /></Btn>
        <Sep />
        <Btn title="Insert link" onClick={() => { const u = window.prompt("Enter URL"); if (u) exec("createLink", u); }}><Link2 size={16} /></Btn>
        <Btn title="Insert image" onClick={() => { const u = window.prompt("Image URL"); if (u) exec("insertImage", u); }}><ImageIcon size={16} /></Btn>
        <Sep />
        <Btn title="Bullet list" onClick={() => exec("insertUnorderedList")}><List size={16} /></Btn>
        <Btn title="Numbered list" onClick={() => exec("insertOrderedList")}><ListOrdered size={16} /></Btn>
        <Sep />
        <Btn title="Align left" onClick={() => exec("justifyLeft")}><AlignLeft size={16} /></Btn>
        <Btn title="Align centre" onClick={() => exec("justifyCenter")}><AlignCenter size={16} /></Btn>
        <Btn title="Align right" onClick={() => exec("justifyRight")}><AlignRight size={16} /></Btn>
        <Btn title="Justify" onClick={() => exec("justifyFull")}><AlignJustify size={16} /></Btn>
        <Sep />
        <Btn title="Decrease indent" onClick={() => exec("outdent")}><IndentDecrease size={16} /></Btn>
        <Btn title="Increase indent" onClick={() => exec("indent")}><IndentIncrease size={16} /></Btn>
        <Btn title="Clear formatting" onClick={() => exec("removeFormat")}><RemoveFormatting size={16} /></Btn>
        <input ref={colorRef} type="color" className="sr-only" onChange={(e) => applyColor(e.target.value)} />
      </div>

      {/* Editable area */}
      <div className="relative">
        {empty && placeholder && (
          <span className="absolute left-4 top-4 pointer-events-none text-[14px] leading-[24px] text-[#807E7E] whitespace-pre-line">{placeholder}</span>
        )}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={refresh}
          role="textbox"
          aria-multiline="true"
          aria-label={placeholder}
          className="rte bg-[#F6F6F6] rounded-[12px] p-4 text-[14px] leading-[24px] text-[#121212] outline-none overflow-y-auto break-words"
          style={{ minHeight }}
        />
      </div>

      <style>{`
        .rte ul { list-style: disc; padding-left: 24px; }
        .rte ol { list-style: decimal; padding-left: 24px; }
        .rte a { color: #305E82; text-decoration: underline; }
        .rte img { max-width: 100%; border-radius: 8px; }
      `}</style>
    </div>
  );
}

function Btn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="flex items-center justify-center shrink-0 rounded-md hover:bg-[#E9E9E9] text-[#121212]"
      style={{ width: 28, height: 28 }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="shrink-0" style={{ width: 1, height: 20, background: "#E0E0E0", margin: "0 4px" }} />;
}
