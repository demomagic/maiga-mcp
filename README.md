# Maiga API MCP Server

A Model Context Protocol (MCP) server that provides comprehensive integration with the Maiga API for cryptocurrency analysis, including token analysis, market reports, KOL insights, and trending token discovery.

## Overview

This MCP server enables AI assistants and applications to interact with Maiga's cryptocurrency analysis platform through a standardized protocol. It provides access to technical and fundamental analysis, social sentiment analysis, token holder information, market reports, KOL (Key Opinion Leader) analytics, and trending token discovery.

## Features

### Available Tools

- **Token Analysis** (`maiga_analyse_token`) - Performs comprehensive technical and fundamental analysis on cryptocurrency tokens
- **Mindshare Analysis** (`maiga_mindshare`) - Analyzes social media sentiment and trending discussions about tokens over the last 24 hours
- **Token Information** (`maiga_token_info`) - Retrieves detailed token holder information and on-chain analysis
- **Market Reports** (`maiga_market_report`) - Generates specialized market reports (Market Behavior, Open Interest, Multi-Timeframe, Fund Flow)
- **KOL Analysis** (`maiga_kol_analysis`) - Analyzes the influence and statistics of cryptocurrency influencers on X (Twitter)
- **Trending Tokens** (`maiga_trending_tokens`) - Retrieves top trending tokens in the last 24 hours based on social media mentions and activity

## Prerequisites

- Node.js (v16 or higher)
- npm, yarn, pnpm, or bun
- Maiga Partner API token (contact your account manager to obtain)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd maiga
```

2. Install dependencies:
```bash
npm install
```

3. Obtain a Maiga Partner API token:
   - Contact your Maiga account manager to obtain your partner API token
   - Keep your API token secure and ready for configuration

## Configuration

The server requires the following configuration:

- `apiToken` (required): Your Maiga Partner API token for authentication

### Configuration Methods

#### 1. Smithery Playground (Development)

When running `npm run dev`, the Smithery Playground will open in your browser. Enter your `apiToken` in the configuration section.

#### 2. URL Parameters (Testing)

When connecting via HTTP, pass configuration as URL query parameters:

```
http://localhost:8081/mcp?apiToken=your_api_token_here
```

#### 3. Production Configuration

Once deployed to Smithery, users can securely manage their configurations through the configuration UI. Saved configurations are automatically applied when connecting to the server.

## Development

Start the development server:
```bash
npm run dev
```

This will:
- Start the MCP server on port 8081 (or custom port with `--port` flag)
- Enable hot reloading
- Open the Smithery Playground in your browser for testing

## Build

Build for production:
```bash
npm run build
```

Creates a bundled server in `.smithery/` directory.

## Usage

### With MCP-Compatible Applications

This server can be used with any application that supports the Model Context Protocol, such as:

- Claude Desktop
- MCP-enabled IDEs
- Custom MCP clients
- Smithery Playground

### Tool Examples

**Analyze a token:**
```
maiga_analyse_token(identifier: "bitcoin")
```

**Get mindshare analysis:**
```
maiga_mindshare(identifier: "ethereum")
```

**Get token holder information:**
```
maiga_token_info(identifier: "0x1234567890abcdef...")
```

**Generate market report:**
```
maiga_market_report(mode: "Market_Behavior")
```

**Analyze a KOL:**
```
maiga_kol_analysis(username: "cz_binance")
```

**Get trending tokens:**
```
maiga_trending_tokens()
```

## API Reference

### Token Operations

- **`maiga_analyse_token(identifier)`** - Comprehensive token analysis
  - Parameters:
    - `identifier` (string, required): Token symbol (e.g., "bitcoin", "ethereum", "BTC") or contract address
  - Returns: Technical analysis, price data, market cap, links, and analysis text

- **`maiga_mindshare(identifier)`** - Social media sentiment analysis
  - Parameters:
    - `identifier` (string, required): Token symbol or contract address
  - Returns: Social sentiment analysis and trending discussions from the last 24 hours

- **`maiga_token_info(identifier)`** - Token holder and on-chain analysis
  - Parameters:
    - `identifier` (string, required): Token contract address or identifier
  - Returns: Top holders, holder distribution analysis, and token information

### Market Analysis

- **`maiga_market_report(mode)`** - Generate market reports
  - Parameters:
    - `mode` (enum, required): Analysis mode
      - `"Market_Behavior"` - Overall market sentiment and behavior patterns
      - `"Open_Interest"` - Futures and derivatives open interest analysis
      - `"Multi_Timeframe"` - Multi-timeframe technical analysis
      - `"Fund_Flow"` - Capital flow and whale movement analysis
  - Returns: Mode-specific market analysis data

### Social & Influencer Analysis

- **`maiga_kol_analysis(username)`** - KOL influence analysis
  - Parameters:
    - `username` (string, required): Twitter username without @ symbol (e.g., "cz_binance")
  - Returns: Follower count, engagement metrics, reach statistics, and influence analysis

- **`maiga_trending_tokens()`** - Get trending tokens
  - Parameters: None
  - Returns: Top trending tokens from the last 24 hours with mentions, sentiment, and trend data

## Rate Limiting

The Maiga API enforces rate limiting:
- **Limit**: 1000 requests per hour per IP address
- **Window**: 3600 seconds (1 hour)

If you exceed the rate limit, you will receive a `429 Too Many Requests` response with information about when you can retry. The server handles rate limit errors gracefully and provides clear error messages.

## Error Handling

The server includes comprehensive error handling for:
- API authentication failures (401 Unauthorized)
- Invalid request parameters (400 Bad Request)
- Rate limit exceeded (429 Too Many Requests)
- Network connectivity issues
- Invalid parameter validation
- Maiga API errors (500 Internal Server Error)

All errors are returned as structured responses with descriptive messages. Rate limit errors include retry-after information.

## Security

- API tokens are required and validated at connection time
- All requests use HTTPS
- Input validation using Zod schemas
- No sensitive data is logged in production
- API tokens should never be exposed in client-side code or public repositories

## Tech Stack

- **Runtime**: TypeScript
- **MCP SDK**: @modelcontextprotocol/sdk
- **HTTP Client**: Native fetch API
- **Validation**: Zod
- **Development**: Smithery CLI
- **Build Tool**: Smithery Build

## Project Structure

```
maiga/
├── src/
│   └── index.ts          # Main server implementation with all tools
├── package.json          # Project dependencies and scripts
├── smithery.yaml         # Runtime specification
└── README.md            # This file
```

## Deployment

### Option 1: Deploy to Smithery (Recommended)

Ready to deploy? Push your code to GitHub and deploy to Smithery:

1. Create a new repository at [github.com/new](https://github.com/new)

2. Initialize git and push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

3. Deploy your server to Smithery at [smithery.ai/new](https://smithery.ai/new)
