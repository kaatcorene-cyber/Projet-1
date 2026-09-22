import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function About() {
  const navigate = useNavigate();

  return (
    <div className="pb-24 pt-6 px-4 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/90 shadow-sm border border-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight">À propos</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col"
      >
        
        <div className="px-2">
          <h3 className="text-xl font-black text-white mb-6 text-center">𝐄𝐋𝐄𝐕𝐅𝐈𝐍𝐀𝐈 𝐂Ô𝐓𝐄 𝐃’𝐈𝐕𝐎𝐈𝐑𝐄 🇨🇮</h3>
          <div className="space-y-4 text-white/80 text-[15px] font-medium leading-relaxed">
            <p>
              𝐄𝐥𝐞𝐯𝐅𝐢𝐧𝐀𝐢 𝐂ô𝐭𝐞 𝐝’𝐈𝐯𝐨𝐢𝐫𝐞 𝐞𝐬𝐭 𝐮𝐧𝐞 𝐢𝐧𝐢𝐭𝐢𝐚𝐭𝐢𝐯𝐞 𝐝é𝐝𝐢é𝐞 𝐚𝐮 𝐝é𝐯𝐞𝐥𝐨𝐩𝐩𝐞𝐦𝐞𝐧𝐭 𝐞𝐭 à 𝐥𝐚 𝐬𝐭𝐫𝐮𝐜𝐭𝐮𝐫𝐚𝐭𝐢𝐨𝐧 𝐝𝐞 𝐥’é𝐥𝐞𝐯𝐚𝐠𝐞 𝐞𝐧 𝐂ô𝐭𝐞 𝐝’𝐈𝐯𝐨𝐢𝐫𝐞. 𝐍𝐨𝐭𝐫𝐞 𝐯𝐢𝐬𝐢𝐨𝐧 𝐞𝐬𝐭 𝐝𝐞 𝐫𝐚𝐬𝐬𝐞𝐦𝐛𝐥𝐞𝐫 𝐥𝐞𝐬 é𝐥𝐞𝐯𝐞𝐮𝐫𝐬, 𝐩𝐫𝐨𝐝𝐮𝐜𝐭𝐞𝐮𝐫𝐬 𝐞𝐭 𝐚𝐜𝐭𝐞𝐮𝐫𝐬 𝐝𝐮 𝐬𝐞𝐜𝐭𝐞𝐮𝐫 𝐚𝐟𝐢𝐧 𝐝𝐞 𝐟𝐚𝐯𝐨𝐫𝐢𝐬𝐞𝐫 𝐥𝐞 𝐩𝐚𝐫𝐭𝐚𝐠𝐞, 𝐥𝐚 𝐜𝐨𝐥𝐥𝐚𝐛𝐨𝐫𝐚𝐭𝐢𝐨𝐧 𝐞𝐭 𝐥𝐞 𝐝é𝐯𝐞𝐥𝐨𝐩𝐩𝐞𝐦𝐞𝐧𝐭 𝐝’𝐚𝐜𝐭𝐢𝐯𝐢𝐭é𝐬 𝐝𝐮𝐫𝐚𝐛𝐥𝐞𝐬.
            </p>
            <p>
              🐄 🐐 🐑 🐓 𝐍𝐨𝐮𝐬 𝐧𝐨𝐮𝐬 𝐢𝐧𝐭é𝐫𝐞𝐬𝐬𝐨𝐧𝐬 𝐚𝐮𝐱 𝐛𝐨𝐯𝐢𝐧𝐬, 𝐨𝐯𝐢𝐧𝐬, 𝐜𝐚𝐩𝐫𝐢𝐧𝐬, 𝐯𝐨𝐥𝐚𝐢𝐥𝐥𝐞𝐬 𝐞𝐭 𝐚𝐮𝐭𝐫𝐞𝐬 𝐞𝐬𝐩è𝐜𝐞𝐬 𝐚𝐝𝐚𝐩𝐭é𝐞𝐬 𝐚𝐮 𝐦𝐚𝐫𝐜𝐡é 𝐢𝐯𝐨𝐢𝐫𝐢𝐞𝐧.
            </p>
            <p>
              𝐍𝐨𝐮𝐬 𝐚𝐯𝐨𝐧𝐬 𝐨𝐛𝐬𝐞𝐫𝐯é 𝐚𝐯𝐞𝐜 𝐛𝐞𝐚𝐮𝐜𝐨𝐮𝐩 𝐝’𝐢𝐧𝐭é𝐫ê𝐭 𝐥𝐞 𝐭𝐫𝐚𝐯𝐚𝐢𝐥 𝐫é𝐚𝐥𝐢𝐬é 𝐩𝐚𝐫 𝐥’𝐚𝐬𝐬𝐨𝐜𝐢𝐚𝐭𝐢𝐨𝐧 𝐚𝐠𝐫𝐢𝐜𝐨𝐥𝐞 𝐀𝐠𝐫𝐢𝐅𝐢𝐧𝐀𝐢. 𝐋𝐞𝐮𝐫𝐬 𝐫é𝐚𝐥𝐢𝐬𝐚𝐭𝐢𝐨𝐧𝐬 𝐧𝐨𝐮𝐬 𝐨𝐧𝐭 𝐢𝐧𝐬𝐩𝐢𝐫é𝐬 𝐞𝐭 𝐧𝐨𝐮𝐬 𝐬𝐨𝐮𝐡𝐚𝐢𝐭𝐨𝐧𝐬 𝐬𝐮𝐢𝐯𝐫𝐞 𝐜𝐞𝐭 𝐞𝐱𝐞𝐦𝐩𝐥𝐞 𝐩𝐨𝐮𝐫 𝐜𝐨𝐧𝐬𝐭𝐫𝐮𝐢𝐫𝐞 𝐮𝐧𝐞 𝐨𝐫𝐠𝐚𝐧𝐢𝐬𝐚𝐭𝐢𝐨𝐧 𝐬é𝐫𝐢𝐞𝐮𝐬𝐞, 𝐬𝐨𝐥𝐢𝐝𝐞 𝐞𝐭 𝐝𝐮𝐫𝐚𝐛𝐥𝐞 𝐚𝐯𝐞𝐜 𝐚𝐦𝐛𝐢𝐭𝐢𝐨𝐧.
            </p>
            <p>
              🎯 𝐍𝐨𝐭𝐫𝐞 𝐨𝐛𝐣𝐞𝐜𝐭𝐢𝐟 𝐞𝐬𝐭 𝐝𝐞 𝐩𝐫𝐨𝐟𝐞𝐬𝐬𝐢𝐨𝐧𝐧𝐚𝐥𝐢𝐬𝐞𝐫 𝐥’é𝐥𝐞𝐯𝐚𝐠𝐞, 𝐚𝐜𝐜𝐨𝐦𝐩𝐚𝐠𝐧𝐞𝐫 𝐥𝐞𝐬 é𝐥𝐞𝐯𝐞𝐮𝐫𝐬, 𝐞𝐧𝐜𝐨𝐮𝐫𝐚𝐠𝐞𝐫 𝐥𝐚 𝐩𝐫𝐨𝐝𝐮𝐜𝐭𝐢𝐨𝐧 𝐥𝐨𝐜𝐚𝐥𝐞 𝐞𝐭 𝐝é𝐯𝐞𝐥𝐨𝐩𝐩𝐞𝐫 𝐮𝐧 𝐫é𝐬𝐞𝐚𝐮 𝐜𝐚𝐩𝐚𝐛𝐥𝐞 𝐝𝐞 𝐩𝐨𝐫𝐭𝐞𝐫 𝐝𝐞𝐬 𝐩𝐫𝐨𝐣𝐞𝐭𝐬 à 𝐠𝐫𝐚𝐧𝐝𝐞 é𝐜𝐡𝐞𝐥𝐥𝐞.
            </p>
            <p>
              🤝 𝐄𝐥𝐞𝐯𝐅𝐢𝐧𝐀𝐢, 𝐜’𝐞𝐬𝐭 𝐮𝐧𝐞 𝐯𝐢𝐬𝐢𝐨𝐧 : 𝐫é𝐮𝐧𝐢𝐫 𝐥𝐞𝐬 𝐜𝐨𝐦𝐩é𝐭𝐞𝐧𝐜𝐞𝐬 𝐞𝐭 𝐥𝐞𝐬 𝐚𝐦𝐛𝐢𝐭𝐢𝐨𝐧𝐬 𝐝𝐞𝐬 é𝐥𝐞𝐯𝐞𝐮𝐫𝐬 𝐢𝐯𝐨𝐢𝐫𝐢𝐞𝐧𝐬 𝐩𝐨𝐮𝐫 𝐜𝐨𝐧𝐬𝐭𝐫𝐮𝐢𝐫𝐞 𝐞𝐧𝐬𝐞𝐦𝐛𝐥𝐞 𝐮𝐧𝐞 𝐚𝐜𝐭𝐢𝐯𝐢𝐭é 𝐬𝐭𝐫𝐮𝐜𝐭𝐮𝐫é𝐞 𝐞𝐭 𝐝𝐮𝐫𝐚𝐛𝐥𝐞.
            </p>
          </div>
          
          
          
          <div className="space-y-6 text-white/80 text-[15px] font-medium leading-relaxed border-t border-white/10 pt-8">
            <h4 className="text-lg font-black text-white text-center mb-4">🇨🇮 𝐂𝐎𝐍𝐃𝐈𝐓𝐈𝐎𝐍𝐒 𝐄𝐋𝐄𝐕𝐅𝐈𝐍𝐀𝐈</h4>
            
            <div>
              <p className="font-bold text-slate-800">💰 𝐃É𝐏Ô𝐓𝐒</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>𝐌𝐢𝐧𝐢𝐦𝐮𝐦 : 𝟐 𝟎𝟎𝟎 𝐅</li>
                <li>𝐌𝐚𝐱𝐢𝐦𝐮𝐦 : 𝟓𝟎𝟎 𝟎𝟎𝟎 𝐅</li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-slate-800">💸 𝐑𝐄𝐓𝐑𝐀𝐈𝐓𝐒</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>𝐌𝐢𝐧𝐢𝐦𝐮𝐦 : 𝟏 𝟎𝟎𝟎 𝐅</li>
                <li>𝐌𝐚𝐱𝐢𝐦𝐮𝐦 : 𝟏 𝟎𝟎𝟎 𝟎𝟎𝟎 𝐅</li>
                <li>𝐅𝐫𝐚𝐢𝐬 𝐝𝐞 𝐫𝐞𝐭𝐫𝐚𝐢𝐭 : 𝟏𝟎 %</li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-slate-800">🕘 𝐇𝐎𝐑𝐀𝐈𝐑𝐄𝐒 𝐃𝐄 𝐑𝐄𝐓𝐑𝐀𝐈𝐓</p>
              <p className="mt-1">𝐃𝐮 𝐥𝐮𝐧𝐝𝐢 𝐚𝐮 𝐬𝐚𝐦𝐞𝐝𝐢, 𝐝𝐞 𝟎𝟗𝐇𝟎𝟎 à 𝟐𝟎𝐇𝟎𝟎.</p>
            </div>

            <div>
              <p className="font-bold text-slate-800">⚡ 𝐃É𝐏Ô𝐓 𝐄𝐓 𝐑𝐄𝐓𝐑𝐀𝐈𝐓</p>
              <p className="mt-1">𝐎𝐩é𝐫𝐚𝐭𝐢𝐨𝐧𝐬 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐪𝐮𝐞𝐬.</p>
            </div>

            <div>
              <p className="font-bold text-slate-800">🤝 𝐏𝐀𝐑𝐑𝐀𝐈𝐍𝐀𝐆𝐄</p>
              <ul className="list-none mt-1 space-y-1">
                <li>🔹 𝐍𝐢𝐯𝐞𝐚𝐮 𝟏 : 𝟏𝟎 %</li>
                <li>🔹 𝐍𝐢𝐯𝐞𝐚𝐮 𝟐 : 𝟑 %</li>
                <li>🔹 𝐍𝐢𝐯𝐞𝐚𝐮 𝟑 : 𝟐 %</li>
              </ul>
            </div>

            <div className="pt-2">
              <p className="font-bold text-slate-800 mb-2">🚀 𝐈𝐍𝐕𝐈𝐓𝐄𝐙 𝐃𝐄𝐒 𝐌𝐄𝐌𝐁𝐑𝐄𝐒 𝐀𝐂𝐓𝐈𝐅𝐒 𝐄𝐓 𝐆𝐀𝐆𝐍𝐄𝐙 𝐏𝐋𝐔𝐒 !</p>
              <ul className="list-none space-y-1">
                <li>👤 𝟏 𝐦𝐞𝐦𝐛𝐫𝐞 𝐚𝐜𝐭𝐢𝐟 → 𝟐𝟎𝟎𝐅</li>
                <li>👥 𝟓 𝐦𝐞𝐦𝐛𝐫𝐞𝐬 → 𝟏 𝟎𝟎𝟎𝐅</li>
                <li>👥 𝟏𝟎 𝐦𝐞𝐦𝐛𝐫𝐞𝐬 → 𝟐 𝟎𝟎𝟎𝐅</li>
                <li>👥 𝟑𝟎 𝐦𝐞𝐦𝐛𝐫𝐞𝐬 → 𝟔 𝟎𝟎𝟎𝐅</li>
                <li>👥 𝟓𝟎 𝐦𝐞𝐦𝐛𝐫𝐞𝐬 𝐚𝐜𝐭𝐢𝐟𝐬 → 𝟏𝟎 𝟎𝟎𝟎𝐅</li>
                <li>👥 𝟏𝟎𝟎 𝐦𝐞𝐦𝐛𝐫𝐞𝐬 𝐚𝐜𝐭𝐢𝐟𝐬 → 𝟑𝟎 𝟎𝟎𝟎𝐅</li>
                <li>👥 𝟏𝟓𝟎 𝐦𝐞𝐦𝐛𝐫𝐞𝐬 𝐚𝐜𝐭𝐢𝐟𝐬 → 𝟓𝟎 𝟎𝟎𝟎𝐅</li>
                <li>👥 𝟑𝟎𝟎 𝐦𝐞𝐦𝐛𝐫𝐞𝐬 𝐚𝐜𝐭𝐢𝐟𝐬 → 𝟏𝟏𝟎 𝟎𝟎𝟎𝐅</li>
                <li>👥 𝟓𝟎𝟎 𝐦𝐞𝐦𝐛𝐫𝐞𝐬 𝐚𝐜𝐭𝐢𝐟𝐬 → 𝟐𝟎𝟎 𝟎𝟎𝟎𝐅</li>
              </ul>
              <p className="font-bold text-slate-800 mt-3">🔥 𝐏𝐋𝐔𝐒 𝐕𝐎𝐔𝐒 𝐈𝐍𝐕𝐈𝐓𝐄𝐙, 𝐏𝐋𝐔𝐒 𝐕𝐎𝐔𝐒 𝐆𝐀𝐆𝐍𝐄𝐙 !</p>
            </div>

            <div className="text-center pt-4">
              <p>🤝 Construisons ensemble une communauté active, solide et ambitieuse ! 🚀🌱</p>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
