# Repository guidance

This repository is a Chinese-language VitePress knowledge base. Keep changes concise, technically accurate, and consistent with the surrounding notes.

## Review workflow

When asked to review code, documentation, a commit, or the current changes:

1. Read `.github/prompts/review-commit.prompt.md` completely and treat it as the authoritative review rubric.
2. Review staged changes by default. If nothing is staged but the working tree has changes, state that clearly and review the unstaged changes when that matches the user's apparent intent.
3. Inspect enough surrounding content and repository configuration to validate technical accuracy, Markdown structure, internal links, navigation, and build impact.
4. For code, prioritize correctness, regressions, security, and missing tests. For documentation, prioritize factual accuracy, clarity, consistency, Markdown validity, and broken links.
5. Run proportionate checks, including `git diff --check` and `pnpm docs:build` when relevant.
6. Report findings first, ordered by severity, with precise file and line references. Include directly applicable corrected text for obvious wording or formatting defects.
7. Explicitly cover content and formatting, change scope, and a Conventional Commits message. Use `docs` for updates to existing notes and `feat` for a genuinely new topic or article.
8. If there are no actionable findings, say so plainly and mention any validation gaps.

Do not modify reviewed files unless the user also asks for fixes.

## Project checks

- Install dependencies: `pnpm install`
- Format: `pnpm format`
- Build documentation: `pnpm docs:build`
- Preview documentation: `pnpm docs:preview`

Preserve unrelated user changes and do not commit or push unless explicitly requested.
