"use client"

import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useQuery } from "react-query"
import { settingsAPI } from "@/lib/api"

export default function TermsPage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const { data: settingsData } = useQuery(["settings"], () => settingsAPI.getSettings())
  
  const contactInfo = settingsData?.data?.settings?.contactInfo || {
    email: "support@sarkarispark.com",
    phone: "+91 98765 43210",
    address: "New Delhi, India",
  }

  const content = {
    en: {
      title: "Terms of Service",
      welcome: "Welcome to Sarkari Spark",
      welcomeText: "By accessing or using Sarkari Spark, you agree to comply with these Terms of Service. If you do not agree with any part of these terms, please do not use our website.",
      section1: "1. Website Purpose",
      section1Text: "Sarkari Spark is an independent educational and informational platform created to provide updates related to government exams, jobs, results, admit cards, and study resources. We are not affiliated with any government authority, department, or agency.",
      section2: "2. Use of Content",
      section2Text: "All content available on Sarkari Spark is provided for personal, educational, and non-commercial use only. You may not copy, reproduce, republish, modify, or distribute any website material without prior written permission.",
      section3: "3. Information Accuracy",
      section3Text: "We try to provide accurate and updated information; however, Sarkari Spark does not guarantee the completeness or reliability of any content. Users are strongly advised to verify all information through official government websites before making any decision or submitting any application.",
      section4: "4. External Links",
      section4Text: "Our website may contain links to third-party or official websites. We are not responsible for the content, policies, or accuracy of any external website.",
      section5: "5. User Responsibility",
      section5Text: "Users agree not to misuse the website, engage in unlawful activities, attempt unauthorized access, or violate any applicable laws while using Sarkari Spark.",
      section6: "6. Copyright & Trademarks",
      section6Text: "All trademarks, logos, exam names, and related content belong to their respective owners. Sarkari Spark does not claim ownership of any third-party or government-related materials referenced on the website.",
      section7: "7. Third-Party Services",
      section7Text: "We may use third-party advertisements, analytics, or other services to improve website functionality and user experience.",
      section8: "8. Limitation of Liability",
      section8Text: "Sarkari Spark shall not be held responsible for any direct or indirect loss, damage, or inconvenience resulting from the use of the website or reliance on its content.",
      section9: "9. Changes to Terms",
      section9Text: "We reserve the right to update or modify these Terms of Service at any time without prior notice. Continued use of the website after changes means you accept the updated terms.",
      section10: "10. Governing Law",
      section10Text: "These Terms shall be governed and interpreted in accordance with the laws of India.",
      contact: "Contact Us",
      email: "Email",
      website: "Website",
      lastUpdated: "Last Updated"
    },
    hi: {
      title: "उपयोग की शर्तें",
      welcome: "Sarkari Spark में आपका स्वागत है",
      welcomeText: "Sarkari Spark तक पहुंच या उपयोग करके, आप इन सेवा की शर्तों का पालन करने के लिए सहमत होते हैं। यदि आप इन शर्तों के किसी भी हिस्से से सहमत नहीं हैं, तो कृपया हमारी वेबसाइट का उपयोग न करें।",
      section1: "1. वेबसाइट का उद्देश्य",
      section1Text: "Sarkari Spark एक स्वतंत्र शैक्षिक और सूचना प्लेटफ़ॉर्म है जो सरकारी परीक्षाओं, नौकरियों, परिणामों, प्रवेश पत्रों और अध्ययन संसाधनों से संबंधित अपडेट प्रदान करने के लिए बनाया गया है। हम किसी भी सरकारी प्राधिकरण, विभाग, या एजेंसी से संबद्ध नहीं हैं।",
      section2: "2. सामग्री का उपयोग",
      section2Text: "Sarkari Spark पर उपलब्ध सभी सामग्री केवल व्यक्तिगत, शैक्षिक और गैर-वाणिज्यिक उपयोग के लिए प्रदान की जाती है। आप पूर्व लिखित अनुमति के बिना किसी भी वेबसाइट सामग्री की कॉपी, पुनरुत्पादन, पुनः प्रकाशन, संशोधन, या वितरण नहीं कर सकते हैं।",
      section3: "3. जानकारी की सटीकता",
      section3Text: "हम सटीक और अद्यतन जानकारी प्रदान करने का प्रयास करते हैं; हालांकि, Sarkari Spark किसी भी सामग्री की पूर्णता या विश्वसनीयता की गारंटी नहीं देता है। उपयोगकर्ताओं को सलाह दी जाती है कि वे किसी भी निर्णय लेने या कोई आवेदन जमा करने से पहले आधिकारिक सरकारी वेबसाइटों के माध्यम से सभी जानकारी की पुष्टि करें।",
      section4: "4. बाहरी लिंक",
      section4Text: "हमारी वेबसाइट में तीसरे पक्ष या आधिकारिक वेबसाइटों के लिंक हो सकते हैं। हम किसी भी बाहरी वेबसाइट की सामग्री, नीतियों, या सटीकता के लिए जिम्मेदार नहीं हैं।",
      section5: "5. उपयोगकर्ता की जिम्मेदारी",
      section5Text: "उपयोगकर्ता सहमत होते हैं कि वे Sarkari Spark का उपयोग करते समय वेबसाइट का दुरुपयोग नहीं करेंगे, अवैध गतिविधियों में संलग्न नहीं होंगे, अनधिकृत पहुंच का प्रयास नहीं करेंगे, या किसी भी लागू कानून का उल्लंघन नहीं करेंगे।",
      section6: "6. कॉपीराइट और ट्रेडमार्क",
      section6Text: "सभी ट्रेडमार्क, लोगो, परीक्षा नाम, और संबंधित सामग्री उनके संबंधित मालिकों के स्वामित्व में हैं। Sarkari Spark वेबसाइट पर संदर्भित किसी भी तीसरे पक्ष या सरकारी संबंधित सामग्री के स्वामित्व का दावा नहीं करता है।",
      section7: "7. तीसरे पक्ष की सेवाएं",
      section7Text: "हम वेबसाइट की कार्यक्षमता और उपयोगकर्ता अनुभव में सुधार के लिए तीसरे पक्ष के विज्ञापन, विश्लेषण, या अन्य सेवाओं का उपयोग कर सकते हैं।",
      section8: "8. दायित्व की सीमा",
      section8Text: "Sarkari Spark वेबसाइट के उपयोग या इसकी सामग्री पर निर्भरता के परिणामस्वरूप होने वाले किसी भी प्रत्यक्ष या अप्रत्यक्ष नुकसान, क्षति, या असुविधा के लिए जिम्मेदार नहीं होगा।",
      section9: "9. शर्तों में बदलाव",
      section9Text: "हम किसी भी समय पूर्व सूचना के बिना इन सेवा की शर्तों को अपडेट या संशोधित करने का अधिकार सुरक्षित रखते हैं। बदलाव के बाद वेबसाइट का निरंतर उपयोग इसका मतलब है कि आप अद्यतन शर्तों को स्वीकार करते हैं।",
      section10: "10. शासी कानून",
      section10Text: "ये शर्तें भारत के कानूनों के अनुसार शासित और व्याख्या की जाएंगी।",
      contact: "संपर्क करें",
      email: "ईमेल",
      website: "वेबसाइट",
      lastUpdated: "अंतिम अद्यतन"
    }
  }

  const t = content[language]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Language Toggle */}
          <div className="flex justify-end mb-6">
            <div className="inline-flex rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  language === 'hi'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t.title}
          </h1>

          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.welcome}
              </h2>
              <p className="text-gray-700">
                {t.welcomeText}
              </p>
            </section>

            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section1}
              </h2>
              <p className="text-gray-700">
                {t.section1Text}
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section2}
              </h2>
              <p className="text-gray-700">
                {t.section2Text}
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section3}
              </h2>
              <p className="text-gray-700">
                {t.section3Text}
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section4}
              </h2>
              <p className="text-gray-700">
                {t.section4Text}
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section5}
              </h2>
              <p className="text-gray-700">
                {t.section5Text}
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section6}
              </h2>
              <p className="text-gray-700">
                {t.section6Text}
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section7}
              </h2>
              <p className="text-gray-700">
                {t.section7Text}
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section8}
              </h2>
              <p className="text-gray-700">
                {t.section8Text}
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section9}
              </h2>
              <p className="text-gray-700">
                {t.section9Text}
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section10}
              </h2>
              <p className="text-gray-700">
                {t.section10Text}
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.contact}
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>{t.email}:</strong> {contactInfo.email}
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>{t.website}:</strong> https://www.sarkarispark.com
                </p>
              </div>
            </section>

            {/* Last Updated */}
            <div className="border-t pt-6 mt-8">
              <p className="text-gray-600 text-sm text-center">
                {t.lastUpdated}: {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
