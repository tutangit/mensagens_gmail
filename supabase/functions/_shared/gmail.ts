import { createClient } from 'jsr:@supabase/supabase-js@2'

export async function getGmailToken(supabase: any, userId: string) {
    const { data, error } = await supabase
        .from('gmail_accounts')
        .select('id, access_token_enc, refresh_token_enc, expires_at')
        .eq('user_id', userId)
        .single()

    if (error || !data) throw new Error('Gmail account not connected')

    // Decrypt access token
    const { data: accessToken, error: errAcc } = await supabase
        .rpc('decrypt_gmail_token', { enc: data.access_token_enc })

    if (errAcc) throw new Error('Failed to decrypt access token: ' + errAcc.message)

    // Check if expired (with 1 minute buffer)
    if (Date.now() > (data.expires_at - 60000)) {
        // Decrypt refresh token for renewal
        const { data: refreshToken, error: errRef } = await supabase
            .rpc('decrypt_gmail_token', { enc: data.refresh_token_enc })

        if (errRef) throw new Error('Failed to decrypt refresh token: ' + errRef.message)

        return await refreshGmailToken(supabase, {
            id: data.id,
            refresh_token: refreshToken
        })
    }

    return accessToken
}

async function refreshGmailToken(supabase: any, account: any) {
    const clientId = Deno.env.get('GMAIL_CLIENT_ID')
    const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET')

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId!,
            client_secret: clientSecret!,
            refresh_token: account.refresh_token,
            grant_type: 'refresh_token',
        }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error('Failed to refresh token: ' + JSON.stringify(data))

    const expiresAt = Date.now() + (data.expires_in * 1000)

    // Encrypt new access token before storing
    const { data: encryptedAccess, error: errEncAccess } = await supabase
        .rpc('encrypt_gmail_token', { plain_text: data.access_token })

    if (errEncAccess) throw new Error('Failed to encrypt access token: ' + errEncAccess.message)

    // Encrypt refresh token before storing
    const { data: encryptedRefresh, error: errEncRefresh } = await supabase
        .rpc('encrypt_gmail_token', { plain_text: account.refresh_token })

    if (errEncRefresh) throw new Error('Failed to encrypt refresh token: ' + errEncRefresh.message)

    await supabase
        .from('gmail_accounts')
        .update({
            access_token_enc: encryptedAccess,
            refresh_token_enc: encryptedRefresh,
            expires_at: expiresAt,
            updated_at: new Date().toISOString()
        })
        .eq('id', account.id)

    return data.access_token
}

export async function sendEmail(accessToken: string, rawMessage: string) {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            raw: rawMessage
        }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error('Gmail API Error: ' + JSON.stringify(data))
    return data
}

export function createMimeMessage(to: string, subject: string, body: string, isHtml: boolean = false) {
    const boundary = "foo_bar_baz"
    const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

    let message = []
    message.push(`To: ${to}`)
    message.push(`Subject: ${utf8Subject}`)
    message.push("MIME-Version: 1.0")

    if (isHtml) {
        message.push(`Content-Type: text/html; charset="UTF-8"`)
        message.push("")
        message.push(body)
    } else {
        message.push(`Content-Type: text/plain; charset="UTF-8"`)
        message.push("")
        message.push(body)
    }

    // Base64 encode the message (URL safe)
    const str = message.join("\r\n")
    return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}
