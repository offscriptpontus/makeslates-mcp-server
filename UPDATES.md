# MakeSlates MCP Server - Updates & Versioning

## How Updates Work

### For Users (npx automatic updates)

When users run:
```bash
npx makeslates-mcp-server
```

**npx automatically fetches the latest version** from npm every time. No manual updates needed!

If users want to **pin to a specific version**:
```json
{
  "mcpServers": {
    "makeslates": {
      "command": "npx",
      "args": ["-y", "makeslates-mcp-server@0.1.0"],  // <- version pinned
      "env": {
        "MAKESLATES_API_KEY": "sk_live_..."
      }
    }
  }
}
```

### For Developers (Publishing Updates)

#### 1. Make Your Changes

Edit `src/index.ts` with your changes.

#### 2. Update Version

```bash
cd ~/makeslates-mcp-server

# Patch version (0.1.0 -> 0.1.1) for bug fixes
npm version patch

# Minor version (0.1.0 -> 0.2.0) for new features
npm version minor

# Major version (0.1.0 -> 1.0.0) for breaking changes
npm version major
```

This automatically:
- Updates `package.json` version
- Creates a git commit
- Creates a git tag

#### 3. Build & Publish

```bash
# Build TypeScript
npm run build

# Publish to npm
npm publish

# Push to GitHub
git push && git push --tags
```

#### 4. Users Get Updates Automatically

Next time a user runs `npx makeslates-mcp-server`, they get the new version!

---

## Version History

### 0.1.0 (2024-02-17)
- Initial release
- stdio-to-HTTP bridge for MakeSlates API
- Support for all 14 MCP tools
- Cursor, Claude Code, and Claude Desktop support

---

## Breaking Changes Policy

### Non-Breaking (Patch/Minor)
✅ Add new tools
✅ Fix bugs
✅ Improve error messages
✅ Add new optional parameters

### Breaking (Major)
⚠️ Remove tools
⚠️ Rename tools
⚠️ Change required parameters
⚠️ Change response format

When we make breaking changes:
1. Bump major version (e.g., 1.0.0 → 2.0.0)
2. Document migration steps
3. Maintain old version for 6 months

---

## Monitoring Updates

### Check Current Version
```bash
npm view makeslates-mcp-server version
```

### Check Installed Version
```bash
npx makeslates-mcp-server --version
```

### View Changelog
See GitHub releases: https://github.com/offscriptpontus/makeslates-mcp-server/releases

---

## API Compatibility

The MCP server is a **thin wrapper** around the MakeSlates HTTP API.

**When the API changes:**
- We update the MCP server to match
- Version bump based on breaking change policy
- Users get updates automatically via npx

**The HTTP API URL is configurable:**
```bash
MAKESLATES_API_URL=https://custom.example.com/api/mcp npx makeslates-mcp-server
```

This allows testing against:
- Production: `https://makeslates.com/api/mcp`
- Staging: `https://staging.makeslates.com/api/mcp`
- Local: `http://localhost:3000/api/mcp`

---

## Cache Behavior

### npx Cache

npx caches packages in `~/.npm/_npx/`.

**Force fresh install:**
```bash
npx --yes makeslates-mcp-server  # Always use latest
```

The `-y` flag in our config ensures users always get latest:
```json
"args": ["-y", "makeslates-mcp-server"]
```

### Clear Cache Manually
```bash
npm cache clean --force
```

---

## Rollback Strategy

If a bad version is published:

```bash
# Deprecate bad version
npm deprecate makeslates-mcp-server@0.2.0 "Broken - use 0.1.9"

# Publish fixed version
npm version patch
npm publish
```

Users on `npx` will get the new fixed version immediately.

---

## Testing Before Release

### 1. Local Testing
```bash
cd ~/makeslates-mcp-server
npm run build

# Test locally with your API key
MAKESLATES_API_KEY=sk_live_... node dist/index.js
```

### 2. Test with Cursor Locally
```json
{
  "mcpServers": {
    "makeslates-local": {
      "command": "node",
      "args": ["/Users/pontuskarlsson/makeslates-mcp-server/dist/index.js"],
      "env": {
        "MAKESLATES_API_KEY": "sk_live_..."
      }
    }
  }
}
```

### 3. Publish to npm with Tag
```bash
# Publish as beta first
npm version prerelease --preid=beta
npm publish --tag beta

# Test beta version
npx makeslates-mcp-server@beta

# Promote to latest
npm dist-tag add makeslates-mcp-server@0.2.0-beta.0 latest
```

---

## Support Matrix

| Editor | MCP Support | Tested |
|--------|-------------|--------|
| Cursor | ✅ | Yes |
| Claude Code | ✅ | Yes |
| Claude Desktop | ✅ | Yes |
| VS Code | ⚠️ | Via extensions |
| Other | ❓ | Depends on MCP support |

---

## Troubleshooting Updates

### "Old version still running"
1. Restart your editor completely
2. Clear npx cache: `npm cache clean --force`
3. Check installed version: `npx makeslates-mcp-server --version`

### "Can't connect to API"
1. Check API key is valid
2. Check `MAKESLATES_API_URL` if set
3. Test direct HTTP call:
```bash
curl -X POST https://makeslates.com/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_..." \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize"}'
```

### "npx not found"
Install Node.js 18+: https://nodejs.org

---

## Questions?

- **GitHub Issues**: https://github.com/offscriptpontus/makeslates-mcp-server/issues
- **Docs**: https://makeslates.com/docs
- **Status**: https://status.makeslates.com
