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

    function renderInlineMarkdown(input) {
        let text = escapeHtml(input);
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        return text;
    }

    function renderMarkdown(markdownText) {
        const text = String(markdownText ?? '').replace(/\r\n/g, '\n');
        if (!text.trim()) return '';

        const blocks = text.split(/\n{2,}/);
        const htmlBlocks = blocks.map(rawBlock => {
            const block = rawBlock.trim();
            if (!block) return '';

            const lines = block.split('\n');

            if (lines.every(line => /^\s*[-*]\s+/.test(line))) {
                const items = lines
                    .map(line => line.replace(/^\s*[-*]\s+/, '').trim())
                    .map(item => `<li>${renderInlineMarkdown(item)}</li>`)
                    .join('');
                return `<ul>${items}</ul>`;
            }

            if (lines.every(line => /^\s*\d+\.\s+/.test(line))) {
                const items = lines
                    .map(line => line.replace(/^\s*\d+\.\s+/, '').trim())
                    .map(item => `<li>${renderInlineMarkdown(item)}</li>`)
                    .join('');
                return `<ol>${items}</ol>`;
            }

            if (lines.length === 1) {
                const headingMatch = lines[0].match(/^(#{1,6})\s+(.*)$/);
                if (headingMatch) {
                    const level = headingMatch[1].length;
                    return `<h${level}>${renderInlineMarkdown(headingMatch[2].trim())}</h${level}>`;
                }

                const quoteMatch = lines[0].match(/^>\s?(.*)$/);
                if (quoteMatch) {
                    return `<blockquote>${renderInlineMarkdown(quoteMatch[1].trim())}</blockquote>`;
                }
            }

            return `<p>${lines.map(line => renderInlineMarkdown(line.trim())).join('<br>')}</p>`;
        });

        return htmlBlocks.join('');
    }

    window.markdownUtils = {
        escapeHtml,
        escapeHtmlAttribute,
        renderMarkdown
    };
})();
