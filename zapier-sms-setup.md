# 📱 ZAPIER SMS SETUP - 15 MINUTE GUIDE

## STEP 1: CREATE ZAPIER ACCOUNT
1. Go to zapier.com
2. Sign up (free 14-day trial)
3. Choose "Starter" plan ($19.99/month after trial)

## STEP 2: CREATE SMS ZAP
1. Click "Create Zap"
2. Search "SMS by Zapier" as trigger
3. Choose "New Inbound SMS"
4. Connect your phone number (530) 214-0676

## STEP 3: SET UP WEBHOOK
1. Add action step
2. Search "Webhooks by Zapier"
3. Choose "POST"
4. URL: `https://hook.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/`
5. Method: POST

## STEP 4: MAP SMS DATA
```json
{
  "from": "{{phone_number}}",
  "body": "{{message_body}}",
  "timestamp": "{{received_at}}"
}
```

## STEP 5: ADD RESPONSE ACTION
1. Add another action
2. Choose "SMS by Zapier"
3. Select "Send SMS"
4. To: `{{phone_number}}`
5. Message: Use chatbot response logic

## STEP 6: TEST THE ZAP
1. Send test SMS: "SPRINKLE ME" to (530) 214-0676
2. Check if webhook receives data
3. Verify automated response sent back
4. Turn on Zap

## WEBHOOK ENDPOINT CODE
```javascript
// Simple webhook receiver
app.post('/sms-webhook', (req, res) => {
  const { from, body } = req.body;
  const response = processSMS(body);
  
  res.json({
    message: response,
    send_to: from
  });
});

function processSMS(message) {
  const text = message.toLowerCase();
  
  if (text.includes('sprinkle me')) {
    return '🔥 Welcome to Mr. Sprinkle! Ready for custom grillz? Visit mrsprinklereno.com or text your vision for a quote!';
  }
  
  if (text.includes('grill girl')) {
    return '✨ GRILL GIRL AMBASSADOR PROGRAM\nThanks for your interest! Complete application: [FORM_LINK]\n50% off grillz + Lake Tahoe photoshoot + 20% commission!';
  }
  
  if (text.includes('pricing') || text.includes('price')) {
    return '💰 Custom quotes only! Text your vision: "I want [X] teeth in [gold type]" for instant pricing. Every piece is custom-made!';
  }
  
  return '💬 Text "SPRINKLE ME" to start, "GRILL GIRL" for ambassador program, or describe your grillz vision for a quote!';
}
```

## QUICK START (NO CODING)
Use Zapier's built-in formatter:

**IF message contains "SPRINKLE ME":**
Response: "🔥 Welcome to Mr. Sprinkle! Visit mrsprinklereno.com for gallery & booking!"

**IF message contains "GRILL GIRL":**
Response: "✨ Ambassador application: [FORM_LINK] - 50% off + photoshoot!"

**ELSE:**
Response: "💬 Text 'SPRINKLE ME' to start or describe your grillz vision!"

## ACTIVATION CHECKLIST
- [ ] Zapier account created
- [ ] SMS trigger connected to (530) 214-0676
- [ ] Webhook action configured
- [ ] Response SMS action added
- [ ] Test message sent and received
- [ ] Zap turned ON

**Total setup time: 15 minutes**
**Monthly cost: $20**
**Result: Automated SMS responses to (530) 214-0676**