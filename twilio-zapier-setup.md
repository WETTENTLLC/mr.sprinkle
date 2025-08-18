# 🚀 TWILIO + ZAPIER SMS SETUP (20 minutes)

## STEP 1: CREATE TWILIO ACCOUNT (5 minutes)
1. Go to **twilio.com/try-twilio**
2. Sign up with email
3. Verify phone number
4. Get **$15 free credit**

## STEP 2: BUY PHONE NUMBER (2 minutes)
1. Go to **Phone Numbers > Manage > Buy a number**
2. Search for **Nevada area code** (775 or 702)
3. Choose number with **SMS capability**
4. Purchase for **$1/month**

## STEP 3: SET UP WEBHOOK (3 minutes)
1. Go to **Phone Numbers > Manage > Active numbers**
2. Click your new number
3. In **Messaging** section:
   - Webhook URL: `https://hooks.zapier.com/hooks/catch/YOUR_HOOK_ID/`
   - HTTP Method: `POST`
4. Save configuration

## STEP 4: CREATE ZAPIER ZAP (10 minutes)

### Trigger Setup:
1. **New Zap** → Search "Webhooks by Zapier"
2. Choose **"Catch Hook"**
3. Copy webhook URL to Twilio (Step 3)
4. Send test SMS to your Twilio number
5. Test trigger in Zapier

### Action 1 - Process Message:
1. **Add Action** → "Code by Zapier"
2. **Language**: JavaScript
3. **Code**:
```javascript
const message = inputData.Body.toLowerCase();
let response = "";

if (message.includes('sprinkle me')) {
  response = "🔥 Welcome to Mr. Sprinkle! Ready for custom grillz? Visit mrsprinklereno.com or text your vision for a quote!";
} else if (message.includes('grill girl')) {
  response = "✨ GRILL GIRL AMBASSADOR PROGRAM\n50% off grillz + Lake Tahoe photoshoot + 20% commission!\nApply: [FORM_LINK]";
} else if (message.includes('pricing') || message.includes('price')) {
  response = "💰 Custom quotes only! Text your vision: 'I want [X] teeth in [gold type]' for instant pricing!";
} else {
  response = "💬 Text 'SPRINKLE ME' to start, 'GRILL GIRL' for ambassador program, or describe your grillz vision!";
}

output = [{response: response}];
```

### Action 2 - Send Response:
1. **Add Action** → Search "Twilio"
2. Choose **"Send SMS"**
3. Connect Twilio account
4. **To**: `{{From}}` (from webhook)
5. **Message**: `{{response}}` (from code step)
6. Test and turn on Zap

## STEP 5: FORWARD TO YOUR PHONE
1. In Twilio console → **Studio**
2. Create new Flow
3. **Trigger**: Incoming Message
4. **Action**: Send Message to `+15302140676`
5. **Then**: Continue to webhook

## ALTERNATIVE: SIMPLE ZAPIER FILTERS

### Instead of Code, Use Filters:

**Zap 1**: "SPRINKLE ME" Response
- **Trigger**: Webhook (Twilio SMS)
- **Filter**: Body contains "sprinkle me"
- **Action**: Twilio Send SMS → Welcome message

**Zap 2**: "GRILL GIRL" Response  
- **Trigger**: Webhook (Twilio SMS)
- **Filter**: Body contains "grill girl"
- **Action**: Twilio Send SMS → Ambassador info

**Zap 3**: Default Response
- **Trigger**: Webhook (Twilio SMS)
- **Filter**: Body does NOT contain "sprinkle me" OR "grill girl"
- **Action**: Twilio Send SMS → Help menu

## COST BREAKDOWN
- **Twilio number**: $1/month
- **SMS received**: $0.0075 each
- **SMS sent**: $0.0075 each  
- **Zapier**: $20/month (after free trial)

**Example**: 100 SMS conversations = $1.50 + $20 = $21.50/month

## TESTING CHECKLIST
- [ ] Twilio account created
- [ ] Phone number purchased
- [ ] Webhook configured
- [ ] Zapier zap created and tested
- [ ] Test SMS sent and response received
- [ ] Forwarding to (530) 214-0676 working

**Ready to activate SMS automation!** 📱🤖