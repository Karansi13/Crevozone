interface ProcessedSection {
  heading: string
  content: string[]
}

export function processOpenAIResponse(text: string): ProcessedSection[] {
  if (!text) return []

  const lines = text.split("\n").map(line => line.trim()).filter(line => line !== "")
  const sections: ProcessedSection[] = []
  let currentSection: ProcessedSection | null = null

  lines.forEach((line) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      // Match Markdown-style headings: **Heading** or ## Heading ##
      if (currentSection) sections.push(currentSection)
      currentSection = {
        heading: line.replace(/(\*\*|##)/g, "").trim(),
        content: [],
      }
    } else if (currentSection) {
      currentSection.content.push(line)
    } else {
      // Handle text before any heading
      if (sections.length === 0) {
        sections.push({ heading: "", content: [line] })
      } else {
        sections[sections.length - 1].content.push(line)
      }
    }
  })

  if (currentSection) sections.push(currentSection)

  return sections
}
