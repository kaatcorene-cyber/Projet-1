import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import * as url from 'url';
import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// --- TELEGRAM BOT & CRON LOGIC ---
const token = '8624832383:AAHhIgbdrbxl5wXl0ntUwM2jjXhTOZ015r0';
let activeGroupId: string | null = null; 

const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error: any) => {
  if (error?.response?.statusCode === 401 || error?.message?.includes('401')) {
    console.error("Erreur Telegram 401 : Token invalide ou expiré. Arrêt du polling.");
    bot.stopPolling();
  } else {
    console.error("Erreur de polling Telegram :", error.message);
  }
});

const userWarnings = new Map<number, number>();
const ALLOWED_LINK = "sunpower-ci.site/register";

let lastWelcomeMessageId: number | null = null; 

console.log("🤖 Sunpower Server + Bot démarré avec succès ! En attente de messages...");

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const userName = msg.from?.first_name || msg.from?.username || "Membre";

  if ((msg.chat.type === 'group' || msg.chat.type === 'supergroup') && !activeGroupId) {
    activeGroupId = chatId.toString();
    console.log(`📌 Groupe détecté et enregistré : ${activeGroupId}`);
    bot.sendMessage(chatId, "🤖 <b>Bot Activé !</b>\nJe suis désormais lié à ce groupe. Je protègerai ce canal des liens externes et je gèrerai les horaires d'ouverture (09h00) et fermeture (17h00) GMT.", { parse_mode: 'HTML' });
  }

  if (!userId) return;

  if (msg.text || msg.caption) {
    const textToCheck = msg.text || msg.caption || "";
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/ig;
    const urls = textToCheck.match(urlRegex);

    if (urls && urls.length > 0) {
      try {
        const chatMember = await bot.getChatMember(chatId, userId);
        if (chatMember.status === 'creator' || chatMember.status === 'administrator') {
            return; 
        }
      } catch (e: any) {
         console.warn("Impossible de vérifier le statut administratif.", e.message);
      }

      let containsBadLink = false;
      for (const urlMatch of urls) {
        if (!urlMatch.toLowerCase().includes(ALLOWED_LINK.toLowerCase())) {
          containsBadLink = true;
          break;
        }
      }

      if (containsBadLink) {
        try {
          await bot.deleteMessage(chatId, msg.message_id);
          
          let warnings = userWarnings.get(userId) || 0;
          warnings += 1;
          userWarnings.set(userId, warnings);

          if (warnings >= 3) {
            await bot.banChatMember(chatId, userId);
            await bot.sendMessage(chatId, `🚫 <b>Bannissement Automatique</b>\n\nL'utilisateur <a href="tg://user?id=${userId}">${userName}</a> a été définitivement banni du groupe pour avoir envoyé plus de 3 liens non autorisés.`, { parse_mode: 'HTML' });
            userWarnings.delete(userId);
          } else {
            const warnMsg = await bot.sendMessage(chatId, `⚠️ <b>Avertissement pour <a href="tg://user?id=${userId}">${userName}</a> !</b>\n\nLes liens externes sont strictement interdits dans ce groupe, à l'exception du lien d'inscription officiel.\n\n🛑 <b>Avertissement ${warnings}/3</b> avant bannissement définitif du groupe.`, { parse_mode: 'HTML' });
            
            setTimeout(() => {
              bot.deleteMessage(chatId, warnMsg.message_id).catch(() => {});
            }, 15000);
          }
        } catch (error: any) {
          console.error("Erreur de sanction :", error.message);
        }
      }
    }
  }

  if (msg.new_chat_members && msg.new_chat_members.length > 0) {
    for (const newMember of msg.new_chat_members) {
      if (newMember.is_bot) continue; 
      
      const memberName = newMember.first_name || newMember.username || "nouveau membre";
      
      const welcomeText = `Bienvenue sur la plateforme <b>AgriTrans CI</b>, <a href="tg://user?id=${newMember.id}">${memberName}</a> ! 🚛
 
Cher client fidèle,
Nous sommes ravis de vous compter parmi nos membres. 🙌
 
💼 <u><b>Nos Conditions & Services</b></u> :
• 🎁 <b>Bonus d’inscription :</b> 100 F CFA
• 💰 <b>Dépôt minimum :</b> 5 000 F CFA
• 💸 <b>Retrait minimum :</b> 2 000 F CFA
• ⏰ <b>Disponibilité :</b> Tous les jours de 09h00 à 17h00 GMT
• ⚠️ <b>Frais de retrait :</b> 15%
• 🌍 <b>Pays éligibles :</b> 🇨🇮 Côte d'Ivoire
 
📊 <u><b>Nos plans d’investissement</b></u> :
• 🔹 <b>Plan Standard :</b> Gagnez <tg-spoiler>18%</tg-spoiler> de votre investissement <u>chaque jour</u> pendant <b>8 jours</b>.
• 🔸 <b>Plan Premium :</b> Gagnez <tg-spoiler>5%</tg-spoiler> de votre investissement <u>chaque jour</u> pendant <b>60 jours</b>.
 
👥 <u><b>Système de parrainage</b></u> :
• 🥇 <b>Niveau 1 :</b> 15%
• 🥈 <b>Niveau 2 :</b> 3%
• 🥉 <b>Niveau 3 :</b> 2%
 
🚀 <i><b>AgriTrans CI</b>, votre partenaire de transport et logistique agricole</i>`;

      try {
        if (lastWelcomeMessageId) {
          await bot.deleteMessage(chatId, lastWelcomeMessageId).catch(() => {});
        }
        
        await bot.deleteMessage(chatId, msg.message_id).catch(() => {});

        const welcomeMsg = await bot.sendMessage(chatId, welcomeText, { parse_mode: 'HTML', disable_web_page_preview: true });
        lastWelcomeMessageId = welcomeMsg.message_id; 
      } catch (error: any) {
        console.error("Erreur d'envoi du message de bienvenue :", error.message);
      }
    }
  }
});

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gwkqmutjpxwjifaoutnt.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a3FtdXRqcHh3amlmYW91dG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE5ODcwMCwiZXhwIjoyMDkzNzc0NzAwfQ.wRmfB0wyAd1dKhvsTTd1gFfTxiDCzIyzGH3HpE7CNVk';
const supabase = createClient(SUPABASE_URL.replace('.supabase.com', '.supabase.co'), SUPABASE_KEY);

// GAINS AUTO CRON (Runs every minute)
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date().getTime();
    
    // Fetch all active investments
    const { data: invs, error } = await supabase.from('investments').select('*').eq('status', 'active');
    
    if (error) {
      console.error("Cron Error fetching investments:", error);
      return;
    }
    
    if (!invs || invs.length === 0) return;
    
    for (const inv of invs) {
      const start = new Date(inv.start_date || inv.created_at).getTime();
      const lastPaid = new Date(inv.last_paid_at || inv.created_at).getTime();
      
      const totalDaysElapsed = Math.floor((now - start) / (24 * 60 * 60 * 1000));
      const lastPaidDaysElapsed = Math.floor((lastPaid - start) / (24 * 60 * 60 * 1000));
      const missingDays = totalDaysElapsed - lastPaidDaysElapsed;
      
      if (missingDays > 0) {
        let endT = inv.end_date ? new Date(inv.end_date).getTime() : null;
        let totalExpectedDays = endT ? Math.round((endT - start) / (24 * 60 * 60 * 1000)) : Infinity;
        
        let daysToAdd = missingDays;
        
        if (lastPaidDaysElapsed + daysToAdd > totalExpectedDays) {
           daysToAdd = totalExpectedDays - lastPaidDaysElapsed;
        }
        
        if (daysToAdd > 0) {
          let newLastPaidTime = lastPaid + daysToAdd * 24 * 60 * 60 * 1000;
          if (newLastPaidTime > now) newLastPaidTime = now;
          const newLastPaid = new Date(newLastPaidTime).toISOString();
          
          const amountToAdd = Number(inv.daily_yield) * daysToAdd;

          // Transactions array to run them sequentially and ensure they commit properly
          await supabase.from('investments').update({ last_paid_at: newLastPaid }).eq('id', inv.id);
          
          await supabase.from('transactions').insert({
            user_id: inv.user_id,
            type: 'daily_gain',
            amount: amountToAdd,
            status: 'completed',
            reference: `Gain du plan (x${daysToAdd}) (Auto)`
          });
          
          const { data: usr } = await supabase.from('users').select('balance').eq('id', inv.user_id).single();
          if (usr) {
            await supabase.from('users').update({ balance: Number(usr.balance) + amountToAdd }).eq('id', inv.user_id);
          }
          console.log(`✅ [CRON] Credited ${amountToAdd} FCFA to user ${inv.user_id} for ${daysToAdd} days.`);
        }
      }
      
      // Check expiration
      if (inv.end_date) {
        const endT = new Date(inv.end_date).getTime();
        const totalExpectedDays = Math.round((endT - start) / (24 * 60 * 60 * 1000));
        const currentLastPaid = Math.floor((new Date(inv.last_paid_at || inv.created_at).getTime() - start) / (24 * 60 * 60 * 1000)) + missingDays; 
        
        if (currentLastPaid >= totalExpectedDays || now >= endT) {
          await supabase.from('investments').update({ status: 'completed' }).eq('id', inv.id);
          console.log(`✅ [CRON] Marked investment ${inv.id} as completed.`);
        }
      }
    }
  } catch (err: any) {
    console.error("Cron Error processing gains:", err.message);
  }
});


cron.schedule('0 17 * * *', async () => {
  if (!activeGroupId) return;
  try {
    await bot.setChatPermissions(activeGroupId, {
      can_send_messages: false,
      can_send_media_messages: false,
      can_send_other_messages: false,
      can_send_polls: false
    });
    await bot.sendMessage(activeGroupId, "🔒 <b>HORAIRE DE FERMETURE</b>\n\nLe groupe est désormais fermé.\nLes discussions reprendront demain matin à 09h00 GMT.", { parse_mode: "HTML" });
    console.log("Groupe fermé à 17h00 GMT");
  } catch (e: any) {
    console.error("Erreur fermeture", e.message);
  }
}, { timezone: "UTC" });

cron.schedule('0 9 * * *', async () => {
  if (!activeGroupId) return;
  try {
    await bot.setChatPermissions(activeGroupId, {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_other_messages: true,
      can_send_polls: true,
      can_add_web_page_previews: false
    });
    await bot.sendMessage(activeGroupId, "🔓 <b>HORAIRE D'OUVERTURE</b>\n\nLe groupe est ouvert ! Excellente journée à tous et bons investissements.", { parse_mode: "HTML" });
    console.log("Groupe ouvert à 09h00 GMT");
  } catch (e: any) {
    console.error("Erreur ouverture", e.message);
  }
}, { timezone: "UTC" });

// --- EXPRESS + VITE SERVER ---
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Helper to ensure payment recipient/name is displayed as "Dépôt de" on MoneyFusion
  function cleanPaymentUrl(url: string): string {
    if (!url) return url;
    try {
      // MoneyFusion payin format: https://payin.moneyfusion.net/payment/:token/:amount/:name
      const paymentRegex = /(https:\/\/payin\.moneyfusion\.net\/payment\/[^\/]+\/[^\/]+\/)(.*)/i;
      if (paymentRegex.test(url)) {
        return url.replace(paymentRegex, '$1D%C3%A9p%C3%B4t%20de');
      }
    } catch (e) {
      // fallback
    }
    return url.replace(/assande(\s|%20)+tanoa(\s|%20)+grace(\s|%20)+debora(t|h)?/gi, 'D%C3%A9p%C3%B4t%20de');
  }

  // Automatic crediting helper for a MoneyFusion payment token
  async function checkAndCreditToken(token: string, txId?: string, userId?: string, fallbackAmount?: number) {
    if (!token) return { success: false, status: 'missing_token' };
    try {
      const statusRes = await fetch(`https://pay.moneyfusion.net/api/v3/payments/status/${token}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!statusRes.ok) {
        return { success: false, status: `http_${statusRes.status}` };
      }

      const statusData = await statusRes.json();
      const payStatus = statusData?.data?.status;

      if (payStatus === 'paid' || payStatus === 'completed' || payStatus === 'success') {
        // Find existing transaction
        let tx: any = null;
        if (txId) {
          const { data: byId } = await supabase.from('transactions').select('*').eq('id', txId).maybeSingle();
          tx = byId;
        }
        if (!tx) {
          const { data: byRef } = await supabase
            .from('transactions')
            .select('*')
            .eq('type', 'deposit')
            .ilike('reference', `%${token}%`)
            .maybeSingle();
          tx = byRef;
        }

        // Already completed -> do not credit twice
        if (tx && tx.status === 'completed') {
          return { success: true, status: 'already_completed', credited: false };
        }

        const targetUserId = tx?.user_id || userId;
        const creditAmount = Number(tx?.amount || fallbackAmount || 0);

        if (targetUserId && creditAmount > 0) {
          if (tx?.id) {
            await supabase.from('transactions').update({ 
              status: 'completed',
              reference: `MoneyFusion - ${token}`
            }).eq('id', tx.id);
          } else {
            await supabase.from('transactions').insert({
              user_id: targetUserId,
              type: 'deposit',
              amount: creditAmount,
              status: 'completed',
              reference: `MoneyFusion - ${token} (Auto)`
            });
          }

          const { data: usr } = await supabase.from('users').select('balance').eq('id', targetUserId).single();
          if (usr) {
            const newBal = Number(usr.balance || 0) + creditAmount;
            await supabase.from('users').update({ balance: newBal }).eq('id', targetUserId);
            console.log(`✅ [MONEYFUSION AUTO-DEPOSIT] ${creditAmount} FCFA crédités automatiquement à ${targetUserId} (Token: ${token})`);
            return { success: true, status: 'completed', credited: true, balance: newBal, amount: creditAmount };
          }
        }
      }

      return { success: false, status: payStatus || 'pending' };
    } catch (e: any) {
      console.error(`Check payment status error (${token}):`, e.message);
      return { success: false, status: 'exception', error: e.message };
    }
  }

  // Automatic deposit validation cron (runs every 20 seconds)
  cron.schedule('*/20 * * * * *', async () => {
    try {
      const { data: pendingDeposits } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'deposit')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(15);

      if (!pendingDeposits || pendingDeposits.length === 0) return;

      for (const dep of pendingDeposits) {
        const match = (dep.reference || '').match(/([a-f0-9]{20,32})/i);
        if (match) {
          const token = match[1];
          await checkAndCreditToken(token, dep.id, dep.user_id, Number(dep.amount));
        }
      }
    } catch (cronErr: any) {
      // Non-blocking
    }
  });

  // MoneyFusion background payment initialization endpoint (handles both /api/moneyfusion/init and /api/pay)
  const handleMoneyFusionInit = async (req: express.Request, res: express.Response) => {
    try {
      const { montant, name, phone, customerEmail, countryCode, userId, txId } = req.body;
      const cleanPhone = phone ? (phone.startsWith('+') ? phone : `+225${phone.replace(/\s+/g, '')}`) : '+2250700000000';
      
      const payload = {
        id: "6a7da1aa655b3c8aa7379d96",
        montant: String(montant),
        name: "Dépôt de",
        phone: cleanPhone,
        customerEmail: customerEmail || "depot@agritrans-ci.com",
        countryCode: countryCode || "+225"
      };

      const response = await fetch("https://pay.moneyfusion.net/api/v2/links/init-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      let cleanUrl = data?.url;
      let token: string | null = null;

      if (cleanUrl) {
        const tokenMatch = cleanUrl.match(/payment\/([a-zA-Z0-9_-]+)/i);
        if (tokenMatch) {
          token = tokenMatch[1];
        }
        cleanUrl = cleanPaymentUrl(cleanUrl);
      }

      // If txId provided and token extracted, update reference in Supabase
      if (txId && token) {
        try {
          await supabase.from('transactions').update({
            reference: `MoneyFusion - ${token}`
          }).eq('id', txId);
        } catch (dbErr) {
          console.warn('Could not update pending tx reference:', dbErr);
        }
      }

      if (!cleanUrl) {
        return res.status(502).json({
          statut: false,
          error: "Échec du pré-remplissage automatique en arrière-plan de la première page MoneyFusion."
        });
      }

      res.json({
        statut: true,
        url: cleanUrl,
        token: token
      });
    } catch (err: any) {
      console.error("Erreur proxy MoneyFusion:", err.message);
      res.status(500).json({ error: err.message });
    }
  };

  app.post("/api/moneyfusion/init", handleMoneyFusionInit);
  app.post("/api/pay", handleMoneyFusionInit);

  // Immediate status check & crediting endpoint
  app.get("/api/moneyfusion/verify", async (req, res) => {
    const token = (req.query.token as string) || '';
    const txId = (req.query.txId as string) || '';
    const userId = (req.query.userId as string) || '';

    if (!token && !txId) {
      return res.status(400).json({ error: "Token ou Transaction ID requis" });
    }

    let searchToken = token;
    let fallbackAmount = 0;
    if (!searchToken && txId) {
      const { data: tx } = await supabase.from('transactions').select('*').eq('id', txId).maybeSingle();
      if (tx) {
        fallbackAmount = Number(tx.amount || 0);
        const match = (tx.reference || '').match(/([a-f0-9]{20,32})/i);
        if (match) searchToken = match[1];
      }
    }

    if (!searchToken) {
      return res.json({ success: false, status: 'no_token_found' });
    }

    const result = await checkAndCreditToken(searchToken, txId, userId, fallbackAmount);
    res.json(result);
  });

  // Webhook endpoint in case MoneyFusion calls it
  app.post("/api/moneyfusion/webhook", async (req, res) => {
    try {
      const body = req.body || {};
      const token = body.token || body.payment_token || body.id || (body.data && body.data.token);
      if (token) {
        await checkAndCreditToken(token);
      }
      res.json({ received: true });
    } catch (e: any) {
      res.json({ received: false, error: e.message });
    }
  });

  // Redirect old domain
  app.use((req, res, next) => {
    const host = req.get('host') || '';
    const origin = req.get('origin') || '';
    if (host.toLowerCase().includes('qualcomm.site') || origin.toLowerCase().includes('qualcomm.site')) {
      return res.redirect(301, 'https://soleil-power.xyz' + req.originalUrl);
    }
    next();
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
