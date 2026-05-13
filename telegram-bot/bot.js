require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

// Remplacez par votre Token ou utilisez un fichier .env
const token = process.env.TELEGRAM_BOT_TOKEN || 'VOTRE_TOKEN_ICI';
// Remplacez par l'ID de votre groupe (ex: -100123456789)
const groupId = process.env.GROUP_CHAT_ID || 'ID_DU_GROUPE_ICI';

const bot = new TelegramBot(token, { polling: true });

// Stockage en mémoire des avertissements : { userId: nombreD_Avertissements }
const userWarnings = new Map();

// Le seul lien autorisé
const ALLOWED_LINK = "petrolimex-ci.site/register";

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.first_name || msg.from.username || "Membre";

  // Si c'est un message texte ou avec une légende (photo/vidéo)
  if (msg.text || msg.caption) {
    const textToCheck = msg.text || msg.caption;
    
    // Expression régulière pour détecter n'importe quel lien HTTP ou www ou domaine.tld
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/ig;
    const urls = textToCheck.match(urlRegex);

    if (urls && urls.length > 0) {
      // Ignorer les messages envoyés par les administrateurs du groupe
      try {
        const chatMember = await bot.getChatMember(chatId, userId);
        if (chatMember.status === 'creator' || chatMember.status === 'administrator') {
            return; // Les admins peuvent envoyer des liens
        }
      } catch (e) {
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
          // 1. Supprimer le message
          await bot.deleteMessage(chatId, msg.message_id);
          
          // 2. Compter l'avertissement
          let warnings = userWarnings.get(userId) || 0;
          warnings += 1;
          userWarnings.set(userId, warnings);

          if (warnings >= 3) {
            // 3. Bannir après 3 fautes
            await bot.banChatMember(chatId, userId);
            await bot.sendMessage(chatId, `🚫 <b>Bannissement Automatique</b>\n\nL'utilisateur <a href="tg://user?id=${userId}">${userName}</a> a été définitivement banni du groupe pour avoir envoyé plus de 3 liens non autorisés.`, { parse_mode: 'HTML' });
            
            // Retirer l'utilisateur de la mémoire pour nettoyer
            userWarnings.delete(userId);
          } else {
            // Avertir
            const warnMsg = await bot.sendMessage(chatId, `⚠️ <b>Avertissement pour <a href="tg://user?id=${userId}">${userName}</a> !</b>\n\nLes liens externes sont strictement interdits dans ce groupe, à l'exception du lien d'inscription officiel.\n\n🛑 <b>Avertissement ${warnings}/3</b> avant bannissement définitif du groupe.`, { parse_mode: 'HTML' });
            
            // Optionnel: Supprimer le message d'avertissement du bot après 15 secondes pour ne pas polluer le groupe
            setTimeout(() => {
              bot.deleteMessage(chatId, warnMsg.message_id).catch(() => {});
            }, 15000);
          }
        } catch (error) {
          console.error("Erreur de sanction (Le bot est-il bien administrateur du groupe ?) :", error.message);
        }
      }
    }
  }
});

// --- COMMANDE 1 : HORAIRES ---

// Fermeture : Chaque jour à 17h00 GMT
cron.schedule('0 17 * * *', async () => {
  if (!groupId) return console.error("GROUP_CHAT_ID non défini.");
  try {
    // Rend le groupe "Lecture seule"
    await bot.setChatPermissions(groupId, {
      can_send_messages: false,
      can_send_media_messages: false,
      can_send_other_messages: false,
      can_send_polls: false
    });
    await bot.sendMessage(groupId, "🔒 <b>HORAIRE DE FERMETURE</b>\n\nLe groupe est désormais fermé.\nLes discussions reprendront demain matin à 09h00 GMT.", { parse_mode: "HTML" });
    console.log("Groupe fermé à 17h00 GMT");
  } catch (e) {
    console.error("Erreur lors de la fermeture du groupe", e.message);
  }
}, { timezone: "UTC" }); // UTC = GMT


// Ouverture : Chaque jour à 09h00 GMT
cron.schedule('0 9 * * *', async () => {
  if (!groupId) return console.error("GROUP_CHAT_ID non défini.");
  try {
    // Ouvre le groupe et autorise l'envoi de textes et médias (pas les preview url)
    await bot.setChatPermissions(groupId, {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_other_messages: true,
      can_send_polls: true,
      can_add_web_page_previews: false // Recommandé si vous bloquez les liens externes
    });
    await bot.sendMessage(groupId, "🔓 <b>HORAIRE D'OUVERTURE</b>\n\nLe groupe est ouvert ! Excellente journée à tous et bons investissements.", { parse_mode: "HTML" });
    console.log("Groupe ouvert à 09h00 GMT");
  } catch (e) {
    console.error("Erreur lors de l'ouverture du groupe", e.message);
  }
}, { timezone: "UTC" });


// Commande pour vérifier si le bot est vivant (optionnelle)
bot.onText(/\/ping/, (msg) => {
  bot.sendMessage(msg.chat.id, "Je suis en ligne et je surveille le groupe ! ✅");
});

console.log("🤖 Petrolimex Bot démarré et en attente de messages...");
