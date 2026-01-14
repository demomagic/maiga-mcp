import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

// Configuration schema for Maiga API
export const configSchema = z.object({
	apiToken: z.string().describe("Partner API token for Maiga API authentication"),
})

// Stateless server (default) - no stateful export needed, but explicitly declared for build compatibility

// Helper function to make API requests
async function makeApiRequest(
	baseUrl: string,
	apiToken: string,
	endpoint: string,
	body: any,
	debug: boolean = false
): Promise<any> {
	const url = `${baseUrl}${endpoint}`
	
	if (debug) {
		console.log(`[DEBUG] Making request to: ${url}`)
		console.log(`[DEBUG] Request body:`, JSON.stringify(body, null, 2))
	}

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"X-PARTNER-TOKEN": apiToken,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	})

	const responseText = await response.text()
	
	if (debug) {
		console.log(`[DEBUG] Response status: ${response.status}`)
		console.log(`[DEBUG] Response body:`, responseText)
	}

	if (!response.ok) {
		let errorMessage = `API request failed with status ${response.status}`
		
		try {
			const errorData = JSON.parse(responseText)
			errorMessage = errorData.message || errorData.error || errorMessage
			
			// Handle rate limiting
			if (response.status === 429) {
				const retryAfter = errorData.retry_after_seconds || "unknown"
				errorMessage = `Rate limit exceeded. ${errorMessage}. Retry after ${retryAfter} seconds.`
			}
		} catch {
			// If parsing fails, use the raw response text
			errorMessage = responseText || errorMessage
		}
		
		throw new Error(errorMessage)
	}

	try {
		return JSON.parse(responseText)
	} catch {
		throw new Error(`Failed to parse API response: ${responseText}`)
	}
}

export default function createServer({
	config,
}: {
	config: z.infer<typeof configSchema>
}) {
	const server = new McpServer({
		name: "Maiga API",
		version: "1.0.0",
	})

	// Base URL for Maiga API
	const baseUrl = "https://api.maiga.ai"

	// Tool 1: Token Analysis
	server.registerTool(
		"maiga_analyse_token",
		{
			title: "Token Analysis",
			description: "Performs comprehensive technical and fundamental analysis on a cryptocurrency token",
			inputSchema: {
				identifier: z.string().describe("Token symbol (e.g., 'bitcoin', 'ethereum', 'BTC') or contract address"),
			},
		},
		async ({ identifier }) => {
			try {
				const result = await makeApiRequest(
					baseUrl,
					config.apiToken,
					"/partner/analyse",
					{ identifier },
				)

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(result, null, 2),
						},
					],
				}
			} catch (error) {
				return {
					content: [
						{
							type: "text",
							text: `Error analyzing token: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				}
			}
		},
	)

	// Tool 2: Mindshare Analysis
	server.registerTool(
		"maiga_mindshare",
		{
			title: "Mindshare Analysis",
			description: "Analyzes social media sentiment and trending discussions about a token over the last 24 hours",
			inputSchema: {
				identifier: z.string().describe("Token symbol or contract address"),
			},
		},
		async ({ identifier }) => {
			try {
				const result = await makeApiRequest(
					baseUrl,
					config.apiToken,
					"/partner/mindshare",
					{ identifier },
				)

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(result, null, 2),
						},
					],
				}
			} catch (error) {
				return {
					content: [
						{
							type: "text",
							text: `Error analyzing mindshare: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				}
			}
		},
	)

	// Tool 3: Token Information
	server.registerTool(
		"maiga_token_info",
		{
			title: "Token Information",
			description: "Retrieves detailed token holder information and on-chain analysis",
			inputSchema: {
				identifier: z.string().describe("Token contract address or identifier"),
			},
		},
		async ({ identifier }) => {
			try {
				const result = await makeApiRequest(
					baseUrl,
					config.apiToken,
					"/partner/token-info",
					{ identifier },
				)

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(result, null, 2),
						},
					],
				}
			} catch (error) {
				return {
			content: [
				{
					type: "text",
							text: `Error fetching token info: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
				}
			}
		},
	)

	// Tool 4: Market Reports
	server.registerTool(
		"maiga_market_report",
		{
			title: "Market Reports",
			description: "Generates specialized market reports based on different analysis modes",
			inputSchema: {
				mode: z
					.enum(["Market_Behavior", "Open_Interest", "Multi_Timeframe", "Fund_Flow"])
					.describe("Analysis mode: Market_Behavior, Open_Interest, Multi_Timeframe, or Fund_Flow"),
			},
		},
		async ({ mode }) => {
			try {
				const result = await makeApiRequest(
					baseUrl,
					config.apiToken,
					"/partner/report",
					{ mode },
				)

				return {
					content: [
				{
							type: "text",
							text: JSON.stringify(result, null, 2),
						},
					],
				}
			} catch (error) {
				return {
					content: [
						{
							type: "text",
							text: `Error generating market report: ${error instanceof Error ? error.message : String(error)}`,
						},
					],
				}
			}
		},
	)

	// Tool 5: KOL Analysis
	server.registerTool(
		"maiga_kol_analysis",
		{
			title: "KOL Analysis",
			description: "Analyzes the influence and statistics of cryptocurrency influencers on X (Twitter)",
			inputSchema: {
				username: z.string().describe("Twitter username (without @) of the KOL to analyze"),
			},
		},
		async ({ username }) => {
			try {
				const result = await makeApiRequest(
					baseUrl,
					config.apiToken,
					"/partner/kol",
					{ username },
				)

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(result, null, 2),
						},
					],
				}
			} catch (error) {
				return {
					content: [
						{
							type: "text",
							text: `Error analyzing KOL: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
				}
			}
		},
	)

	// Tool 6: Trending Tokens
	server.registerTool(
		"maiga_trending_tokens",
		{
			title: "Trending Tokens",
			description: "Retrieves the top trending tokens in the last 24 hours based on social media mentions and activity",
			inputSchema: {},
		},
		async () => {
			try {
				const result = await makeApiRequest(
					baseUrl,
					config.apiToken,
					"/partner/trending-token",
					{},
				)

			return {
					content: [
					{
							type: "text",
							text: JSON.stringify(result, null, 2),
						},
					],
				}
			} catch (error) {
				return {
					content: [
						{
							type: "text",
							text: `Error fetching trending tokens: ${error instanceof Error ? error.message : String(error)}`,
					},
				],
				}
			}
		},
	)

	return server.server
}