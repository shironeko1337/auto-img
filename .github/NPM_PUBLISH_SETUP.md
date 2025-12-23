# NPM Publishing Setup Guide

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **Package Names**: Ensure your package names are available on npm
3. **GitHub Repository**: Your code should be on GitHub

## Step 1: Get NPM Access Token

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Click your profile icon → **Access Tokens**
3. Click **Generate New Token** → **Classic Token**
4. Select **Automation** (for CI/CD use)
5. Copy the token (you won't see it again!)

## Step 2: Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click **Add secret**

## Step 3: Update Package.json Files

Ensure each publishable package has:

```json
{
  "name": "autoimg-core",
  "version": "0.1.0",
  "private": false,  // Remove or set to false
  "publishConfig": {
    "access": "public"
  }
}
```

## Step 4: Publishing Workflow

### Option A: Automatic (Recommended)
When you're ready to publish:

```bash
# 1. Update version in package.json files
npm version patch -w packages/core  # or minor, major

# 2. Commit changes
git add .
git commit -m "chore: bump version to 0.1.1"

# 3. Create and push a tag
git tag v0.1.1
git push origin main --tags
```

The GitHub Action will automatically:
- Run tests
- Build packages
- Publish to npm

### Option B: Manual Trigger
1. Go to **Actions** tab in GitHub
2. Select **Publish to npm** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## Step 5: Verify Publication

After the workflow completes:
1. Check npm: `npm view @shironeko1052/autoimg-core`
2. Visit package page: `https://www.npmjs.com/package/autoimg-core`

## Workflows

### 1. `ci.yml` - Continuous Integration
- **Triggers**: Push to main/develop, Pull Requests
- **Actions**: Test all packages → Build all packages
- **Uses**: Local workspace code (via npm workspaces)
- **Purpose**: Catch issues early during development

### 2. `publish.yml` - Test & Publish
- **Triggers**: When you push a version tag (v*.*.*)
- **Actions**: Test all packages → Build all packages → Publish to npm
- **Uses**: Local workspace code for testing
- **Publishes in order**: core → webcomponent → react → vue → demo
- **Node version**: 24

## Troubleshooting

### "Package name already exists"
- Choose a different package name
- Or request ownership if you own the package

### "401 Unauthorized"
- Check NPM_TOKEN is correctly set in GitHub Secrets
- Ensure token has automation permissions
- Token might be expired (regenerate)

### "npm ERR! code ENEEDAUTH"
- The package might be private
- Add `"publishConfig": { "access": "public" }` to package.json

### Build fails before publish
- Run `npm run build:prod --workspaces` locally first
- Check all tests pass: `npm test --workspaces`

## Best Practices

1. **Versioning**: Use semantic versioning (semver)
   - Patch (0.1.0 → 0.1.1): Bug fixes
   - Minor (0.1.0 → 0.2.0): New features, backwards compatible
   - Major (0.1.0 → 1.0.0): Breaking changes

2. **Testing**: Always test before publishing
   ```bash
   npm test --workspaces
   npm run build:prod --workspaces
   ```

3. **Dry Run**: Test publishing without actually publishing
   ```bash
   npm publish --dry-run --workspace=packages/core
   ```

4. **Provenance**: The workflow uses `--provenance` flag for supply chain security
   - Requires `id-token: write` permission
   - Adds build transparency to npm packages

## Package-Specific Notes

Your monorepo has these publishable packages:
- `autoimg-core` - Core library
- `autoimg` - Web component (from webcomponent package)
- `autoimg-react` - React wrapper
- `autoimg-vue` - Vue wrapper
- `autoimg-demo` - Demo app (set as private, won't publish)

Make sure package names match across:
- package.json `name` field
- README badges
- Import statements in examples
