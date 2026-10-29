if (import.meta.env.DEV) {
  type RuntimeError = {
    message: string;
    stack: string;
    time: string;
  };

  const errors: RuntimeError[] = [];
  let overlay: HTMLElement | null = null;

  const redactSensitiveData = (value: string) =>
    value
      .replace(
        /\b(?:authorization|proxy-authorization|cookie|set-cookie)\s*:\s*[^\r\n]*/gi,
        '[REDACTED HEADER]',
      )
      .replace(
        /(["']?\b(?:password|passwd|pwd|(?:access|refresh|id)?[_-]?token|(?:client)?[_-]?secret|api[_-]?key|access[_-]?key|session[_-]?id|session|authorization|cookie)\b["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|`[^`]*`|[^\s,;&]+)/gi,
        '$1[REDACTED]',
      )
      .replace(
        /([?&](?:password|token|secret|api[_-]?key|access[_-]?key|session(?:id)?|cookie)=)[^&#\s]*/gi,
        '$1[REDACTED]',
      )
      .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [REDACTED]')
      .replace(/\b(?:eyJ[A-Za-z0-9_-]{10,}\.){2}[A-Za-z0-9_-]{10,}\b/g, '[REDACTED]')
      .replace(/\b(?:sk|pk|gh[pousr]|AIza)[-_][A-Za-z0-9_-]{12,}\b/g, '[REDACTED]');

  const render = () => {
    if (errors.length === 0) {
      overlay?.remove();
      overlay = null;
      return;
    }

    if (!overlay) {
      overlay = document.createElement('section');
      overlay.setAttribute('aria-label', 'Development runtime errors');
      overlay.style.cssText =
        'position:fixed;z-index:2147483647;left:12px;right:12px;bottom:12px;max-height:45vh;overflow:auto;padding:12px;background:#1f2937;color:#f9fafb;border:1px solid #f87171;border-radius:8px;box-shadow:0 8px 30px #0008;font:13px/1.45 ui-monospace,SFMono-Regular,monospace;text-align:left;direction:ltr;';
      document.body.append(overlay);
    }

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:12px;';
    const title = document.createElement('strong');
    title.textContent = `Development runtime errors (${errors.length})`;
    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.textContent = 'Clear';
    clearButton.style.cssText =
      'padding:4px 8px;border:1px solid #9ca3af;border-radius:4px;background:#374151;color:#fff;font:inherit;';
    clearButton.addEventListener('click', () => {
      errors.length = 0;
      render();
    });
    header.append(title, clearButton);

    const list = document.createElement('div');
    for (const error of errors) {
      const entry = document.createElement('article');
      entry.style.cssText = 'margin-top:10px;padding-top:10px;border-top:1px solid #4b5563;';
      const message = document.createElement('div');
      message.style.cssText = 'color:#fecaca;font-weight:700;white-space:pre-wrap;overflow-wrap:anywhere;';
      message.textContent = `[${error.time}] ${error.message}`;
      const stack = document.createElement('pre');
      stack.style.cssText =
        'margin:6px 0 0;white-space:pre-wrap;overflow-wrap:anywhere;color:#e5e7eb;font:inherit;';
      stack.textContent = error.stack || '(stack unavailable)';
      entry.append(message, stack);
      list.append(entry);
    }
    overlay.replaceChildren(header, list);
  };

  const report = (message: string, stack = '') => {
    errors.push({
      message: redactSensitiveData(message || 'Uncaught JavaScript error'),
      stack: redactSensitiveData(stack),
      time: new Date().toLocaleTimeString(),
    });
    if (errors.length > 10) errors.shift();
    render();
  };

  window.addEventListener('error', (event) => {
    const error = event.error;
    const stack =
      error instanceof Error
        ? error.stack ?? ''
        : event.filename
          ? `${event.filename}:${event.lineno}:${event.colno}`
          : '';
    report(error instanceof Error ? error.message : event.message, stack);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason instanceof Error) {
      report(reason.message, reason.stack ?? '');
    } else if (typeof reason === 'string' || typeof reason === 'number' || typeof reason === 'boolean') {
      report(String(reason));
    } else {
      report('Unhandled promise rejection (non-Error value)');
    }
  });
}
