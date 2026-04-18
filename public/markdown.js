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
        const codeTokens = [];
        const linkTokens = [];
        let text = String(input ?? '');

        text = text.replace(/`([^`]+)`/g, (_, codeValue) => {
            const token = `__MD_CODE_${codeTokens.length}__`;
            codeTokens.push(`<code>${escapeHtml(codeValue)}</code>`);
            return token;
        });

        text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) => {
            const token = `__MD_LINK_${linkTokens.length}__`;
            linkTokens.push(`<a href="${escapeHtmlAttribute(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`);
            return token;
        });

        text = escapeHtml(text);
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        text = text.replace(/__MD_CODE_(\d+)__/g, (match, index) => codeTokens[Number(index)] || match);
        text = text.replace(/__MD_LINK_(\d+)__/g, (match, index) => linkTokens[Number(index)] || match);
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
