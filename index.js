/*const https = require("https");

function getUpdates () {
    https.get(
        "https://api.telegram.org/bot8036018406:AAHYCbaeG1ocxhkejQStc8uB4HBNLo1XNhM/getMe",
        (response) => {
            response.setEncoding("utf-8")
    
        let data = "";
    
        response.on("data", (chunk) => { 
            data = data = chunk;
            });
    
            response.on("end", () => {
                try {
                    let x = JSON.parse(data);
                    console.log(x);
                } catch (error) {
                    console.log(error.message);
                }
                })
            }      
    ); 
}
    */
  // index.js
  const writeToSheet = require('./writeToSheet');
  require('dotenv').config();
  const { Telegraf } = require('telegraf');
  
  const bot = new Telegraf(process.env.BOT_TOKEN);
  const ADMIN_ID = 968581185;
  let userAskMode = {};
  
  // Start komandasi
  bot.start((ctx) => {
    ctx.reply(
      `Assalomu alaykum, ${ctx.from.first_name}!\nBu bot orqali kurslar haqida ma'lumot olishingiz mumkin.`,
      {
        reply_markup: {
          keyboard: [
            ['📚 Kurslar', '❓ Savol berish'],
            ['💬 Fikrlar', '🌐 Web sayt'],
            ['ℹ️ Biz haqimizda']
          ],
          resize_keyboard: true
        }
      }
    );
  });
  
  // Kurslar haqida
  bot.hears('📚 Kurslar', (ctx) => {
    ctx.reply("📚 Bizning kurslar:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🌐 Web Dasturlash", url: "https://t.me/iMed_team" },
            { text: "🐍 Python Asoslari", url: "https://imedteam.uz/" }
          ],
          [
            { text: "📘 IELTS tayyorlov", url: "https://t.me/iMed_team" }
          ]
        ]
      }
    });
  });
  
  
  // Fikrlar
  bot.hears('💬 Fikrlar', (ctx) => {
    ctx.reply("O'quvchilar fikrlari: https://t.me/iMedteam");
  });

  //biz haqimizda
  bot.hears('ℹ️ Biz haqimizda', (ctx) => {
    ctx.reply("Biz haqimizda qisqacha:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🧑‍💻 Ko‘proq bilish", callback_data: "about_us" }]
        ]
      }
    });
  });
  
  bot.action('about_us', (ctx) => {
    ctx.answerCbQuery(); // bosilganini aniqlaydi
    ctx.reply("“iMed Team” tibbiy platformasi 2021-yildan buyon o‘z faoliyatlarini olib bormoqda. Shu kungacha biz 2000 dan ziyod bo’lgan talaba va shifokorlarni o’qitib keldik. Bizning talabalar turli xil davlat va xususiy shifoxonalarda malakali mutaxasis bo’lib ishlab kelishmoqda. Shuningdek, ularning turli xalqaro hamda milliy olimpiadalarda faxrli o’rinlarni egallab kelayotganlari diqqatga sazovordir.");
  });
  
  
  // Web sayt
  bot.hears('🌐 Web sayt', (ctx) => {
    ctx.reply("Rasmiy saytimiz: https://imedteam.uz/");
  });
  
  // Savol berish
  bot.hears('❓ Savol berish', (ctx) => {
    ctx.reply("Iltimos, telefon raqamingizni yuboring 👇", {
      reply_markup: {
        keyboard: [
          [{ text: "📱 Raqamni yuborish", request_contact: true }],
          ["⬅️ Ortga"]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
  });

  
  // Foydalanuvchi telefon raqamini yuborganida
  bot.on('contact', async (ctx) => {
    const contact = ctx.message.contact;
    const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
    const userId = contact.user_id;
    const phone = contact.phone_number;
    const now = new Date().toLocaleString("uz-UZ");
  
    // Ma'lumotlarni vaqtinchalik saqlaymiz
    userAskMode[userId] = {
      name: fullName,
      phone: phone,
      time: now
    };
  
    await ctx.reply("Raqamingiz qabul qilindi ✅. Endi savolingizni yozib qoldiring:");
  });
  
 

  //ortga tugmasi
  bot.hears('⬅️ Ortga', (ctx) => {
    ctx.reply("Asosiy menyu:", {
      reply_markup: {
        keyboard: [
          ['📚 Kurslar', '❓ Savol berish'],
          ['💬 Fikrlar', '🌐 Web sayt']
        ],
        resize_keyboard: true
      }
    });
  });
  
  
  // Har qanday text
  bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
  
    // Foydalanuvchi savol yuboryaptimi?
    if (userAskMode[userId]) {
        const message = `📩 Yangi savol:\n\n👤 Ism: ${ctx.from.first_name}\n🆔 ID: ${ctx.from.id}\n✉️ Xabar: ${ctx.message.text}`;
      
        bot.telegram.sendMessage(ADMIN_ID, message);
      
        ctx.reply("Savolingiz yuborildi ✅.");
      
        // Sheetsga yozamiz
        const info = userAskMode[userId];
        const row = [info.name, userId, info.phone, ctx.message.text, info.time];
        writeToSheet(row);
      
        userAskMode[userId] = false;
      }
      
  
    // Admin reply qilganini aniqlash
    if (ctx.message.reply_to_message && ctx.from.id == ADMIN_ID) {
      const repliedMessage = ctx.message.reply_to_message;
      const matches = repliedMessage.text.match(/ID: (\d+)/);
  
      if (matches && matches[1]) {
        const targetUserId = matches[1];
        try {
          await bot.telegram.sendMessage(targetUserId, `📢 Admin javobi:\n\n${ctx.message.text}`);
          await ctx.reply("✅ Javob yuborildi.");
        } catch (err) {
          console.error(err);
          await ctx.reply("❌ Foydalanuvchiga yuborib bo‘lmadi.");
        }
      } else {
        ctx.reply("❗️ Reply qilingan xabarda foydalanuvchi ID topilmadi.");
      }
    }
  });
  
  bot.launch();
  console.log("Bot ishga tushdi ✅");



  
