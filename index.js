const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const twilio = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.get('/', (req, res) => res.send('Bot is running!'));

app.post('/webhook', async (req, res) => {
  const userMessage = req.body.Body;
  const userPhone = req.body.From;

  console.log(`Message from ${userPhone}: ${userMessage}`);

  try {
    const aiResponse = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: 'أنت مساعد متخصص في قطع السيارات. رد باللغة العربية بشكل مختصر.',
      messages: [{ role: 'user', content: userMessage }]
    });

    const reply = aiResponse.content[0].text;

    await twilioClient.messages.create({
      from: 'whatsapp:+14155238886',
      to: userPhone,
      body: reply
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
