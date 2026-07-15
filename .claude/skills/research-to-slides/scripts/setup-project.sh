#!/usr/bin/env bash
# ============================================================================
# setup-project.sh
# Create the standard output directory structure for a research-to-slides project.
# Usage: ./setup-project.sh <project-name>
# ============================================================================

set -euo pipefail

PROJECT_NAME="${1:?Usage: ./setup-project.sh <project-name>}"
BASE_DIR="outputs/${PROJECT_NAME}"

echo "Creating project structure: ${BASE_DIR}/"
mkdir -p "${BASE_DIR}/slides"
mkdir -p "${BASE_DIR}/thumbnails"

# Create research-log.md template
cat > "${BASE_DIR}/research-log.md" << 'EOF'
# Research Log: [Project Name]

## Date
[YYYY-MM-DD]

## Topics Researched
- [Topic 1]
- [Topic 2]
- [Topic 3]

## Key Findings

### Finding 1
- **Source**: [URL]
- **Key data**: [Statistic or fact]
- **Notes**: [Summary]

### Finding 2
- **Source**: [URL]
- **Key data**: [Statistic or fact]
- **Notes**: [Summary]

## Sources
1. [Title] - [URL]
2. [Title] - [URL]
3. [Title] - [URL]

## Conflicting Information
- [Note any discrepancies between sources]

## Next Steps
- [Actions to take based on research]
EOF

# Create outline.md template
cat > "${BASE_DIR}/outline.md" << EOF
# [Presentation Title]

## Metadata
- **Target audience**: [General professional / Executives / Students / Technical team]
- **Slide count**: [10-12]
- **Language**: [English / Chinese / Bilingual]
- **Depth**: [Overview / Comprehensive]
- **Color palette**: [Describe or reference chosen palette]

## Outline

### Slide 1: Title Slide
- **Title**: [Compelling title]
- **Subtitle**: [Brief descriptor]
- **Speaker Notes**: [Context for presenter]

### Slide 2: Agenda
- [Key sections]

### Slide 3: Introduction
- [Background and context]
- [Key statistic to hook the audience]

### Slide 4: [Section 1 Topic]
- [Point 1]
- [Point 2]
- [Point 3]

### Slide 5: [Section 2 Topic]
- [Point 1]
- [Point 2]
- [Point 3]

### Slide 6: [Section 3 Topic]
- [Point 1]
- [Point 2]
- [Point 3]

### Slide 7: Data / Analysis
- [Key chart or comparison]
- [Supporting statistics]

### Slide 8: [Section 4 Topic]
- [Point 1]
- [Point 2]
- [Point 3]

### Slide 9: Implications / Takeaways
- [What this means]
- [Why it matters]

### Slide 10: Conclusion
- [Key summary points]
- [Call to action or next steps]

### Slide 11: Q&A / Thank You
- [Closing remark]
- [Contact information]
EOF

echo "Project structure created successfully!"
echo "  ${BASE_DIR}/research-log.md"
echo "  ${BASE_DIR}/outline.md"
echo "  ${BASE_DIR}/slides/"
echo "  ${BASE_DIR}/thumbnails/"
echo ""
echo "Next steps:"
echo "  1. Fill in the outline with your research"
echo "  2. Run the research-to-slides skill to generate the PPTX"
