import type { ReactNode } from 'react'

// Tiny, dependency-free markdown -> React renderer.
// Supports: ## h2, ### h3, paragraphs, unordered (-) and ordered (1.) lists,
// inline **bold**, *italic*, and [text](url) links.
// Inline transforms operate on already-React children, so no dangerouslySetInnerHTML.

type InlineNode = ReactNode

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g
const BOLD_RE = /\*\*([^*]+)\*\*/g
const ITALIC_RE = /(?<!\*)\*([^*]+)\*(?!\*)/g

function applyInlinePattern(
  nodes: InlineNode[],
  re: RegExp,
  wrap: (match: string, groups: string[], key: string) => InlineNode,
): InlineNode[] {
  const out: InlineNode[] = []
  let counter = 0
  for (const node of nodes) {
    if (typeof node !== 'string') {
      out.push(node)
      continue
    }
    let lastIndex = 0
    re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(node)) !== null) {
      if (m.index > lastIndex) out.push(node.slice(lastIndex, m.index))
      out.push(wrap(m[0], m.slice(1), `inl-${counter++}`))
      lastIndex = m.index + m[0].length
    }
    if (lastIndex < node.length) out.push(node.slice(lastIndex))
  }
  return out
}

function renderInline(text: string): InlineNode[] {
  let nodes: InlineNode[] = [text]
  // Links first (so '*' inside link text isn't misread)
  nodes = applyInlinePattern(nodes, LINK_RE, (_full, [label, href], key) => {
    const isExternal = /^https?:\/\//i.test(href)
    return (
      <a
        key={key}
        href={href}
        className="text-[#00D68F] underline underline-offset-4 hover:text-[#00B578]"
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {label}
      </a>
    )
  })
  nodes = applyInlinePattern(nodes, BOLD_RE, (_full, [inner], key) => (
    <strong key={key} className="font-semibold text-[#1A1A1A]">
      {inner}
    </strong>
  ))
  nodes = applyInlinePattern(nodes, ITALIC_RE, (_full, [inner], key) => (
    <em key={key}>{inner}</em>
  ))
  return nodes
}

type Block =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i++
      continue
    }

    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3).trim() })
      i++
      continue
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4).trim() })
      i++
      continue
    }

    if (/^- /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^- /.test(lines[i])) {
        items.push(lines[i].slice(2).trim())
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, '').trim())
        i++
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    // Paragraph: collect until blank line or block boundary
    const paraLines: string[] = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith('## ') &&
      !lines[i].startsWith('### ') &&
      !/^- /.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      paraLines.push(lines[i])
      i++
    }
    blocks.push({ type: 'p', text: paraLines.join(' ') })
  }

  return blocks
}

export function renderMarkdown(md: string): ReactNode {
  const blocks = parseBlocks(md)
  return blocks.map((b, idx) => {
    const key = `b-${idx}`
    switch (b.type) {
      case 'h2':
        return (
          <h2
            key={key}
            className="mt-12 text-2xl font-semibold tracking-[-0.03em] text-[#1A1A1A] sm:text-3xl"
          >
            {renderInline(b.text)}
          </h2>
        )
      case 'h3':
        return (
          <h3
            key={key}
            className="mt-8 text-xl font-semibold tracking-[-0.02em] text-[#1A1A1A]"
          >
            {renderInline(b.text)}
          </h3>
        )
      case 'p':
        return (
          <p key={key} className="mt-5 text-base leading-7 text-[#374151]">
            {renderInline(b.text)}
          </p>
        )
      case 'ul':
        return (
          <ul key={key} className="mt-5 list-disc space-y-2 pl-6 text-base leading-7 text-[#374151]">
            {b.items.map((it, j) => (
              <li key={`${key}-li-${j}`}>{renderInline(it)}</li>
            ))}
          </ul>
        )
      case 'ol':
        return (
          <ol key={key} className="mt-5 list-decimal space-y-2 pl-6 text-base leading-7 text-[#374151]">
            {b.items.map((it, j) => (
              <li key={`${key}-li-${j}`}>{renderInline(it)}</li>
            ))}
          </ol>
        )
    }
  })
}
