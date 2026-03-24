export function copyToClipboard(textToCopy: string): boolean {
  const hiddenTextarea = document.createElement('textarea');
  hiddenTextarea.value = textToCopy;
  hiddenTextarea.style.position = 'fixed';
  hiddenTextarea.style.opacity = '0';
  document.body.appendChild(hiddenTextarea);
  hiddenTextarea.select();
  try {
    document.execCommand('copy');
    return true;
  } catch {
    return false;
  } finally {
    document.body.removeChild(hiddenTextarea);
  }
}
