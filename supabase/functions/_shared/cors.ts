// Get allowed origin from environment or default to localhost
const allowedOrigins = [
    'http://localhost:5173',
    'https://mensagens-gmail.vercel.app',
    // Add your custom domain here if needed
]

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Will be replaced dynamically
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to get CORS headers with proper origin
export function getCorsHeaders(requestOrigin?: string) {
    const origin = requestOrigin && allowedOrigins.includes(requestOrigin)
        ? requestOrigin
        : allowedOrigins[0]

    return {
        ...corsHeaders,
        'Access-Control-Allow-Origin': origin,
    }
}
