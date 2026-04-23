import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';

const token = '8624832383:AAHhIgbdrbxl5wXl0ntUwM2jjXhTOZ015r0';
let activeGroupId: string | null = null; // Will auto-detect

const bot = new TelegramBot(token, { polling: true });

const userWarnings = new Map<number, number>();
const ALLOWED_LINK = "petrolimex-ci.site/register";

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
