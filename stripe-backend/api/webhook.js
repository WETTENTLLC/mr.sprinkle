const Stripe = require("stripe");
const nodemailer = require("nodemailer");
const crypto = require("node:crypto");
const stripeMode = require("../lib/stripe-mode");
module.exports.config = { api: { bodyParser: false } };
function raw(req){return new Promise((resolve,reject)=>{const a=[];req.on("data",c=>a.push(Buffer.from(c)));req.on("end",()=>resolve(Buffer.concat(a)));req.on("error",reject);});}
function env(){for(const k of ["STRIPE_SECRET_KEY","STRIPE_WEBHOOK_SECRET","SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","GIFT_CARD_ENCRYPTION_KEY","GMAIL_USER","GMAIL_APP_PASSWORD","GIFT_CARD_FROM_EMAIL"])if(!process.env[k])throw new Error("Missing "+k);if(!stripeMode.isLiveSecretKey(process.env.STRIPE_SECRET_KEY))throw new Error("Live Stripe key required");}
async function db(path,method="GET",body){const r=await fetch(process.env.SUPABASE_URL.replace(/\/$/,"")+"/rest/v1/"+path,{method,headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:"Bearer "+process.env.SUPABASE_SERVICE_ROLE_KEY,"Content-Type":"application/json",Prefer:"return=representation,resolution=ignore-duplicates"},...(body?{body:JSON.stringify(body)}:{})});const t=await r.text();if(!r.ok)throw new Error("Supabase "+r.status+": "+t);return t?JSON.parse(t):[];}
function key(){const k=Buffer.from(process.env.GIFT_CARD_ENCRYPTION_KEY,"base64");if(k.length!==32)throw new Error("GIFT_CARD_ENCRYPTION_KEY must be base64-encoded 32 bytes");return k;}
function encrypt(code){const iv=crypto.randomBytes(12),c=crypto.createCipheriv("aes-256-gcm",key(),iv),data=Buffer.concat([c.update(code,"utf8"),c.final()]);return [iv.toString("base64"),c.getAuthTag().toString("base64"),data.toString("base64")].join(".");}
function decrypt(blob){const [iv,tag,data]=blob.split(".");const d=crypto.createDecipheriv("aes-256-gcm",key(),Buffer.from(iv,"base64"));d.setAuthTag(Buffer.from(tag,"base64"));return Buffer.concat([d.update(Buffer.from(data,"base64")),d.final()]).toString("utf8");}
async function send(email,code,value){const transporter=nodemailer.createTransport({host:"smtp.gmail.com",port:465,secure:true,auth:{user:process.env.GMAIL_USER,pass:process.env.GMAIL_APP_PASSWORD}});await transporter.sendMail({from:process.env.GIFT_CARD_FROM_EMAIL,to:email,subject:"Your Mr. Sprinkle Gift Card",html:"<div style='background:#080808;color:#fff;padding:28px;font-family:Arial'><h1 style='color:#d4af37'>Mr. Sprinkle Luxury Gift Card</h1><p>Your gift card is ready.</p><h2 style='color:#d4af37'>$"+(value/100).toFixed(2)+" value</h2><p>Gift card code:</p><h2 style='letter-spacing:2px'>"+code+"</h2><p>Keep this code private. Contact wettentertainmentllc@gmail.com for assistance.</p></div>"});}
module.exports=async function(req,res){if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).send("Method not allowed");}
try{env();const event=new Stripe(process.env.STRIPE_SECRET_KEY).webhooks.constructEvent(await raw(req),req.headers["stripe-signature"],process.env.STRIPE_WEBHOOK_SECRET);if(!stripeMode.isLiveEvent(event))return res.status(400).send("Live events only");
const eventPath="stripe_webhook_events?stripe_event_id=eq."+encodeURIComponent(event.id);
const prior=await db(eventPath);if(prior[0]?.processing_status==="processed"||prior[0]?.processing_status==="ignored")return res.status(200).json({received:true,duplicate:true});
if(!prior.length)await db("stripe_webhook_events?on_conflict=stripe_event_id","POST",{stripe_event_id:event.id,event_type:event.type,livemode:event.livemode,processing_status:"received",payload:event});
await db(eventPath,"PATCH",{processing_status:"received",attempt_count:(prior[0]?.attempt_count||0)+1,last_error:null});
if(event.type==="checkout.session.completed"||event.type==="checkout.session.async_payment_succeeded"){
 const s=event.data.object;if(s.payment_status!=="paid"||s.metadata?.product_type!=="gift_card"){await db(eventPath,"PATCH",{processing_status:"ignored",processed_at:new Date().toISOString()});return res.status(200).json({received:true,ignored:true});}
 const face=Number(s.metadata.face_value_cents),email=s.customer_details?.email||s.customer_email;if(!Number.isSafeInteger(face)||face<10000||face>150000||face%5000!==0)throw new Error("Invalid gift card face value");if(!email)throw new Error("Paid gift card checkout has no customer email");
 let cards=await db("gift_cards?stripe_checkout_session_id=eq."+encodeURIComponent(s.id));let code;
 if(cards.length){code=decrypt(cards[0].code_ciphertext);}
 else{code="MS-"+crypto.randomBytes(5).toString("hex").toUpperCase()+"-"+crypto.randomBytes(3).toString("hex").toUpperCase();const hash=crypto.createHash("sha256").update(code).digest("hex");cards=await db("gift_cards?on_conflict=stripe_checkout_session_id","POST",{code_hash:hash,code_last4:code.slice(-4),code_ciphertext:encrypt(code),face_value_cents:face,balance_cents:face,currency:"usd",status:"active",purchaser_email:email,stripe_checkout_session_id:s.id,stripe_payment_intent_id:typeof s.payment_intent==="string"?s.payment_intent:null});}
 if(!cards[0])cards=await db("gift_cards?stripe_checkout_session_id=eq."+encodeURIComponent(s.id));if(!cards[0])throw new Error("Gift card record could not be confirmed");
 await db("gift_card_transactions?on_conflict=idempotency_key","POST",{gift_card_id:cards[0].id,transaction_type:"issuance",amount_cents:face,idempotency_key:"issue:"+s.id,reference:s.id});
 await send(email,code,face);
}
await db(eventPath,"PATCH",{processing_status:"processed",processed_at:new Date().toISOString(),last_error:null});return res.status(200).json({received:true});
}catch(e){console.error("Stripe webhook fulfillment error",e.message);return res.status(500).send("Webhook processing failed; Stripe may retry.");}};
