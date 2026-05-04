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
      
      const welcomeText = `Bienvenue sur la plateforme <b>SUNPOWER</b>, <a href="tg://user?id=${newMember.id}">${memberName}</a> ! 🛢️

Cher client fidèle,
Nous sommes ravis de vous compter parmi nos membres. 🙌

💼 <u><b>Nos Offres</b></u> :
• 🎁 <b>Bonus d’inscription :</b> 100 F CFA
• 💰 <b>Dépôt minimum :</b> 2 500 F CFA
• 💸 <b>Retrait minimum :</b> 1 000 F CFA
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

🚀 <i><b>SUNPOWER</b>, votre partenaire de confiance</i>`;

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

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ooekuyetmfgmpmwxtkpf.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZWt1eWV0bWZnbXBtd3h0a3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA4MTA5OSwiZXhwIjoyMDkxNjU3MDk5fQ.yQAGVNueCiTZ57_wY8ArZs5H5OAo465AbtpUeGdrLhI';
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

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Block requests from qualcomm.site
  app.use((req, res, next) => {
    const host = req.get('host') || '';
    const origin = req.get('origin') || '';
    if (host.toLowerCase().includes('qualcomm.site') || origin.toLowerCase().includes('qualcomm.site')) {
      return res.status(403).send('Accès refusé. Ce domaine a été désactivé.');
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
