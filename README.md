# Customer Interaction Chat Website

A responsive customer-support chatbox prepared for future n8n integration.

## Files

- `index.html` — chat interface
- `style.css` — responsive styling
- `script.js` — chat logic + n8n integration point

## Run

Open `index.html` in a browser.

## Connect n8n later

Open `script.js` and change:

```js
const USE_N8N = false;
```

to:

```js
const USE_N8N = true;
```

Then replace:

```js
const N8N_WEBHOOK_URL = "https://YOUR-N8N-DOMAIN/webhook/customer-chat";
```

with your n8n Webhook URL.

The website sends:

```json
{
  "message": "Customer's message",
  "sessionId": "unique-browser-session-id",
  "timestamp": "ISO timestamp",
  "source": "website-chat",
  "customer": {
    "name": "Website Customer"
  }
}
```

Your n8n workflow should return JSON such as:

```json
{
  "reply": "Hello! How can I help you today?"
}
```

The frontend also accepts `output` or `message` as the response field.

## Recommended n8n workflow

Website Chat
→ Webhook
→ Extract message/sessionId
→ AI Agent / LLM
→ Customer Support Prompt
→ Respond to Webhook

For production, configure CORS and authentication/security on the webhook as appropriate for your deployment.
