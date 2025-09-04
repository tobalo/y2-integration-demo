import { Hono } from 'hono'

interface Env {
  REPORTS: KVNamespace
  WEBHOOK_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

// Simple web UI to view report state
app.get('/', async (c) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Y2 Webhook & Integration Sample</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f8f9fa;
      color: #212529;
      line-height: 1.6;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e9ecef;
      position: relative;
    }
    .header-links {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .github-link, .engage-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #495057;
      text-decoration: none;
      font-size: 0.9em;
      font-weight: 500;
      padding: 8px 12px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      background: #ffffff;
      transition: all 0.2s;
    }
    .github-link:hover, .engage-link:hover {
      color: #212529;
      border-color: #495057;
      text-decoration: none;
    }
    .engage-link {
      background: #f8f9fa;
      border-color: #6c757d;
    }
    .engage-link:hover {
      background: #e9ecef;
    }
    .github-icon, .engage-icon {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }
    h1 {
      color: #212529;
      margin-bottom: 10px;
      font-size: 2.5em;
      font-weight: 700;
    }
    .subtitle {
      color: #6c757d;
      font-size: 1.1em;
      margin-bottom: 20px;
    }
    .info-card {
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .info-card h2 {
      color: #495057;
      margin-bottom: 16px;
      font-size: 1.25em;
    }
    .webhook-url {
      background: #f8f9fa;
      padding: 12px 16px;
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
      font-size: 0.9em;
      word-break: break-all;
      margin: 12px 0;
      border: 1px solid #dee2e6;
      color: #495057;
    }
    .refresh-btn {
      background: #495057;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1em;
      font-weight: 500;
      margin: 20px auto;
      display: block;
      transition: background-color 0.2s;
    }
    .refresh-btn:hover {
      background: #343a40;
    }
    .reports-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-top: 24px;
    }
    @media (max-width: 1024px) {
      .reports-container {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 640px) {
      .header-links {
        position: static;
        justify-content: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .github-link, .engage-link {
        font-size: 0.85em;
        padding: 6px 10px;
      }
      header {
        text-align: center;
      }
    }
    .report-panel {
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .panel-header {
      background: #495057;
      color: white;
      padding: 16px 20px;
      font-weight: 600;
      font-size: 1.1em;
    }
    .panel-content {
      padding: 20px;
    }
    .report-header {
      border-bottom: 1px solid #e9ecef;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .report-title {
      font-size: 1.25em;
      color: #212529;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .report-meta {
      color: #6c757d;
      font-size: 0.9em;
      line-height: 1.4;
    }
    .report-summary {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 6px;
      margin: 16px 0;
      border-left: 4px solid #6c757d;
    }
    .report-summary strong {
      color: #495057;
    }
    .content-section {
      margin: 20px 0;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }
    .content-section strong {
      color: #495057;
      display: block;
      margin-bottom: 8px;
    }
    .source-link {
      display: block;
      color: #495057;
      text-decoration: none;
      margin: 6px 0;
      font-size: 0.9em;
      padding: 4px 8px;
      background: #e9ecef;
      border-radius: 4px;
    }
    .source-link:hover {
      background: #dee2e6;
      text-decoration: underline;
    }
    .json-display {
      background: #212529;
      color: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
      font-size: 0.85em;
      line-height: 1.4;
      overflow-x: auto;
      white-space: pre;
      max-height: 600px;
      overflow-y: auto;
    }
    .loading, .error, .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #6c757d;
      font-size: 1.1em;
    }
    .error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      border-radius: 6px;
    }
    .empty-state {
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
    }
    .json-key { color: #79c0ff; }
    .json-string { color: #a5d6ff; }
    .json-number { color: #79c0ff; }
    .json-boolean { color: #ffab70; }
    .json-null { color: #f85149; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="header-links">
        <a href="https://eden.yeetum.com" target="_blank" class="engage-link">
          <svg class="engage-icon" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          Custom Requests
        </a>
        <a href="https://github.com/tobalo/y2-webhook-sample" target="_blank" class="github-link">
          <svg class="github-icon" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          View Code
        </a>
      </div>
      <h1>Y2 Webhook & Integration Sample</h1>
      <p class="subtitle">Real-time webhook monitoring and payload visualization</p>
    </header>
    
    <div class="info-card">
      <h2>Webhook Configuration</h2>
      <p>Configure your Y2 platform to send webhooks to:</p>
      <div class="webhook-url" id="webhook-url">Loading...</div>
      <p style="margin-top: 12px; color: #6c757d; font-size: 0.9em;">
        ⚡ The report state updates automatically when new webhooks are received.<br>
        📱 Only the most recent report is stored. Each new webhook overwrites the previous state.<br>
        🔄 Updates are checked efficiently only when needed.<br>
        💡 <strong>Need custom integration?</strong> Use the "Custom Requests" link above for complex requirements.
      </p>
    </div>
    
    <button class="refresh-btn" onclick="loadReports()">Refresh State</button>
    
    <div id="reports-wrapper">
      <div class="loading">Loading report state...</div>
    </div>
  </div>

  <script>
    // Set webhook URL
    document.getElementById('webhook-url').textContent = window.location.origin + '/webhook';
    
    let lastUpdateTime = null;
    let checkInterval = null;
    
    function formatJson(obj) {
      const json = JSON.stringify(obj, null, 2);
      return json
        .replace(/"([^"]+)":/g, '<span class="json-key">"$1":</span>')
        .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
        .replace(/: (\\d+\\.?\\d*)/g, ': <span class="json-number">$1</span>')
        .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
        .replace(/: null/g, ': <span class="json-null">null</span>');
    }
    
    async function checkForUpdates() {
      try {
        const response = await fetch('/api/events');
        const text = await response.text();
        const match = text.match(/"lastUpdate": "([^"]*)"}/);
        
        if (match && match[1]) {
          const serverLastUpdate = match[1];
          if (lastUpdateTime !== serverLastUpdate) {
            lastUpdateTime = serverLastUpdate;
            await loadReports();
          }
        }
      } catch (error) {
        console.log('Update check failed:', error.message);
      }
    }
    
    async function loadReports() {
      const reportsWrapper = document.getElementById('reports-wrapper');
      reportsWrapper.innerHTML = '<div class="loading">Loading report state...</div>';
      
      try {
        const response = await fetch('/api/reports');
        const report = await response.json();
        
        if (!report) {
          reportsWrapper.innerHTML = \`
            <div class="empty-state">
              <h3>No report state</h3>
              <p>Send a webhook to populate the report state.</p>
              <p style="margin-top: 10px; font-size: 0.9em; color: #6c757d;">
                The state will update automatically when a new webhook is received.
              </p>
            </div>
          \`;
          return;
        }
        
        // Update our local timestamp
        lastUpdateTime = report.receivedAt;
        
        reportsWrapper.innerHTML = \`
          <div class="reports-container">
            <!-- Left Panel: Report State -->
            <div class="report-panel">
              <div class="panel-header">Report State</div>
              <div class="panel-content">
                <div class="report-header">
                  <div class="report-title">\${report.profile?.name || 'Unknown Profile'}</div>
                  <div class="report-meta">
                    <strong>Topic:</strong> \${report.profile?.topic || 'No topic'}<br>
                    <strong>Report ID:</strong> \${report.id}<br>
                    <strong>Generated:</strong> \${report.timestamp ? new Date(report.timestamp).toLocaleString() : 'Unknown'}<br>
                    <strong>Received:</strong> \${new Date(report.receivedAt).toLocaleString()}
                  </div>
                </div>
                
                \${report.content?.smsSummary ? \`
                  <div class="report-summary">
                    <strong>SMS Summary</strong><br>
                    \${report.content.smsSummary}
                  </div>
                \` : ''}
                
                \${report.content?.text ? \`
                  <div class="content-section">
                    <strong>Text Content</strong>
                    <div style="margin-top: 8px; line-height: 1.5;">\${report.content.text}</div>
                  </div>
                \` : ''}
                
                \${report.content?.html ? \`
                  <div class="content-section">
                    <strong>HTML Content</strong>
                    <div style="margin-top: 8px; padding: 12px; background: white; border: 1px solid #dee2e6; border-radius: 4px;">\${report.content.html}</div>
                  </div>
                \` : ''}
                
                \${report.content?.sources?.length ? \`
                  <div style="margin-top: 20px;">
                    <strong style="color: #495057; display: block; margin-bottom: 8px;">Sources</strong>
                    \${report.content.sources.map(source => 
                      \`<a href="\${source}" target="_blank" class="source-link">\${source}</a>\`
                    ).join('')}
                  </div>
                \` : ''}
              </div>
            </div>
            
            <!-- Right Panel: Raw JSON -->
            <div class="report-panel">
              <div class="panel-header">Raw JSON Payload</div>
              <div class="panel-content">
                <div class="json-display">\${formatJson(report)}</div>
              </div>
            </div>
          </div>
        \`;
        
      } catch (error) {
        reportsWrapper.innerHTML = \`
          <div class="error">
            Error loading report state: \${error.message}
          </div>
        \`;
      }
    }
    
    function startUpdateChecker() {
      // Check for updates every 10 seconds (much less frequent than before)
      checkInterval = setInterval(checkForUpdates, 10000);
    }
    
    function stopUpdateChecker() {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
    }
    
    // Handle page visibility to pause/resume checking when tab is not active
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopUpdateChecker();
      } else {
        startUpdateChecker();
        checkForUpdates(); // Check immediately when tab becomes visible
      }
    });
    
    // Load reports on page load
    loadReports();
    
    // Start the efficient update checker
    startUpdateChecker();
  </script>
</body>
</html>
  `
  
  return c.html(html)
})

// Get stored report (single report state)
app.get('/api/reports', async (c) => {
  try {
    const reportData = await c.env.REPORTS.get('CURRENT_REPORT')
    
    if (!reportData) {
      return c.json(null)
    }
    
    return c.json(JSON.parse(reportData))
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Server-Sent Events endpoint for real-time updates
app.get('/api/events', async (c) => {
  // For Cloudflare Workers, we'll use a simpler approach
  // Return the last update timestamp so clients can efficiently check for changes
  try {
    const reportData = await c.env.REPORTS.get('CURRENT_REPORT')
    const lastUpdate = reportData ? JSON.parse(reportData).receivedAt : null
    
    return new Response(
      `data: {"lastUpdate": "${lastUpdate || ''}"}

`,
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  } catch (error: any) {
    return new Response(
      `data: {"error": "${error.message}"}

`,
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      }
    )
  }
})

// Verify HMAC signature
async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const expectedSignature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(body)
  )
  
  const expectedHex = 'sha256=' + Array.from(new Uint8Array(expectedSignature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return signature === expectedHex
}

// Webhook endpoint
app.post('/webhook', async (c) => {
  try {
    const body = await c.req.text()
    const signature = c.req.header('X-Y2-Signature')
    
    // Verify signature if provided
    if (signature && c.env.WEBHOOK_SECRET) {
      const isValid = await verifySignature(body, signature, c.env.WEBHOOK_SECRET)
      if (!isValid) {
        return c.json({ error: 'Invalid signature' }, 401)
      }
    }
    
    // Parse webhook payload
    const payload = JSON.parse(body)
    
    // Store report in KV - ONLY ONE REPORT STATE
    const reportData = {
      id: payload.id || `report_${Date.now()}`,
      timestamp: payload.timestamp || new Date().toISOString(),
      profile: payload.profile || {},
      content: {
        html: payload.content?.html || '',
        text: payload.content?.text || '',
        smsSummary: payload.content?.smsSummary || '',
        sources: payload.content?.sources || []
      },
      metadata: payload.metadata || {},
      receivedAt: new Date().toISOString()
    }
    
    // Store as the ONLY report (overwrites previous)
    await c.env.REPORTS.put('CURRENT_REPORT', JSON.stringify(reportData))
    
    return c.json({ 
      received: true, 
      id: reportData.id,
      timestamp: reportData.receivedAt 
    })
    
  } catch (error: any) {
    console.error('Webhook error:', error)
    return c.json({ 
      error: 'Failed to process webhook',
      message: error.message 
    }, 500)
  }
})

export default app