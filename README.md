# Refty Infrastructure Test

## TL;DR - Quick Start

### Prerequisites
- [Bun](https://bun.sh/) runtime
- GitHub Personal Access Token with `Contents` permission

### Setup & Run
```bash
# Clone and install
bun install
# Set up environment file
cp env.example .env
# Edit .env with your GitHub token and repository URL:
# REPOSITORY_URL=https://github.com/username/repository
# BRANCH=main
# API_KEY=github_pat_your_token_here

# Build and start server
bun run build
bun run dev
```

### Usage with curl
```bash
# Basic deployment
curl -X POST http://localhost:3000/deployments \
  -H "Content-Type: application/json" \
  -d '{
    "image": "ghcr.io/refty-yapi/refty-node/refty-node",
    "version": "05-06-42a252"
  }'

# With detailed response
curl -X POST "http://localhost:3000/deployments?details=true" \
  -H "Content-Type: application/json" \
  -d '{
    "image": "ghcr.io/refty-yapi/refty-node/refty-node",
    "version": "05-06-42a252"
  }'

# View Swagger docs
curl http://localhost:3000/swagger
```

### Test
```bash
bun test
```

---

## Description

### What This Project Does

This is a **GitHub YAML file updater** that automatically:

1. **Searches YAML files** in a GitHub repository for Docker image references
2. **Replaces image versions** in `container` and `containers` blocks
3. **Creates commits** with the changes
4. **Pushes updates** to the repository

### Key Features

#### 🔍 **Smart YAML Detection**
- Automatically finds all `.yml` and `.yaml` files in the repository
- Searches through nested directories
- Supports complex YAML structures with multiple containers

#### 🐳 **Docker Image Version Replacement**
- Updates image versions in Kubernetes deployment files
- Handles both single `container` and multiple `containers` blocks
- Preserves YAML structure and formatting
- Supports any Docker image format (ghcr.io, docker.io, etc.)

#### 🔄 **GitHub Integration**
- Uses GitHub API for file operations
- Creates commits with descriptive messages
- Supports automatic push or manual review
- Includes rollback functionality for testing

#### 📊 **Detailed Reporting**
- Returns list of changed files
- Shows old vs new versions for each change
- Provides commit SHA for tracking
- Optional detailed response with full change information

### API Endpoints

#### `POST /deployments`
Updates Docker image versions in YAML files.

**Request:**
```json
{
  "image": "ghcr.io/refty-yapi/refty-node/refty-node",
  "version": "05-06-42a252"
}
```

**Response (basic):**
```json
{
  "success": true,
  "image": "ghcr.io/refty-yapi/refty-node/refty-node",
  "version": "05-06-42a252",
  "timestamp": "2025-07-15T06:25:05.577Z"
}
```

**Response (with `?details=true`):**
```json
{
  "success": true,
  "image": "ghcr.io/refty-yapi/refty-node/refty-node",
  "version": "05-06-42a252",
  "timestamp": "2025-07-15T06:25:05.577Z",
  "details": {
    "filesChanged": 3,
    "filePaths": ["deployment.yaml", "config.yaml"],
    "changes": [
      {
        "file": "deployment.yaml",
        "oldVersion": "05-06-42a251",
        "newVersion": "05-06-42a252"
      }
    ],
    "commitSha": "abc123def456"
  }
}
```

### Configuration

#### Environment Variables (`.env`)
```bash
# Repository Configuration
REPOSITORY_URL=https://github.com/username/repository
BRANCH=main

# GitHub API Key (Personal Access Token)
API_KEY=github_pat_...
```

#### Required GitHub Token Permissions
- **Contents**: Read and write repository contents (required for commits)
- **Repository access**: Select specific repository or all repositories

### Architecture

#### Core Modules
- **`ReplaceYml.ts`**: Main orchestration function
- **`searchYmlFiles.ts`**: GitHub API integration for file discovery
- **`replaceString.ts`**: YAML parsing and image replacement logic
- **`commit.ts`**: GitHub commit creation
- **`push.ts`**: GitHub push operations
- **`rollback.ts`**: Test rollback functionality

#### Technology Stack
- **Runtime**: Bun (fast JavaScript runtime)
- **Framework**: Elysia (lightweight web framework)
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Bun test runner
- **YAML Processing**: js-yaml
- **GitHub Integration**: GitHub REST API

### Use Cases

1. **CI/CD Pipeline Integration**: Automatically update deployment files when new Docker images are built
2. **Environment Management**: Keep staging/production environments in sync with latest image versions
3. **Infrastructure as Code**: Maintain Kubernetes manifests with current image versions
4. **Testing**: Quickly update test environments with new image versions

### Testing

The project includes comprehensive tests:
- GitHub API authentication and permissions
- YAML file discovery and content fetching
- Image version replacement logic
- Commit creation and push operations
- Rollback functionality
- API endpoint testing

Run tests with:
```bash
bun test
```

### Development

#### Project Structure
```
src/
├── api/deployments/          # API endpoints
├── types/                    # TypeScript type definitions
├── utils/Integration/Github/ # GitHub integration modules
└── index.ts                  # Main server entry point
```

#### Key Commands
```bash
bun run dev      # Start development server
bun test         # Run all tests
bun run build    # Build for production
```

### Security Considerations

- GitHub tokens should have minimal required permissions
- Use fine-grained tokens for production environments
- Repository access should be limited to specific repositories
- Consider implementing authentication for the API endpoints

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### License

[Add your license here] 