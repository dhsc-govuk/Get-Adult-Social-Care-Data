import React, { JSX } from 'react';

export function parseMarkdownBlocks(markdownBlocks: string[]): JSX.Element[] {
  return markdownBlocks.map((block, blockIndex) => {
    if (typeof block !== 'string') return <div key={blockIndex}></div>;

    const lines = block.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: JSX.Element[] = [];

    lines.forEach((line, lineIndex) => {
      if (/^\s*\*\*(.+?)\*\*\s*$/.test(line)) {
        elements.push(
          <h2 key={lineIndex} className="govuk-heading-m">
            {line.replace(/\*\*/g, '')}
          </h2>
        );
      } else if (/^(-|\*) \*\*(.*?)\*\*(.*)/.test(line)) {
        const match = line.match(/^(-|\*) \*\*(.*?)\*\*(.*)/);
        if (match) {
          listItems.push(
            <li key={lineIndex}>
              <h2 className="govuk-heading-m">{match[2]}</h2>
              {match[3].trim() && (
                <p className="govuk-body">{match[3].trim()}</p>
              )}
            </li>
          );
        }
      } else if (/^(-|\*) (.*)/.test(line)) {
        listItems.push(<li key={lineIndex}>{line.replace(/^(-|\*) /, '')}</li>);
      } else if (line.trim() !== '') {
        if (listItems.length > 0) {
          elements.push(
            <ul key={`list-${lineIndex}`} className="govuk-list">
              {listItems}
            </ul>
          );
          listItems = [];
        }
        elements.push(
          <p key={lineIndex} className="govuk-body">
            {line}
          </p>
        );
      }
    });

    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-final-${blockIndex}`} className="govuk-list">
          {listItems}
        </ul>
      );
    }

    return <div key={blockIndex}>{elements}</div>;
  });
}
