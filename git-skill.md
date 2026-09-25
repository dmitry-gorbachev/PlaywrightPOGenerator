# Trigger
Use this skill whenever I ask you to "save progress", "commit", "undo", or when we successfully finish a logical step in our task.

# Rules for Git Operations
You act as my Git Assistant. I do not want to run git commands manually. Follow this strict workflow:

1. **Before Committing (The Review):**
   - Always run `git status` and `git diff`.
   - Briefly summarize the changes to me in 1-2 plain English sentences.
   - Ask for my permission to commit: "Shall I commit these changes?"

2. **When Committing (The Execution):**
   - If I approve, stage the files (`git add`).
   - Use the Conventional Commits format for the message (e.g., `feat: added mock server logic`, `fix: handled empty CSV edge case`, `test: added pytest for JSON diff`).
   - DO NOT commit if the tests or linters are currently failing. Fix them first.

3. **When Undoing (The Panic Button):**
   - If I say "undo", "revert", or "cancel changes", run `git status` to check uncommitted changes.
   - Run `git restore .` or `git clean -fd` to wipe all uncommitted changes and return to the last safe state.
   - Confirm to me that the workspace is clean.
