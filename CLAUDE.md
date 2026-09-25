# Playwright Page Object Generator

## Communication & Workflow Rules

1. **Always communicate in English**

2. **Input/Output Directory Protocol**
   - Scripts/tests/product should never modify or delete files in `Test_Data` directories
   - Scripts/tests/product should always save generated files to `output` directories
   - Test fixtures and scripts are to be stored in the folder Tests

3. **Virtual Environment Requirement**
   - If applicable, always use a Python virtual environment for this project
   - Activate venv before running any Python code
   - Add `venv/` to `.gitignore`

4. **Code Quality Before Commits**
   - Run `ruff check` and `mypy` linters before committing any code
   - Ensure all linting passes before creating commits
   - Document any linter exceptions in comments with reasoning