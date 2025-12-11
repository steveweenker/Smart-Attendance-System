// api/db.js - Backend API Handler for Supabase
const SUPABASE_URL = 'https://dqsyfbhvbdtztea pjexq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxc3lmYmh2YmR0enRlYXBqZXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzY1MTYsImV4cCI6MjA4MTA1MjUxNn0.D3zaLWSVdntksUu8b4KEmkS6fI6Z15101CFGB6ECDJs';

export default async function handler(req, res) {
  // CORS Headers - Allow requests from anywhere
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Extract data from request
  const { action, table, data, id } = req.body;

  try {
    // Build Supabase URL
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    
    // Set headers for Supabase authentication
    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    };

    let response;

    // Handle different actions
    switch (action) {
      // GET all records
      case 'GET':
        console.log(`[GET] Fetching from ${table}`);
        response = await fetch(`${url}?select=*`, { 
          method: 'GET', 
          headers 
        });
        break;

      // ADD new record
      case 'ADD':
        console.log(`[ADD] Adding to ${table}:`, data);
        if (!data.created_at) {
          data.created_at = new Date().toISOString();
        }
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(data)
        });
        break;

      // UPDATE existing record
      case 'UPDATE':
        console.log(`[UPDATE] Updating in ${table}:`, data);
        response = await fetch(`${url}?id=eq.${data.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(data)
        });
        break;

      // DELETE record
      case 'DELETE':
        console.log(`[DELETE] Deleting from ${table}, ID: ${id}`);
        response = await fetch(`${url}?id=eq.${id}`, {
          method: 'DELETE',
          headers
        });
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    // Check if Supabase responded with error
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Supabase Error (${response.status}):`, errorText);
      return res.status(response.status).json({ 
        error: errorText || 'Supabase request failed',
        status: response.status 
      });
    }

    // Parse and return response
    const result = await response.json();
    console.log(`[SUCCESS] ${action} on ${table} completed`);
    res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
