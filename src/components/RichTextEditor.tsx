"use client";

import Image from "next/image";
import { useRef, useState } from "react";

/* Real Figma toolbar icons (downloaded per-glyph). */
const TOOL: Record<string, { icon: string; cmd: string; title: string }> = {
  undo: { icon: "tb-undo", cmd: "undo", title: "Undo" },
  redo: { icon: "tb-redo", cmd: "redo", title: "Redo" },
  bold: { icon: "tb-bold", cmd: "bold", title: "Bold" },
  italic: { icon: "tb-italic", cmd: "italic", title: "Italic" },
  underline: { icon: "tb-underline", cmd: "underline", title: "Underline" },
  strike: { icon: "tb-strike", cmd: "strikeThrough", title: "Strikethrough" },
  color: { icon: "tb-color", cmd: "__color", title: "Text colour" },
  link: { icon: "tb-link", cmd: "__link", title: "Insert link" },
  image: { icon: "tb-image", cmd: "__image", title: "Insert image" },
  list: { icon: "tb-list", cmd: "insertUnorderedList", title: "Bullet list" },
  alignLeft: { icon: "tb-align-left", cmd: "justifyLeft", title: "Align left" },
  alignCenter: { icon: "tb-align-center", cmd: "justifyCenter", title: "Align centre" },
  alignRight: { icon: "tb-align-right", cmd: "justifyRight", title: "Align right" },
  justify: { icon: "tb-justify", cmd: "justifyFull", title: "Justify" },
  spacing: { icon: "tb-spacing", cmd: "__spacing", title: "Line spacing" },
  outdent: { icon: "tb-outdent", cmd: "outdent", title: "Decrease indent" },
  indent: { icon: "tb-indent", cmd: "indent", title: "Increase indent" },
  clear: { icon: "tb-clear", cmd: "removeFormat", title: "Clear formatting" },
};

const SPACINGS = ["24px", "30px", "36px"];

export default function RichTextEditor({ placeholder, minHeight = 240, align = false, defaultHtml, onHtmlChange }: { placeholder?: string; minHeight?: number; align?: boolean; defaultHtml?: string; onHtmlChange?: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [empty, setEmpty] = useState(!defaultHtml?.trim());
  const [lh, setLh] = useState(0);

  const groups: string[][] = [
    ["undo", "redo"],
    ["bold", "italic", "underline", "strike", "color"],
    ["link", "image"],
    align
      ? ["list", "alignLeft", "alignCenter", "alignRight", "justify", "spacing", "outdent", "indent", "clear"]
      : ["list", "spacing", "outdent", "indent", "clear"],
  ];

  const refresh = () => {
    const el = ref.current;
    setEmpty(!el || (!el.textContent?.trim() && !el.querySelector("img,li")));
    onHtmlChange?.(el?.innerHTML ?? "");
  };
  const run = (cmd: string) => {
    ref.current?.focus();
    if (cmd === "__color") {
      const s = window.getSelection();
      if (s && s.rangeCount) savedRange.current = s.getRangeAt(0);
      colorRef.current?.click();
      return;
    }
    if (cmd === "__link") { const u = window.prompt("Enter URL"); if (u) document.execCommand("createLink", false, u); refresh(); return; }
    if (cmd === "__image") { const u = window.prompt("Image URL"); if (u) document.execCommand("insertImage", false, u); refresh(); return; }
    if (cmd === "__spacing") { setLh((v) => (v + 1) % SPACINGS.length); return; }
    document.execCommand(cmd, false);
    refresh();
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
      {/* Toolbar — real Figma icons, centered */}
      <div className="flex overflow-x-auto bg-[#F6F6F6] rounded-[12px] px-4" style={{ height: 48 }}>
        <div className="flex items-center gap-6 mx-auto w-max">
          {groups.map((g, gi) => (
            <div key={gi} className="flex items-center gap-3">
              {g.map((key) => {
                const t = TOOL[key];
                return (
                  <button
                    key={key}
                    type="button"
                    title={t.title}
                    aria-label={t.title}
                    onMouseDown={(e) => { e.preventDefault(); run(t.cmd); }}
                    className="flex items-center justify-center shrink-0 hover:opacity-60"
                    style={{ width: 20, height: 20 }}
                  >
                    <Image src={`/icons/admin/editor/${t.icon}.svg`} alt="" width={20} height={20} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
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
          className="rte bg-[#F6F6F6] rounded-[12px] p-4 text-[14px] text-[#121212] outline-none overflow-y-auto break-words"
          style={{ minHeight, lineHeight: SPACINGS[lh] }}
          dangerouslySetInnerHTML={defaultHtml ? { __html: defaultHtml } : undefined}
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
