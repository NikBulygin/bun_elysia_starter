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

# Health check
curl http://localhost:3000/health
```

### Test
```bash
bun test
```

### Docker & Kubernetes Deployment

#### Docker
```bash
# Build image
docker build -t refty-infra-test .

# Run container
docker run -p 3000:3000 --env-file .env refty-infra-test

# Using docker-compose
docker-compose up -d
```

#### Kubernetes
```bash
# Apply all manifests
kubectl apply -k k8s/

# Or apply individually
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/secrets.yaml

# Check deployment status
kubectl get pods -l app=refty-infra-test
kubectl logs -l app=refty-infra-test
```

---

## Description

### What This Project Does

This is a **GitHub YAML file updater** that automatically:

1. **Searches YAML files** in a GitHub repository for Docker image references
2. **Replaces image versions** in `container` and `containers` blocks
3. **Creates commits** with the changes
4. **Pushes updates** to the repository

### API Endpoints

#### `GET /health`
Health check endpoint that monitors application status and uptime.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-15T06:25:05.577Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "github": "ok",
    "database": "ok"
  }
}
```

**Use Cases:**
- Kubernetes liveness/readiness probes
- Load balancer health checks
- Monitoring system integration
- Docker health checks

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

#### Technology Stack
- **Runtime**: Bun (fast JavaScript runtime)
- **Framework**: Elysia (lightweight web framework)
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Bun test runner
- **YAML Processing**: js-yaml
- **GitHub Integration**: GitHub REST API
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Kubernetes manifests with Kustomize

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
