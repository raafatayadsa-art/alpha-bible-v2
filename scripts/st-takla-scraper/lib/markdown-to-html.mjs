/**
 * Convert WebFetch markdown snapshot to minimal HTML for cheerio parsers.
 */
export function markdownSnapshotToHtml(markdown) {
  const lines = (markdown || "").split("\n");
  const out = ["<!DOCTYPE html><html lang=\"ar\"><body>"];
  let inTable = false;

  const endTable = () => {
    if (inTable) {
      out.push("</table>");
      inTable = false;
    }
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t || t === "---") {
      endTable();
      continue;
    }

    if (/^#\s+/.test(t)) {
      endTable();
      out.push(`<h1>${esc(stripMd(t.replace(/^#\s+/, "")))}</h1>`);
      continue;
    }
    if (/^##\s+/.test(t)) {
      endTable();
      out.push(`<h2>${esc(stripMd(t.replace(/^##\s+/, "")))}</h2>`);
      continue;
    }
    if (/^###\s+/.test(t)) {
      endTable();
      out.push(`<h3>${esc(stripMd(t.replace(/^###\s+/, "")))}</h3>`);
      continue;
    }

    if (/^\|/.test(t)) {
      if (/^\|\s*---/.test(t)) continue;
      const cells = t.split("|").map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 2) {
        if (!inTable) {
          out.push("<table>");
          inTable = true;
        }
        out.push(`<tr><td>${esc(cells[0])}</td><td>${esc(cells.slice(1).join(" "))}</td></tr>`);
      }
      continue;
    }

    if (/↑\s*أعلى الصفحة\s*↑/.test(t)) {
      endTable();
      out.push("↑ أعلى الصفحة ↑");
      continue;
    }

    endTable();
    out.push(`<p>${esc(stripMd(t))}</p>`);
  }

  endTable();
  out.push("</body></html>");
  return out.join("\n");
}

function stripMd(s) {
  return s.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
