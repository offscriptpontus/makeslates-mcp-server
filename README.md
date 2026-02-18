# MakeSlates MCP Server

AI-powered slide deck creation for Cursor, Claude Code, and other MCP clients.

Create beautiful presentations with natural language - just describe what you want, and the AI builds it for you.

## Quick Start

### 1. Get Your API Key

1. Go to [makeslates.com/settings](https://makeslates.com/settings)
2. Sign in and generate an API key
3. Copy your `sk_live_...` key

### 2. Configure Your MCP Client

#### For Cursor

Add to your Cursor MCP settings (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "makeslates": {
      "command": "npx",
      "args": ["-y", "@makeslates/mcp-server"],
      "env": {
        "MAKESLATES_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

#### For Claude Code

Add to `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "makeslates": {
      "command": "npx",
      "args": ["-y", "@makeslates/mcp-server"],
      "env": {
        "MAKESLATES_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

#### For Claude Desktop

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "makeslates": {
      "command": "npx",
      "args": ["-y", "@makeslates/mcp-server"],
      "env": {
        "MAKESLATES_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

### 3. Start Creating!

Once configured, you can ask your AI assistant things like:

- "Create a pitch deck for my AI startup"
- "Make a presentation about Q4 results with charts"
- "Build slides explaining our new product features"

## Available Tools

| Tool | Description |
|------|-------------|
| `list_templates` | List all slide templates (call this first!) |
| `create_presentation_with_slides` | Create a full presentation in one call |
| `list_presentations` | List your presentations |
| `get_presentation` | Get a presentation with all slides |
| `add_slide_from_template` | Add a slide using a template |
| `update_slide` | Update slide content |
| `delete_slide` | Remove a slide |
| `get_upload_url` | Get URL for image uploads |

## Slide Templates

### Opening Slides
- `image-full` - Full-bleed image with title (best for first slide)
- `title` - Title and subtitle
- `section` - Section divider

### Content Slides
- `title-content` - Header with bullet points
- `two-column` - Side-by-side comparison
- `three-column` - Three parallel points
- `image-left` / `image-right` - Image with text

### Impact Slides
- `big-number` - Single impressive metric
- `quote` - Featured quotation
- `statement` - Bold claim with visual

### Data Slides
- `chart-bar` - Bar chart
- `chart-pie` - Pie chart
- `chart-line` - Line chart

## Example Usage

```javascript
// The AI will call these tools for you based on natural language

// 1. List available templates
list_templates()

// 2. Create a presentation
create_presentation_with_slides({
  title: "Q4 Results",
  darkMode: true,
  slides: [
    { template: "image-full", title: "Q4 2024 Results" },
    { template: "big-number", number: "+34%", label: "Revenue Growth" },
    { template: "chart-bar", title: "Revenue by Region", data: [...] },
    { template: "two-column", title: "Key Wins", leftContent: "...", rightContent: "..." }
  ]
})
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MAKESLATES_API_KEY` | Your API key from makeslates.com | Yes |
| `MAKESLATES_API_URL` | Custom API URL (default: https://makeslates.com/api/mcp) | No |

## Links

- **Website**: [makeslates.com](https://makeslates.com)
- **Documentation**: [makeslates.com/docs](https://makeslates.com/docs)
- **Issues**: [GitHub Issues](https://github.com/offscriptpontus/makeslates-mcp-server/issues)

## License

MIT
