import fs from 'fs'
import path from 'path'

interface KbDocument {
  filename: string
  content: string
  score: number
}

export function retrieveKbContext(clinicId: string, userMessage: string): string {
  const kbDir = path.join(process.cwd(), 'data', 'kb', clinicId)

  if (!fs.existsSync(kbDir)) {
    return ''
  }

  const files = fs.readdirSync(kbDir).filter((f) => f.endsWith('.md'))
  const message = userMessage.toLowerCase()

  const scored: KbDocument[] = files.map((filename) => {
    const filePath = path.join(kbDir, filename)
    const content = fs.readFileSync(filePath, 'utf-8')
    const words = content.toLowerCase().split(/\s+/)
    const queryWords = message.split(/\s+/).filter((w) => w.length > 3)

    // Score = number of query words found in the document
    const score = queryWords.reduce((total, word) => {
      return total + (words.includes(word) ? 1 : 0)
    }, 0)

    // Boost documents that match the topic by filename
    const filenameBoost =
      (message.includes('hour') && filename.includes('hour')) ||
      (message.includes('price') && filename.includes('pric')) ||
      (message.includes('cost') && filename.includes('pric')) ||
      (message.includes('emergency') && filename.includes('emergency')) ||
      (message.includes('after') && filename.includes('after')) ||
      (message.includes('service') && filename.includes('service')) ||
      (message.includes('treat') && filename.includes('service')) ||
      (message.includes('faq') && filename.includes('faq'))
        ? 3
        : 0

    return { filename, content, score: score + filenameBoost }
  })

  // Return top 3 scoring documents
  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .filter((doc) => doc.score > 0)

  if (top.length === 0) {
    // If nothing matched, return the FAQ and hours as default context
    const fallback = scored.filter((d) =>
      ['faq.md', 'hours.md'].includes(d.filename)
    )
    return fallback.map((d) => d.content).join('\n\n---\n\n')
  }

  return top.map((d) => d.content).join('\n\n---\n\n')
}
