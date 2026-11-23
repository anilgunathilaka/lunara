import { Fragment, type ReactNode } from 'react';

/**
 * Renders approved policy text (content/policies/) written in a small slice
 * of Markdown: # / ## / ### headings, "- " list items, "---" rules, blank
 * lines between paragraphs, each new line inside a paragraph a line break
 * (editors strip Markdown's two trailing spaces, so they are not relied on), **bold**,
 * *italic*, and bare https:// or e-mail addresses as links. The words are
 * shown exactly as approved; nothing is rewritten.
 */
export function PolicyText({ source }: { source: string }) {
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (para.length === 0) return;
    const lines = para;
    blocks.push(
      <p key={blocks.length}>
        {lines.map((line, i) => (
          <Fragment key={i}>
            {inline(line.trimEnd())}
            {i < lines.length - 1 && <br />}
          </Fragment>
        ))}
      </p>,
    );
    para = [];
  };
  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={blocks.length}>
        {list.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const line of source.split('\n')) {
    const heading = /^(#{1,3}) (.*)$/.exec(line);
    if (heading) {
      flushPara();
      flushList();
      const [, hashes = '', words = ''] = heading;
      const Tag = hashes.length === 1 ? 'h1' : hashes.length === 2 ? 'h2' : 'h3';
      blocks.push(<Tag key={blocks.length}>{inline(words)}</Tag>);
    } else if (line.startsWith('- ')) {
      flushPara();
      list.push(line.slice(2));
    } else if (line.trim() === '---') {
      flushPara();
      flushList();
      blocks.push(<hr key={blocks.length} />);
    } else if (line.trim() === '') {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();

  return <div className="policy-text">{blocks}</div>;
}

/** **bold**, *italic*, and bare web or e-mail addresses as links. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|(https:\/\/[^\s]+)|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const at = match.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const key = out.length;
    if (match[1] !== undefined) out.push(<strong key={key}>{inline(match[1])}</strong>);
    else if (match[2] !== undefined) out.push(<em key={key}>{inline(match[2])}</em>);
    else if (match[3] !== undefined)
      out.push(
        <a key={key} href={match[3]} className="policy-link">
          {match[3].replace(/^https:\/\//, '')}
        </a>,
      );
    else if (match[4] !== undefined)
      out.push(
        <a key={key} href={`mailto:${match[4]}`} className="policy-link">
          {match[4]}
        </a>,
      );
    last = at + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
