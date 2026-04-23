import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';

const token = '8624832383:AAHhIgbdrbxl5wXl0ntUwM2jjXhTOZ015r0';
let activeGroupId: string | null = null; // Will auto-detect

const bot = new TelegramBot(token, { polling: true });

const userWarnings = new Map<number, number>();
const ALLOWED_LINK = "petrolimex-ci.site/register";

let lastWelcomeMessageId: number | null = null; // Store the ID of the last welcome message

console.log("🤖 Petrolimex Bot démarré avec succès ! En attente de messages...");

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const userName = msg.from?.first_name || msg.from?.username || "Membre";

  // Auto-detect group ID if we don't have one and this is a group chat
  if ((msg.chat.type === 'group' || msg.chat.type === 'supergroup') && !activeGroupId) {
    activeGroupId = chatId.toString();
    console.log(`📌 Groupe détecté et enregistré : ${activeGroupId}`);
    bot.sendMessage(chatId, "🤖 <b>Bot Activé !</b>\nJe suis désormais lié à ce groupe. Je protègerai ce canal des liens externes et je gèrerai les horaires d'ouverture (09h00) et fermeture (17h00) GMT.", { parse_mode: 'HTML' });
  }

  if (!userId) return;

  // Link checking logic
  if (msg.text || msg.caption) {
    const textToCheck = msg.text || msg.caption || "";
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/ig;
    const urls = textToCheck.match(urlRegex);

    if (urls && urls.length > 0) {
      try {
        const chatMember = await bot.getChatMember(chatId, userId);
        if (chatMember.status === 'creator' || chatMember.status === 'administrator') {
            return; // Admins are exempt
        }
      } catch (e: any) {
         console.warn("Impossible de vérifier le statut administratif.", e.message);
      }

      let containsBadLink = false;
      for (const url of urls) {
        if (!url.toLowerCase().includes(ALLOWED_LINK.toLowerCase())) {
          containsBadLink = true;
          break;
        }
      }

      if (containsBadLink) {
        try {
          // 1. Delete message
          await bot.deleteMessage(chatId, msg.message_id);
          
          // 2. Count warning
          let warnings = userWarnings.get(userId) || 0;
          warnings += 1;
          userWarnings.set(userId, warnings);

          if (warnings >= 3) {
            // 3. Ban
            await bot.banChatMember(chatId, userId);
            await bot.sendMessage(chatId, `🚫 <b>Bannissement Automatique</b>\n\nL'utilisateur <a href="tg://user?id=${userId}">${userName}</a> a été définitivement banni du groupe pour avoir envoyé plus de 3 liens non autorisés.`, { parse_mode: 'HTML' });
            userWarnings.delete(userId);
          } else {
            // Warn
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

  // --- WELCOME MESSAGE LOGIC ---
  if (msg.new_chat_members && msg.new_chat_members.length > 0) {
    for (const newMember of msg.new_chat_members) {
      if (newMember.is_bot) continue; // Ignore other bots
      
      const memberName = newMember.first_name || newMember.username || "nouveau membre";
      
      const welcomeText = `Bienvenue sur la plateforme <b>PETROLIMEX</b>, <a href="tg://user?id=${newMember.id}">${memberName}</a> ! 🛢️

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

🚀 <i><b>PETROLIMEX</b>, votre partenaire de confiance</i>`;

      try {
        // Delete previous welcome message if it exists
        if (lastWelcomeMessageId) {
          await bot.deleteMessage(chatId, lastWelcomeMessageId).catch(() => {});
        }
        
        // Delete the system "User joined the group" message (Optional but cleaner)
        await bot.deleteMessage(chatId, msg.message_id).catch(() => {});

        // Send the new welcome message
        const welcomeMsg = await bot.sendMessage(chatId, welcomeText, { parse_mode: 'HTML', disable_web_page_preview: true });
        lastWelcomeMessageId = welcomeMsg.message_id; // Store to delete next time
      } catch (error: any) {
        console.error("Erreur d'envoi du message de bienvenue :", error.message);
      }
    }
  }
});

// --- CRON JOBS ---

// Close group at 17:00 GMT
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

// Open group at 09:00 GMT
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
