"use client";

import React, { useMemo } from "react";

interface FormattedChatMessageProps {
  content: string;
  isUser?: boolean;
}

/**
 * Helper to render inline markdown: **bold**, *italic*, `code`, and clean formatting.
 */
function renderInlineText(text: string, isUser: boolean): React.ReactNode {
  if (!text) return null;

  // Split tokens: **bold**, `code`, *italic*
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong
          key={match.index}
          className={`font-bold ${isUser ? "text-white underline decoration-white/30" : "text-gray-950 font-semibold"}`}
        >
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className={`px-1.5 py-0.5 rounded text-[12px] font-mono ${
            isUser
              ? "bg-white/20 text-white"
              : "bg-slate-200/80 text-slate-800 border border-slate-300/60"
          }`}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={match.index} className="italic opacity-90">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

interface Block {
  type: "heading1" | "heading2" | "heading3" | "bullet_list" | "number_list" | "quote" | "table" | "divider" | "paragraph";
  content?: string;
  items?: string[];
  tableData?: { headers: string[]; rows: string[][] };
}

export const FormattedChatMessage: React.FC<FormattedChatMessageProps> = ({ content, isUser = false }) => {
  const blocks = useMemo<Block[]>(() => {
    if (!content) return [];

    const lines = content.split("\n");
    const parsedBlocks: Block[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      // 1. Dividers
      if (/^(\-{3,}|\*{3,}|_{3,}|━{3,})$/.test(trimmed)) {
        parsedBlocks.push({ type: "divider" });
        i++;
        continue;
      }

      // 2. Headings
      if (trimmed.startsWith("### ")) {
        parsedBlocks.push({ type: "heading3", content: trimmed.replace(/^###\s+/, "") });
        i++;
        continue;
      }
      if (trimmed.startsWith("## ")) {
        parsedBlocks.push({ type: "heading2", content: trimmed.replace(/^##\s+/, "") });
        i++;
        continue;
      }
      if (trimmed.startsWith("# ")) {
        parsedBlocks.push({ type: "heading1", content: trimmed.replace(/^#\s+/, "") });
        i++;
        continue;
      }

      // 3. Blockquotes
      if (trimmed.startsWith(">")) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
          i++;
        }
        parsedBlocks.push({ type: "quote", content: quoteLines.join(" ") });
        continue;
      }

      // 4. Tables (consecutive lines starting and ending with |)
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const parseRow = (rowStr: string) =>
            rowStr
              .slice(1, -1)
              .split("|")
              .map((c) => c.trim());

          const headers = parseRow(tableLines[0]);
          // Filter out markdown separator line (|---|---|)
          const dataRows = tableLines
            .slice(1)
            .filter((r) => !/^\|[\s\-:|]+\|$/.test(r))
            .map(parseRow);

          parsedBlocks.push({
            type: "table",
            tableData: { headers, rows: dataRows },
          });
          continue;
        }
      }

      // 5. Bullet Lists (* item, - item, • item)
      if (/^(\*|\-|\•)\s+/.test(trimmed)) {
        const items: string[] = [];
        while (i < lines.length && /^(\*|\-|\•)\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^(\*|\-|\•)\s+/, ""));
          i++;
        }
        parsedBlocks.push({ type: "bullet_list", items });
        continue;
      }

      // 6. Numbered Lists (1. item, 2. item)
      if (/^\d+[\.\)]\s+/.test(trimmed)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+[\.\)]\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^\d+[\.\)]\s+/, ""));
          i++;
        }
        parsedBlocks.push({ type: "number_list", items });
        continue;
      }

      // 7. Regular Paragraph
      const paraLines: string[] = [line];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].trim().startsWith("#") &&
        !lines[i].trim().startsWith(">") &&
        !/^(\*|\-|\•|\d+[\.\)])\s+/.test(lines[i].trim()) &&
        !(lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) &&
        !/^(\-{3,}|\*{3,}|_{3,}|━{3,})$/.test(lines[i].trim())
      ) {
        paraLines.push(lines[i]);
        i++;
      }
      parsedBlocks.push({ type: "paragraph", content: paraLines.join(" ") });
    }

    return parsedBlocks;
  }, [content]);

  if (!content) return null;

  return (
    <div className={`space-y-2.5 font-sans leading-relaxed text-[13px] sm:text-[14px] ${isUser ? "text-white" : "text-[#200813]"}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "heading1":
            return (
              <h2
                key={idx}
                className={`font-bold text-[16px] sm:text-[17px] mt-3.5 mb-1.5 pb-1 border-b ${
                  isUser ? "text-white border-white/20" : "text-gray-900 border-slate-200"
                }`}
              >
                {renderInlineText(block.content || "", isUser)}
              </h2>
            );

          case "heading2":
            return (
              <h3
                key={idx}
                className={`font-bold text-[15px] sm:text-[16px] mt-3 mb-1.5 ${
                  isUser ? "text-white" : "text-gray-900"
                }`}
              >
                {renderInlineText(block.content || "", isUser)}
              </h3>
            );

          case "heading3":
            return (
              <h4
                key={idx}
                className={`font-semibold text-[14px] sm:text-[14.5px] mt-2.5 mb-1 ${
                  isUser ? "text-white/95" : "text-gray-900"
                }`}
              >
                {renderInlineText(block.content || "", isUser)}
              </h4>
            );

          case "bullet_list":
            return (
              <ul key={idx} className="space-y-1.5 my-2 pl-0.5">
                {block.items?.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                        isUser ? "bg-white" : "bg-[#1E6702]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      {renderInlineText(item, isUser)}
                    </div>
                  </li>
                ))}
              </ul>
            );

          case "number_list":
            return (
              <ol key={idx} className="space-y-1.5 my-2 pl-0.5">
                {block.items?.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5">
                    <span
                      className={`text-xs font-bold mt-0.5 shrink-0 ${
                        isUser ? "text-white/90" : "text-[#1E6702]"
                      }`}
                    >
                      {itemIdx + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      {renderInlineText(item, isUser)}
                    </div>
                  </li>
                ))}
              </ol>
            );

          case "quote":
            return (
              <div
                key={idx}
                className={`my-2.5 p-3 rounded-xl border-l-4 text-xs sm:text-[13px] ${
                  isUser
                    ? "bg-white/10 border-white text-white/90"
                    : "bg-emerald-50/60 border-[#1E6702] text-emerald-950 font-medium"
                }`}
              >
                {renderInlineText(block.content || "", isUser)}
              </div>
            );

          case "table":
            if (!block.tableData) return null;
            return (
              <div key={idx} className="my-3 overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-xs text-left divide-y divide-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10.5px]">
                    <tr>
                      {block.tableData.headers.map((h, hIdx) => (
                        <th key={hIdx} className="px-3 py-2">
                          {renderInlineText(h, isUser)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {block.tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 text-slate-700">
                            {renderInlineText(cell, isUser)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "divider":
            return (
              <hr
                key={idx}
                className={`my-3 ${isUser ? "border-white/20" : "border-slate-200"}`}
              />
            );

          case "paragraph":
          default:
            return (
              <p key={idx} className="leading-relaxed">
                {renderInlineText(block.content || "", isUser)}
              </p>
            );
        }
      })}
    </div>
  );
};
