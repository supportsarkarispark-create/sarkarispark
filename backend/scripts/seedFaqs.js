const mongoose = require('mongoose');
const Faq = require('../models/Faq');
require('dotenv').config();

const seedFaqs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sarkari-spark');
    console.log('Connected to MongoDB');

    const homepageFaqs = [
      {
        question: "Kya Sarkari Spark par Free Mock Tests available hain?",
        answer: "Haan! Har ek exam category (SSC, UP Police, Railway, Banking) ke pehle 1 se 2 mock tests bilkul 100% FREE hain taaki aap platform aur question quality bina kisi payment ke test kar sakein.",
        category: "Exams & Mock Tests",
        order: 1,
        isActive: true
      },
      {
        question: "Test submit karne ke baad result kab milta hai?",
        answer: "Test submit karte hi aapko turant Instant Scorecard, All-India Rank, Section-wise Accuracy, Percentile aur sabhi sawalon ke detailed step-by-step solutions mil jaate hain.",
        category: "Results & Rankings",
        order: 2,
        isActive: true
      },
      {
        question: "Kya sawal Hindi aur English dono bhashao me hain?",
        answer: "Ji bilkul! Sarkari Spark ke sabhi mock tests aur solutions 100% Bilingual (Hindi + English) hain. Aap exam dete samay bhi ek click me language badal sakte hain.",
        category: "Language & Format",
        order: 3,
        isActive: true
      },
      {
        question: "Kya main mobile phone par bhi test de sakta hoon?",
        answer: "Haan, Sarkari Spark mobile, tablet aur laptop har device ke liye fully optimized hai. Aap bina kisi rukawat ke apne phone browser me test attempt kar sakte hain.",
        category: "Device & Platform",
        order: 4,
        isActive: true
      }
    ];

    for (const faq of homepageFaqs) {
      const exists = await Faq.findOne({ question: faq.question });
      if (!exists) {
        await Faq.create(faq);
        console.log(`Created FAQ: "${faq.question}"`);
      } else {
        await Faq.updateOne({ question: faq.question }, { $set: faq });
        console.log(`Updated existing FAQ: "${faq.question}"`);
      }
    }

    const totalCount = await Faq.countDocuments();
    console.log(`Done! Total FAQs in database: ${totalCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding FAQs:', error);
    process.exit(1);
  }
};

seedFaqs();
