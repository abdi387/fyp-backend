const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

/**
 * AI Service Connectivity Test
 * Run this using: node backend/scripts/testAI.js
 */
async function runTest() {
  console.log('\x1b[36m%s\x1b[0m', '🤖 Starting AI Service Connectivity Test...');
  console.log('Environment:', process.env.NODE_ENV || 'development');

  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (!openaiKey && !openrouterKey) {
    console.error('\x1b[31m%s\x1b[0m', '❌ FAIL: No API Key found in environment variables.');
    console.log('Please ensure OPENAI_API_KEY or OPENROUTER_API_KEY is set in your environment.');
    return;
  }

  if (openaiKey) {
    console.log('\n📡 Testing OpenAI API...');
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Respond with 'OpenAI connection successful!'" }]
        })
      });
      const data = await res.json();
      if (data.choices) {
        console.log('\x1b[32m%s\x1b[0m', '✅ SUCCESS:', data.choices[0].message.content);
      } else {
        console.error('\x1b[31m%s\x1b[0m', '❌ OpenAI API error:', data.error?.message || JSON.stringify(data));
      }
    } catch (e) {
      console.error('\x1b[31m%s\x1b[0m', '❌ Network Error (OpenAI):', e.message);
    }
  }

  if (openrouterKey) {
    console.log('\n📡 Testing OpenRouter API...');
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterKey}`,
          'HTTP-Referer': process.env.FRONTEND_URL || 'https://fyp-frontend-9ey8.onrender.com',
          'X-Title': 'FYP Management System Test'
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-nano-30b-a3b:free",
          messages: [{ role: "user", content: "Respond with 'OpenRouter connection successful!'" }]
        })
      });
      const data = await res.json();
      if (data.choices) {
        console.log('\x1b[32m%s\x1b[0m', '✅ SUCCESS:', data.choices[0].message.content);
      } else {
        console.error('\x1b[31m%s\x1b[0m', '❌ OpenRouter API error:', data.error?.message || JSON.stringify(data));
      }
    } catch (e) {
      console.error('\x1b[31m%s\x1b[0m', '❌ Network Error (OpenRouter):', e.message);
    }
  }
}

runTest();