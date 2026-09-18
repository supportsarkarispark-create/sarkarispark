"use client"

import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useQuery } from "react-query"
import { settingsAPI } from "@/lib/api"

export default function PrivacyPolicyPage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const { data: settingsData } = useQuery(["settings"], () => settingsAPI.getSettings())
  
  const contactInfo = settingsData?.data?.settings?.contactInfo || {
    email: "support@sarkarispark.com",
    phone: "+91 98765 43210",
    address: "New Delhi, India",
  }

  const content = {
    en: {
      title: "Privacy Policy",
      welcome: "Welcome to Sarkari Spark",
      welcomeText: "At Sarkari Spark, we value your privacy and are committed to protecting any information you share with us. This Privacy Policy explains what information we collect, how we use it, and how we protect it.",
      section1: "1. Information We Collect",
      section1Text: "We may collect limited personal information when you:\n\n* Contact us through forms or email\n* Subscribe to newsletters or updates\n* Comment on posts or interact with the website\n\nThe information collected may include:\n\n* Name\n* Email address\n* IP address\n* Website usage data",
      section2: "2. How We Use Your Information",
      section2Text: "We may use the collected information to:\n\n* Improve website performance and user experience\n* Respond to user inquiries and support requests\n* Send updates, newsletters, or important notifications\n* Analyze website traffic and visitor behavior\n* Prevent spam, misuse, or unauthorized activity",
      section3: "3. Cookies",
      section3Text: "Sarkari Spark may use cookies to improve user experience and analyze website traffic. Cookies help us understand visitor preferences and optimize website content.\n\nUsers can choose to disable cookies through their browser settings.",
      section4: "4. Third-Party Services",
      section4Text: "We may use third-party services such as analytics tools and advertising partners, including Google AdSense, which may use cookies or similar technologies to display relevant advertisements.\n\nThird-party vendors, including Google, may use cookies to serve ads based on users' previous visits to this website or other websites.",
      section5: "5. Third-Party Links",
      section5Text: "Our website may contain links to external or official government websites. We are not responsible for the privacy practices or content of third-party websites.",
      section6: "6. Data Protection",
      section6Text: "We implement reasonable security measures to help protect user information from unauthorized access, misuse, or disclosure. However, no method of online transmission or storage is completely secure.",
      section7: "7. Your Consent",
      section7Text: "By using Sarkari Spark, you consent to this Privacy Policy.",
      section8: "8. Changes to This Privacy Policy",
      section8Text: "We may update this Privacy Policy from time to time. Any changes will be posted on this page along with the updated revision date.",
      section9: "9. Contact Us",
      section9Text: "If you have any questions regarding this Privacy Policy, you may contact us:",
      email: "Email",
      website: "Website",
      lastUpdated: "Last Updated"
    },
    hi: {
      title: "गोपनीयता नीति",
      welcome: "Sarkari Spark में आपका स्वागत है",
      welcomeText: "Sarkari Spark पर, हम आपकी गोपनीयता का मूल्य करते हैं और आपके साथ साझा की गई किसी भी जानकारी की सुरक्षा के लिए प्रतिबद्ध हैं। यह गोपनीयता नीति बताती है कि हम क्या जानकारी एकत्र करते हैं, हम इसका उपयोग कैसे करते हैं, और हम इसकी सुरक्षा कैसे करते हैं।",
      section1: "1. जानकारी जो हम एकत्र करते हैं",
      section1Text: "हम सीमित व्यक्तिगत जानकारी एकत्र कर सकते हैं जब आप:\n\n* फॉर्म या ईमेल के माध्यम से हमसे संपर्क करते हैं\n* न्यूज़लेटर या अपडेट की सदस्यता लेते हैं\n* पोस्ट पर टिप्पणी करते हैं या वेबसाइट के साथ बातचीत करते हैं\n\nएकत्रित की गई जानकारी में शामिल हो सकती है:\n\n* नाम\n* ईमेल पता\n* आईपी पता\n* वेबसाइट उपयोग डेटा\n\n",
      section2: "2. हम आपकी जानकारी का उपयोग कैसे करते हैं",
      section2Text: "हम एकत्रित जानकारी का उपयोग निम्नलिखित उद्देश्यों के लिए कर सकते हैं:\n\n* वेबसाइट प्रदर्शन और उपयोगकर्ता अनुभव में सुधार\n* उपयोगकर्ता पूछताछ और सहायता अनुरोधों का जवाब देना\n* अपडेट, न्यूज़लेटर, या महत्वपूर्ण अधिसूचनाएं भेजना\n* वेबसाइट ट्रैफिक और आगंतुक व्यवहार का विश्लेषण\n* स्पैम, दुरुपयोग, या अनधिकृत गतिविधि को रोकना",
      section3: "3. कुकीज़",
      section3Text: "Sarkari Spark उपयोगकर्ता अनुभव में सुधार करने और वेबसाइट ट्रैफिक का विश्लेषण करने के लिए कुकीज़ का उपयोग कर सकता है। कुकीज़ हमें आगंतुक प्राथमिकताओं को समझने और वेबसाइट सामग्री को अनुकूलित करने में मदद करते हैं।\n\nउपयोगकर्ता अपने ब्राउज़र सेटिंग्स के माध्यम से कुकीज़ को अक्षम करने का विकल्प चुन सकते हैं।",
      section4: "4. तीसरे पक्ष की सेवाएं",
      section4Text: "हम विश्लेषण उपकरणों और विज्ञापन भागीदारों जैसे तीसरे पक्ष की सेवाओं का उपयोग कर सकते हैं, जिसमें Google AdSense भी शामिल है, जो प्रासंगिक विज्ञापन प्रदर्शित करने के लिए कुकीज़ या समान तकनीकों का उपयोग कर सकते हैं।\n\nGoogle सहित तीसरे पक्ष के विक्रेता उपयोगकर्ताओं के इस वेबसाइट या अन्य वेबसाइटों पर पिछले दौरे के आधार पर विज्ञापन परोसने के लिए कुकीज़ का उपयोग कर सकते हैं।",
      section5: "5. तीसरे पक्ष के लिंक",
      section5Text: "हमारी वेबसाइट में बाहरी या आधिकारिक सरकारी वेबसाइटों के लिंक हो सकते हैं। हम तीसरे पक्ष की वेबसाइटों की गोपनीयता प्रथाओं या सामग्री के लिए जिम्मेदार नहीं हैं।",
      section6: "6. डेटा सुरक्षा",
      section6Text: "हम उपयोगकर्ता जानकारी की अनधिकृत पहुंच, दुरुपयोग, या प्रकटीकरण से बचाने में मदद करने के लिए उचित सुरक्षा उपाय लागू करते हैं। हालांकि, ऑनलाइन संचरण या भंडारण की कोई विधि पूरी तरह से सुरक्षित नहीं है।",
      section7: "7. आपकी सहमति",
      section7Text: "Sarkari Spark का उपयोग करके, आप इस गोपनीयता नीति से सहमति देते हैं।",
      section8: "8. इस गोपनीयता नीति में बदलाव",
      section8Text: "हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं। कोई भी बदलाव अद्यतन संशोधन तिथि के साथ इस पृष्ठ पर पोस्ट किए जाएंगे।",
      section9: "9. संपर्क करें",
      section9Text: "यदि आपके इस गोपनीयता नीति के बारे में कोई प्रश्न हैं, तो आप हमसे संपर्क कर सकते हैं:",
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
              <div className="text-gray-700 whitespace-pre-line">
                {t.section1Text}
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section2}
              </h2>
              <div className="text-gray-700 whitespace-pre-line">
                {t.section2Text}
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section3}
              </h2>
              <div className="text-gray-700 whitespace-pre-line">
                {t.section3Text}
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section4}
              </h2>
              <div className="text-gray-700 whitespace-pre-line">
                {t.section4Text}
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section5}
              </h2>
              <div className="text-gray-700 whitespace-pre-line">
                {t.section5Text}
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section6}
              </h2>
              <div className="text-gray-700 whitespace-pre-line">
                {t.section6Text}
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section7}
              </h2>
              <div className="text-gray-700 whitespace-pre-line">
                {t.section7Text}
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section8}
              </h2>
              <div className="text-gray-700 whitespace-pre-line">
                {t.section8Text}
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.section9}
              </h2>
              <p className="text-gray-700 mb-4">
                {t.section9Text}
              </p>
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
