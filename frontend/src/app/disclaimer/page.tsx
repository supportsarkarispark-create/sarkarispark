"use client"

import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useQuery } from "react-query"
import { settingsAPI } from "@/lib/api"

export default function DisclaimerPage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const { data: settingsData } = useQuery(["settings"], () => settingsAPI.getSettings())
  
  const contactInfo = settingsData?.data?.settings?.contactInfo || {
    email: "support@sarkarispark.com",
    phone: "+91 98765 43210",
    address: "New Delhi, India",
  }

  const content = {
    en: {
      title: "Disclaimer",
      welcome: "Welcome to Sarkari Spark",
      welcomeText: "The information provided on Sarkari Spark is for general informational purposes only. All information on the Site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability or completeness of any information on the Site.",
      risk: "Use at Your Own Risk",
      riskText: "Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the Site. Your use of the Site and your reliance on any information on the Site is solely at your own risk.",
      information: "Information Accuracy",
      informationText: "The information provided by Sarkari Spark on this website is for general informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.",
      external: "External Links",
      externalText: "Through this website you are able to link to other websites which are not under the control of Sarkari Spark. We have no control over the nature, content and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.",
      exam: "Exam Information",
      examText: "Sarkari Spark provides information about government jobs, exams, admit cards, and results. While we make every effort to ensure the accuracy of the information provided, we cannot guarantee that all information is 100% accurate, complete, or up-to-date. Users are advised to verify all information from official government sources before taking any action based on the information provided on this website.",
      professional: "Professional Advice",
      professionalText: "The information contained on this website is not intended as professional advice. Users should seek appropriate professional advice before making any decisions based on the information provided on this website.",
      changes: "Changes to Disclaimer",
      changesText: "Sarkari Spark reserves the right to modify this disclaimer at any time. Any changes will be posted on this page with an updated revision date.",
      lastUpdated: "Last Updated"
    },
    hi: {
      title: "अस्वीकरण",
      welcome: "सरकारी स्पार्क में आपका स्वागत है",
      welcomeText: "सरकारी स्पार्क पर प्रदान की गई जानकारी केवल सामान्य सूचना उद्देश्यों के लिए है। साइट पर सभी जानकारी अच्छे विश्वास के साथ प्रदान की जाती है, हालांकि हम साइट पर किसी भी जानकारी की सटीकता, पर्याप्तता, वैधता, विश्वसनीयता, उपलब्धता या पूर्णता के संबंध में किसी भी प्रकार का कोई प्रतिनिधित्व या वारंटी, व्यक्त या अप्रत्यक्ष, नहीं देते हैं।",
      risk: "अपने जोखिम पर उपयोग करें",
      riskText: "किसी भी परिस्थिति में साइट के उपयोग के परिणामस्वरूप होने वाले किसी भी प्रकार के नुकसान या क्षति के लिए हमारी आप पर कोई दायित्व नहीं होगी। साइट का आपका उपयोग और साइट पर किसी भी जानकारी पर आपका भरोसा पूरी तरह से आपके अपने जोखिम पर है।",
      information: "जानकारी की सटीकता",
      informationText: "सरकारी स्पार्क द्वारा इस वेबसाइट पर प्रदान की गई जानकारी केवल सामान्य सूचना उद्देश्यों के लिए है। जबकि हम जानकारी को अद्यतन और सही रखने का प्रयास करते हैं, हम वेबसाइट या वेबसाइट पर निहित जानकारी, उत्पादों, सेवाओं, या संबंधित ग्राफिक्स की पूर्णता, सटीकता, विश्वसनीयता, उपयुक्तता या उपलब्धता के संबंध में किसी भी प्रकार का कोई प्रतिनिधित्व या वारंटी, व्यक्त या अप्रत्यक्ष, नहीं देते हैं।",
      external: "बाहरी लिंक",
      externalText: "इस वेबसाइट के माध्यम से आप अन्य वेबसाइटों से लिंक कर सकते हैं जो सरकारी स्पार्क के नियंत्रण में नहीं हैं। हमारा उन साइटों की प्रकृति, सामग्री और उपलब्धता पर कोई नियंत्रण नहीं है। किसी भी लिंक की शामिलता आवश्यक रूप से किसी सिफारिश को नहीं दर्शाती है या उनमें व्यक्त विचारों का समर्थन नहीं करती है।",
      exam: "परीक्षा जानकारी",
      examText: "सरकारी स्पार्क सरकारी नौकरियों, परीक्षाओं, प्रवेश पत्रों और परिणामों के बारे में जानकारी प्रदान करता है। जबकि हम प्रदान की गई जानकारी की सटीकता सुनिश्चित करने के लिए हर संभव प्रयास करते हैं, हम गारंटी नहीं दे सकते कि सभी जानकारी 100% सटीक, पूर्ण या अद्यतन है। उपयोगकर्ताओं को सलाह दी जाती है कि इस वेबसाइट पर प्रदान की गई जानकारी के आधार पर कोई भी कार्रवाई करने से पहले सभी जानकारी की पुष्टि आधिकारिक सरकारी स्रोतों से करें।",
      professional: "पेशेवर सलाह",
      professionalText: "इस वेबसाइट पर निहित जानकारी पेशेवर सलाह के रूप में नहीं है। उपयोगकर्ताओं को इस वेबसाइट पर प्रदान की गई जानकारी के आधार पर कोई भी निर्णय लेने से पहले उचित पेशेवर सलाह लेनी चाहिए।",
      changes: "अस्वीकरण में बदलाव",
      changesText: "सरकारी स्पार्क किसी भी समय इस अस्वीकरण को संशोधित करने का अधिकार सुरक्षित रखता है। कोई भी बदलाव अद्यतन संशोधन तिथि के साथ इस पृष्ठ पर पोस्ट किए जाएंगे।",
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

            {/* Use at Your Own Risk */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.risk}
              </h2>
              <p className="text-gray-700">
                {t.riskText}
              </p>
            </section>

            {/* Information Accuracy */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.information}
              </h2>
              <p className="text-gray-700">
                {t.informationText}
              </p>
            </section>

            {/* External Links */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.external}
              </h2>
              <p className="text-gray-700">
                {t.externalText}
              </p>
            </section>

            {/* Exam Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.exam}
              </h2>
              <p className="text-gray-700">
                {t.examText}
              </p>
            </section>

            {/* Professional Advice */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.professional}
              </h2>
              <p className="text-gray-700">
                {t.professionalText}
              </p>
            </section>

            {/* Changes to Disclaimer */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {t.changes}
              </h2>
              <p className="text-gray-700">
                {t.changesText}
              </p>
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
