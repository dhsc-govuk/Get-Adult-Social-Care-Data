import React, { JSX } from 'react';

export function parseMarkdownBlocks(markdownBlocks: string[]): JSX.Element[] {
  return markdownBlocks.map((block, blockIndex) => {
    if (typeof block !== 'string') return <div key={blockIndex}></div>;
    const lines = block.split('\n').map((line, lineIndex) => {
      if (/^\*\*(.*?)\*\*$/.test(line)) {
        return <h2 key={lineIndex}>{line.replace(/\*\*/g, '')}</h2>;
      } else if (/^# (.*)/.test(line)) {
        return <h1 key={lineIndex}>{line.replace(/^# /, '')}</h1>;
      } else if (/^## (.*)/.test(line)) {
        return <h2 key={lineIndex}>{line.replace(/^## /, '')}</h2>;
      } else if (/^\* (.*)/.test(line)) {
        return (
          <ul key={lineIndex}>
            <li>{line.replace(/^\* /, '')}</li>
          </ul>
        );
      } else {
        return <p key={lineIndex}>{line}</p>;
      }
    });

    return <div key={blockIndex}>{lines}</div>;
  });
}
