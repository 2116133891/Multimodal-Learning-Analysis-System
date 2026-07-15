---
name: research-to-slides
description: "Research a topic from the web and generate a professional PowerPoint presentation. When the user gives you a topic, this skill performs comprehensive online research, synthesizes the findings into a structured outline, and uses the pptx skill to generate a polished .pptx presentation."
---

# Research-to-Slides: Web Research → Professional PPTX

## Overview

This skill automates the full pipeline: **topic → web research → structured outline → PPTX generation**.
It leverages the built-in `WebSearch` and `WebFetch` tools for research, then calls the `pptx` skill for presentation creation.

## Workflow

### Phase 1: Clarification

When the user gives a topic, first clarify:

1. **Audience**: Who is this presentation for? (e.g., executives, students, technical team)
2. **Slide count**: How many slides approximately? (default: 10-15)
3. **Language**: English, Chinese, or bilingual? (default: matches user's language)
4. **Depth**: Quick overview or deep dive?
5. **Design style**: Any color preference or template requirement?

If the user doesn't specify, use sensible defaults:
- Audience: General professional
- Slides: 10-12
- Language: Same as user's prompt
- Depth: Comprehensive
- Style: Modern, content-informed palette

### Phase 2: Web Research

Perform thorough research using available tools:

1. **Initial search** (`WebSearch`):
   - Search for the topic from multiple angles
   - Use 3-5 different queries to get diverse perspectives
   - Example: `"topic" AND "overview"`, `"topic" AND "trends"`, `"topic" AND "statistics"`

2. **Deep fetch** (`WebFetch`):
   - Fetch the top 5-8 most relevant results
   - Prioritize authoritative sources: academic papers, government sites, established news outlets, industry reports
   - Extract key data points, statistics, quotes, and trends

3. **Cross-verify**:
   - Compare information across sources
   - Note any conflicting data
   - Prioritize the most recent and reliable information

4. **Research log** (`research-log.md`):
   - Save a brief summary of findings to `outputs/<project-name>/research-log.md`
   - Include source URLs for traceability
   - Note key statistics and data points found

### Phase 3: Content Structuring

Transform research into a slide-by-slide outline:

1. **Create outline** (`outline.md`):
   ```markdown
   # [Presentation Title]
   ## Target: [Slide count] slides

   ### Slide 1: Title Slide
   - Title: [Compelling title]
   - Subtitle: [Brief descriptor]
   - Speaker Notes: [Context for presenter]

   ### Slide 2: Agenda / Table of Contents
   - [Key sections]

   ### Slide 3: Introduction / Background
   - [Key points with data]

   ### Slide 4: [Section Topic]
   - [Bullet points]
   - [Supporting data/statistics]

   [... continue for all slides ...]

   ### Slide N: Conclusion / Summary
   - [Key takeaways]

   ### Slide N+1: Q&A / Thank You
   - [Contact info or closing remark]
   ```

2. **Content principles**:
   - Each slide: 1 main idea, 3-5 bullet points max
   - Lead with the strongest data/statistic
   - Use active voice and concise phrasing
   - Include speaker notes for elaboration
   - Balance text with visual opportunities (charts, diagrams, comparisons)

3. **Save outline** to `outputs/<project-name>/outline.md`

### Phase 4: Design Planning

Before generating the PPTX:

1. **Choose a color palette** informed by the topic (refer to pptx skill's color palette section)
2. **Decide slide layouts**:
   - Title slide: Centered, bold
   - Content slides: Two-column (text left, visual right) or full-slide for impact
   - Data slides: Large numbers, minimal text
   - Comparison slides: Side-by-side layout
3. **Plan visuals**: Where to use charts, icons, images, or whitespace

### Phase 5: PPTX Generation

Now use the `pptx` skill's **html2pptx** workflow to create the presentation:

1. Read `html2pptx.md` completely (no range limits)
2. Create one HTML file per slide in `outputs/<project-name>/slides/`
   - Dimensions: 720pt × 405pt (16:9)
   - Use semantic HTML: `<h1>`-`<h6>`, `<p>`, `<ul>`, `<ol>`
   - Use `class="placeholder"` for charts/tables
3. Run the conversion script
4. Generate thumbnail grid for visual validation
5. Iterate until all slides are correct

### Phase 6: Validation & Delivery

1. **Visual check**: Review thumbnail grid for:
   - Text cutoff or overlap
   - Poor contrast
   - Misaligned elements
2. **Content check**: Verify all key research findings are represented
3. **Speaker notes**: Ensure notes are helpful for the presenter
4. **Final output**: Save as `outputs/<project-name>/<presentation-name>.pptx`

## Output Directory Structure

```
outputs/<project-name>/
├── research-log.md          # Research findings with sources
├── outline.md               # Slide-by-slide content outline
├── slides/                  # HTML files for each slide
│   ├── slide-01-title.html
│   ├── slide-02-agenda.html
│   └── ...
├── presentation.pptx        # Final output
└── thumbnails/              # Visual validation grid
    └── thumbnails.jpg
```

## Quality Checklist

Before delivering the presentation, verify:

- [ ] Research covered at least 5 authoritative sources
- [ ] Key statistics and data points are included
- [ ] Each slide has a clear, singular message
- [ ] Color palette matches the topic and audience
- [ ] Font sizes are readable (minimum 18pt for body, 24pt for headers)
- [ ] Speaker notes provide additional context
- [ ] No text cutoff or overlap issues
- [ ] Consistent design throughout
- [ ] Grammar and spelling are correct
- [ ] Source URLs are traceable (in research-log.md)

## Tips

- For **technical topics**: Include architecture diagrams, code snippets, and comparison tables
- For **business topics**: Focus on metrics, ROI, market share, and competitive analysis
- For **educational topics**: Use progressive disclosure, examples, and summary slides
- For **trending topics**: Include timeline slides showing evolution and future projections
- Always cite sources in speaker notes or footnotes where appropriate
