(() => {
    let markdownFallbackLogged = false;

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeHtmlAttribute(value) {
        return escapeHtml(value).replace(/`/g, '&#96;');
    }

    function renderMarkdownFallback(text) {
        const lines = text.split('\n');
        const out = [];
        let inList = false;

        for (const rawLine of lines) {
            // Heading
            const headingMatch = rawLine.match(/^(#{1,6})\s+(.*)/);
            if (headingMatch) {
                if (inList) { out.push('</ul>'); inList = false; }
                const level = headingMatch[1].length;
                out.push(`<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>`);
                continue;
            }
            // Horizontal rule: 3+ identical characters (-, *, or _), optionally separated by spaces
            if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(rawLine)) {
                if (inList) { out.push('</ul>'); inList = false; }
                out.push('<hr>');
                continue;
            }
            // Unordered list item
            const listMatch = rawLine.match(/^[ \t]*[-*+]\s+(.*)/);
            if (listMatch) {
                if (!inList) { out.push('<ul>'); inList = true; }
                out.push(`<li>${inlineMarkdown(listMatch[1])}</li>`);
                continue;
            }
            if (inList) { out.push('</ul>'); inList = false; }
            // Blank line → paragraph break
            if (!rawLine.trim()) {
                out.push('<br>');
            } else {
                out.push(`<p>${inlineMarkdown(rawLine)}</p>`);
            }
        }
        if (inList) out.push('</ul>');
        return out.join('');
    }

    function inlineMarkdown(text) {
        // Extract inline code spans first (before HTML-escaping) so backticks
        // and their contents are not touched by subsequent passes.
        const codePlaceholders = [];
        let s = text.replace(/`([^`]+)`/g, (_, c) => {
            const idx = codePlaceholders.length;
            codePlaceholders.push(`<code>${escapeHtml(c)}</code>`);
            return `\x00code${idx}\x00`;
        });

        s = escapeHtml(s);

        // Bold must come before italic so **word** isn't mis-parsed as *em* by the italic pass.
        s = s.replace(/\*\*(.+?)\*\*|__(.+?)__/g, (_, a, b) => `<strong>${a ?? b}</strong>`);
        s = s.replace(/\*(.+?)\*|_(.+?)_/g, (_, a, b) => `<em>${a ?? b}</em>`);

        // Links [label](url) — label is already HTML-escaped; validate URL protocol explicitly.
        s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, rawUrl) => {
            let safeUrl = '#';
            try {
                const parsed = new URL(rawUrl);
                if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
                    safeUrl = parsed.href;
                }
            } catch (_) { /* invalid URL — keep '#' */ }
            return `<a href="${escapeHtmlAttribute(safeUrl)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
        });

        // Restore inline code placeholders.
        s = s.replace(/\x00code(\d+)\x00/g, (_, i) => codePlaceholders[Number(i)]);
        return s;
    }

    function renderMarkdown(markdownText) {
        const text = String(markdownText ?? '').replace(/\r\n/g, '\n');
        if (!text.trim()) return '';
        if (!window.marked || !window.filterXSS) {
            if (!markdownFallbackLogged) {
                const missingLibraries = [
                    !window.marked ? 'marked' : null,
                    !window.filterXSS ? 'xss' : null
                ].filter(Boolean).join(', ');
                console.warn(`Markdown fallback enabled. Missing libraries: ${missingLibraries}.`);
                markdownFallbackLogged = true;
            }
            return renderMarkdownFallback(text);
        }

        // gfm: GitHub Flavored Markdown (tables, strikethrough, etc.)
        // breaks: single newlines become <br> tags
        const rawHtml = window.marked.parse(text, {
            gfm: true,
            breaks: true
        });

        return window.filterXSS(rawHtml);
    }

    window.markdownUtils = {
        escapeHtml,
        escapeHtmlAttribute,
        renderMarkdown
    };
})();
