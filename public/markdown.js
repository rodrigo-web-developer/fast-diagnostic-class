(() => {
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
        if (!window.marked || !window.DOMPurify) {
            return `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`;
        }

        const rawHtml = window.marked.parse(text, {
            gfm: true,
            breaks: true
        });

        return window.DOMPurify.sanitize(rawHtml);
    }

    window.markdownUtils = {
        escapeHtml,
        escapeHtmlAttribute,
        renderMarkdown
    };
})();
