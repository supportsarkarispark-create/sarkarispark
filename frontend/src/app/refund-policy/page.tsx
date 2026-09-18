"use client"

import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useQuery } from "react-query"
import { settingsAPI } from "@/lib/api"

export default function RefundPolicyPage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const { data: settingsData } = useQuery(["settings"], () => settingsAPI.getSettings())
  
  const contactInfo = settingsData?.data?.settings?.contactInfo || {
    email: "support@sarkarispark.com",
    phone: "+91 98765 43210",
    address: "New Delhi, India",
  }

  const content = {
    en: {
      title: "Refund Policy",
      welcome: "Welcome to Sarkari Spark",
      welcomeText: "At Sarkari Spark, we strive to provide quality educational content, mock tests, and learning resources to our users. Please read our Refund Policy carefully before making any purchase on our website.",
      section1: "1. Digital Products & Services",
      section1Text: "Sarkari Spark primarily provides digital educational products and services, including mock tests, study materials, subscriptions, and other online resources.\n\nBecause these products are digitally delivered and accessible immediately after purchase, refunds may not be available once access has been granted.",
      section2: "2. Refund Eligibility",
      section2Text: "Refund requests may only be considered in the following situations:\n\n* Duplicate payment made by mistake\n* Technical issues preventing access to purchased services from our side\n* Incorrect transaction due to payment gateway error\n\nAll eligible refund requests must be submitted within 7 days of the original purchase date.",
      section3: "3. Non-Refundable Situations",
      section3Text: "Refunds will not be provided for:\n\n* Change of mind after purchase\n* Lack of usage of purchased services\n* Dissatisfaction due to personal expectations\n* User device, internet, or compatibility issues not caused by Sarkari Spark\n* Failure to read product details before purchase",
      section4: "4. Refund Process",
      section4Text: "To request a refund, users must contact our support team with relevant payment details and transaction information.\n\nApproved refunds may take 5–10 business days to process depending on the payment provider or banking institution.",
      section5: "5. Cancellation Policy",
      section5Text: "Sarkari Spark reserves the right to suspend or cancel access to services in cases of policy violations, misuse, fraudulent activity, or unauthorized use of the platform.",
      section6: "6. Changes to This Policy",
      section6Text: "We may update or modify this Refund Policy at any time without prior notice. Any changes will be posted on this page with the updated revision date.",
      section7: "7. Contact Us",
      section7Text: "If you have any questions regarding this Refund Policy, please contact us:",
      lastUpdated: "Last Updated: May 22, 2026",
    },
    hi: {
      title: "धनवापसी नीति",
      welcome: "Sarkari Spark में आपका स्वागत है",
      welcomeText: "Sarkari Spark में, हम अपने उपयोगकर्ताओं को गुणवत्तापूर्ण शैक्षिक सामग्री, मॉक टेस्ट और शिक्षा संसाधन प्रदान करने का प्रयास करते हैं। कृपया हमारी वेबसाइट पर कोई भी खरीदारी करने से पहले हमारी धनवापसी नीति को ध्यान से पढ़ें।",
      section1: "1. डिजिटल उत्पाद और सेवाएं",
      section1Text: "Sarkari Spark मुख्य रूप से डिजिटल शैक्षिक उत्पाद और सेवाएं प्रदान करता है, जिसमें मॉक टेस्ट, अध्ययन सामग्री, सदस्यता और अन्य ऑनलाइन संसाधन शामिल हैं।\n\nचूंकि ये उत्पाद डिजिटल रूप से वितरित किए जाते हैं और खरीदारी के तुरंत बाद सुलभ होते हैं, इसलिए एक बार पहुंच प्रदान करने के बाद धनवापसी उपलब्ध नहीं हो सकती है।",
      section2: "2. धनवापसी पात्रता",
      section2Text: "धनवापसी अनुरोध केवल निम्नलिखित स्थितियों में विचार किए जा सकते हैं:\n\n* गलती से दोहरी भुगतान\n* हमारी ओर से तकनीकी समस्याओं के कारण खरीदी गई सेवाओं तक पहुंच में बाधा\n* भुगतान गेटवे त्रुटि के कारण गलत लेनदेन\n\nसभी पात्र धनवापसी अनुरोध मूल खरीद तिथि से 7 दिनों के भीतर जमा किए जाने चाहिए।",
      section3: "3. गैर-धनवापसी स्थितियां",
      section3Text: "धनवापसी निम्नलिखित मामलों में नहीं दी जाएगी:\n\n* खरीदारी के बाद मन बदलना\n* खरीदी गई सेवाओं का उपयोग न करना\n* व्यक्तिगत अपेक्षाओं के कारण असंतोष\n* Sarkari Spark के कारण न होने वाले उपयोगकर्ता डिवाइस, इंटरनेट, या संगतता मुद्दे\n* खरीद से पहले उत्पाद विवरण न पढ़ना",
      section4: "4. धनवापसी प्रक्रिया",
      section4Text: "धनवापसी का अनुरोध करने के लिए, उपयोगकर्ताओं को प्रासंगिक भुगतान विवरण और लेनदेन जानकारी के साथ हमारी सहायता टीम से संपर्क करना होगा।\n\nअनुमोदित धनवापसी को संसाधित होने में भुगतान प्रदाता या बैंकिंग संस्थान के आधार पर 5-10 व्यावसायिक दिन लग सकते हैं।",
      section5: "5. रद्दीकरण नीति",
      section5Text: "Sarkari Spark नीति उल्लंघन, दुरुपयोग, धोखाधड़ी गतिविधि, या प्लेटफ़ॉर्म के अनधिकृत उपयोग के मामलों में सेवाओं तक पहुंच को निलंबित या रद्द करने का अधिकार सुरक्षित रखता है।",
      section6: "6. इस नीति में परिवर्तन",
      section6Text: "हम किसी भी समय पूर्व सूचना के बिना इस धनवापसी नीति को अपडेट या संशोधित कर सकते हैं। किसी भी परिवर्तन को अद्यतन संशोधन तिथि के साथ इस पृष्ठ पर पोस्ट किया जाएगा।",
      section7: "7. संपर्क करें",
      section7Text: "यदि आपके पास इस धनवापसी नीति के बारे में कोई प्रश्न है, तो कृपया हमसे संपर्क करें:",
      lastUpdated: "अंतिम अद्यतन: 22 मई, 2026",
    },
  }

  const currentContent = content[language]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{currentContent.title}</h1>
          <p className="text-xl text-muted-foreground mb-2">{currentContent.welcome}</p>
          <p className="text-muted-foreground">{currentContent.welcomeText}</p>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border p-1 bg-muted">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                language === 'en' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                language === 'hi' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 prose prose-slate max-w-none">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-bold mb-4">{currentContent.section1}</h2>
            <p className="text-muted-foreground whitespace-pre-line">{currentContent.section1Text}</p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-bold mb-4">{currentContent.section2}</h2>
            <p className="text-muted-foreground whitespace-pre-line">{currentContent.section2Text}</p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-bold mb-4">{currentContent.section3}</h2>
            <p className="text-muted-foreground whitespace-pre-line">{currentContent.section3Text}</p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-bold mb-4">{currentContent.section4}</h2>
            <p className="text-muted-foreground whitespace-pre-line">{currentContent.section4Text}</p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-bold mb-4">{currentContent.section5}</h2>
            <p className="text-muted-foreground whitespace-pre-line">{currentContent.section5Text}</p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-bold mb-4">{currentContent.section6}</h2>
            <p className="text-muted-foreground whitespace-pre-line">{currentContent.section6Text}</p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-bold mb-4">{currentContent.section7}</h2>
            <p className="text-muted-foreground mb-4">{currentContent.section7Text}</p>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Email: </span>
                <a href={`mailto:${contactInfo.email}`} className="text-primary hover:underline">
                  {contactInfo.email}
                </a>
              </div>
              <div>
                <span className="font-medium">Website: </span>
                <a href="https://www.sarkarispark.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  https://www.sarkarispark.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>{currentContent.lastUpdated}</p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
