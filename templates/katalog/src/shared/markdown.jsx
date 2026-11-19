import React from 'react';

function renderInline(text) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[1];
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    } else {
      parts.push(token);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function SummaryMarkdown({ text, className = '' }) {
  if (!text) return null;
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let listItems = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={key++}>
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    if (/^([-*_])\1{2,}$/.test(trimmed)) {
      flushList();
      blocks.push(<hr key={key++} />);
      continue;
    }
    const headingMatch = trimmed.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      flushList();
      blocks.push(<h4 key={key++}>{headingMatch[1].replace(/\*\*/g, '')}</h4>);
      continue;
    }
    const boldHeadingMatch = trimmed.match(/^\*\*(.+?)\*\*:?$/);
    if (boldHeadingMatch) {
      flushList();
      blocks.push(<h4 key={key++}>{boldHeadingMatch[1]}</h4>);
      continue;
    }
    const bulletMatch = trimmed.match(/^(?:[-*•]|\d+\.)\s+(.+)$/);
    if (bulletMatch) {
      listItems.push(bulletMatch[1]);
      continue;
    }
    flushList();
    blocks.push(<p key={key++}>{renderInline(trimmed)}</p>);
  }
  flushList();

  return <div className={className}>{blocks}</div>;
}
