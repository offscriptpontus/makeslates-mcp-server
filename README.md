# MakeSlates MCP Server

AI-powered slide deck creation for Cursor, Claude Code, and other MCP clients.

Create beautiful presentations with natural language - just describe what you want, and the AI builds it for you.

## Try It Now

**Quick test with npx** (requires API key):

```bash
MAKESLATES_API_KEY=sk_live_your_key npx makeslates-mcp-server
```

Or configure it with your AI assistant (Cursor, Claude Code, etc) - see below.

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
      "args": ["-y", "makeslates-mcp-server"],
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
      "args": ["-y", "makeslates-mcp-server"],
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
      "args": ["-y", "makeslates-mcp-server"],
      "env": {
        "MAKESLATES_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

### 3. Restart Your Editor

After updating the config, restart Cursor/Claude to load the MCP server.

### 4. Start Creating!

Once configured, you can ask your AI assistant things like:

**Simple Requests:**
- "Create a pitch deck for my AI startup"
- "Make a presentation about Q4 results with charts"
- "Build slides explaining our new product features"

**Detailed Requests:**
```
"Create a dark mode presentation called 'AI Trends 2024' with:
- An opening slide with a striking image
- A slide showing market size is $4.2B
- A bar chart comparing adoption rates
- A two-column slide with pros and cons"
```

**Editing Existing Presentations:**
- "List my presentations"
- "Add a team slide to presentation abc-123"
- "Change slide 3 to show 50% growth instead of 40%"

The AI will automatically:
1. Call `list_templates()` to see available layouts
2. Create your presentation with `create_presentation_with_slides()`
3. Return a link: `https://makeslates.com/deck/{id}`

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

## How It Works

When you ask: **"Create a pitch deck about AI automation"**

```
You → Cursor/Claude → MakeSlates MCP Server → makeslates.com API
                           ↓
              1. list_templates() - Get available layouts
              2. create_presentation_with_slides({
                   title: "AI Automation Pitch Deck",
                   darkMode: true,
                   slides: [
                     { template: "image-full", title: "AI Automation" },
                     { template: "title-content", title: "The Problem", content: "..." },
                     { template: "big-number", number: "10x", label: "Faster" },
                     { template: "chart-bar", title: "ROI Comparison", data: [...] }
                   ]
                 })
              3. Returns: https://makeslates.com/deck/abc-123
```

The AI agent handles all the API calls - you just describe what you want!

## Example Agent Prompts

| Goal | What to Ask |
|------|-------------|
| Quick pitch deck | "Create a 5-slide pitch deck for an AI automation SaaS" |
| Data presentation | "Make slides for Q4 metrics with revenue charts showing 34% growth" |
| Product showcase | "Build a presentation about our 3 new features with images" |
| Edit existing | "Add a slide with our team bios to presentation abc-123" |
| Update content | "Change the growth number on slide 3 from 40% to 50%" |

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
