# Contributing to PetPro

Thank you for your interest in contributing to PetPro! This document provides guidelines and instructions for contributing to our codebase.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

1. **Fork the repository** you want to contribute to
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/repository-name.git
   cd repository-name
   ```
3. **Set up the development environment**
   ```bash
   # Install dependencies
   npm install
   
   # Start the development server
   npm run dev
   ```
4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### 1. Pick an Issue

- Choose an open issue to work on, or create a new one to discuss the change you'd like to make.
- Comment on the issue to let others know you're working on it.
- If applicable, join the discussion to clarify requirements.

### 2. Write Your Code

- Follow our [Coding Standards](./CODING_STANDARDS.md).
- Write tests for your code.
- Keep your changes focused and limited to the scope of the issue.

### 3. Commit Your Changes

- Use meaningful commit messages that follow our conventions:
  ```
  type(scope): short description
  
  Longer description if needed
  
  Refs #issue_number
  ```
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
  - Example: `feat(auth): add user login endpoint`

### 4. Submit a Pull Request

- Push your branch to your fork
  ```bash
  git push origin feature/your-feature-name
  ```
- Create a pull request against the main repository's `develop` branch
- Fill out the pull request template
- Link the relevant issue(s)

### 5. Code Review

- All pull requests require at least one review from a maintainer
- Address review feedback by adding new commits to your branch
- Once approved, a maintainer will merge your changes

## Pull Request Guidelines

- Keep PRs focused on a single issue or feature
- Include tests for new functionality
- Update documentation if necessary
- Make sure CI passes before requesting review
- Squash commits if requested

## Testing

- Write unit tests for all new code
- Run existing tests to ensure they still pass
  ```bash
  npm test
  ```
- For frontend changes, test across multiple browsers if possible

## Documentation

- Update README.md if you change functionality
- Document new features
- Keep API documentation up to date
- Comment your code where necessary

## Branch Protection Rules

Our repositories enforce the following branch protection rules:

### Main/Master Branch
- Require pull request reviews before merging
- Require status checks to pass before merging
- Require linear history
- Include administrators in these restrictions

### Develop Branch
- Require at least one review before merging
- Require status checks to pass
- Allow force pushes for repository administrators

## Additional Resources

- [Project Documentation](../README.md)
- [Issue Templates](./.github/ISSUE_TEMPLATE)
- [Coding Standards](./CODING_STANDARDS.md)

## Questions?

If you have any questions, please feel free to create an issue with the label "question" or contact the maintainers directly.

Thank you for contributing to PetPro!
