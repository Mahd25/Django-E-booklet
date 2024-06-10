document.querySelectorAll('.copy-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const codeBox = icon.closest('.code-box');
        const codeContent = codeBox.querySelector('pre').innerText;
        copyToClipboard(codeContent);
        const originalText = icon.innerHTML;
        icon.innerHTML = 'Copied ✓';
        setTimeout(() => {
            icon.innerHTML = originalText;
        }, 1300);
    });
});

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}