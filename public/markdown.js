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
            return `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`;
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
