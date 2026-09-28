// src/pages/Privacy.tsx
import React from 'react';
import { ShieldCheck, Lock, Mail, FileText, CheckCircle2, UserCheck, AlertCircle, Phone } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FCF9F5] py-12 md:py-20 text-[#2A1C19]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#7A223B] font-semibold block mb-2">
            Client Protection &amp; Data Transparency
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#2A1C19]">
            Privacy &amp; <span className="font-serif italic text-rose-gold-gradient">Data Policy</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7D6460] font-light mt-3 max-w-xl mx-auto leading-relaxed">
            How Sunbloom Adorn collects, safeguards, and respects your personal information and Google user data.
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1 rounded-full bg-[#FAF5EB] border border-[#DFC598]/60 text-[11px] text-[#8C6D38] font-medium">
            <span>Effective Date: September 2026</span>
            <span>•</span>
            <span>Last Updated: September 28, 2026</span>
          </div>
        </div>

        {/* Policy Body */}
        <div className="bg-white rounded-3xl border border-[#E8DCCF] p-6 sm:p-10 md:p-12 shadow-xs space-y-10 text-xs sm:text-sm text-[#5E4742] leading-relaxed">
          
          {/* Section 1: Overview */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#7A223B]">
              <ShieldCheck className="w-5 h-5 text-[#DFC598] shrink-0" />
              <h2 className="font-heading text-lg sm:text-xl font-medium text-[#2A1C19]">
                1. Overview &amp; Our Commitment
              </h2>
            </div>
            <p>
              Sunbloom Adorn (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates the online fine jewellery atelier located at{' '}
              <a href="https://sunbloomadorn.com/" className="text-[#7A223B] font-medium underline hover:text-[#5E152A]">
                https://sunbloomadorn.com/
              </a>{' '}
              and associated digital services. We craft handcrafted, anti-tarnish fine jewellery rooted in Korean minimalist elegance.
            </p>
            <p>
              We believe in complete transparency regarding how client data is handled. This Privacy Policy outlines what information we collect when you visit our website, register an account, authenticate via Google Sign-In, place orders, or converse with our concierge team, and how that information is safeguarded.
            </p>
          </section>

          {/* Section 2: Data We Collect */}
          <section className="space-y-4 pt-6 border-t border-[#F2E8DE]">
            <div className="flex items-center gap-2.5 text-[#7A223B]">
              <UserCheck className="w-5 h-5 text-[#DFC598] shrink-0" />
              <h2 className="font-heading text-lg sm:text-xl font-medium text-[#2A1C19]">
                2. Information We Collect
              </h2>
            </div>
            <p>
              We collect only the information strictly necessary to provide seamless shopping, order fulfillment, customer concierge assistance, and account security.
            </p>

            <div className="space-y-3 pl-2 sm:pl-4">
              <div className="p-4 rounded-2xl bg-[#FCF9F5] border border-[#E8DCCF] space-y-2">
                <h3 className="font-semibold text-[#2A1C19] text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7A223B]"></span>
                  A. Google Account Information (Google Sign-In)
                </h3>
                <p>
                  When you sign in using <strong>Continue with Google</strong>, Google&rsquo;s OAuth 2.0 service securely provides us with basic profile details through Firebase Authentication:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#6B534E] pl-2">
                  <li><strong>Full Name:</strong> To personalize your client dashboard, order receipts, and communications.</li>
                  <li><strong>Email Address:</strong> To verify your account, send purchase receipts, delivery dispatch notices, and tracking links.</li>
                  <li><strong>Profile Picture URL:</strong> If provided by your Google account, displayed optionally in your client navigation header.</li>
                  <li><strong>Google User ID (UID):</strong> A unique cryptographic identifier used strictly to authenticate and associate your Sunbloom Adorn order history.</li>
                </ul>
                <p className="text-[11px] text-[#8C6D38] italic">
                  Note: We do not request, access, or store your Google contacts, Google Drive files, calendar events, search history, or any personal data outside of your public profile and verified email.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FCF9F5] border border-[#E8DCCF] space-y-2">
                <h3 className="font-semibold text-[#2A1C19] text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7A223B]"></span>
                  B. Customer Account &amp; Contact Details
                </h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#6B534E] pl-2">
                  <li><strong>Mobile Phone Number:</strong> Required for consignment dispatch and courier delivery verification across India.</li>
                  <li><strong>WhatsApp Number:</strong> Collected on an opt-in basis for real-time shipment tracking alerts and concierge styling assistance.</li>
                  <li><strong>Email Address &amp; Password:</strong> If you choose direct email/password registration rather than Google Sign-In. Passwords are salted and hashed through Firebase Authentication; we never store or see plain text passwords.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#FCF9F5] border border-[#E8DCCF] space-y-2">
                <h3 className="font-semibold text-[#2A1C19] text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7A223B]"></span>
                  C. Shipping &amp; Consignment Addresses
                </h3>
                <p className="text-xs text-[#6B534E]">
                  Recipient full name, street delivery address, apartment/suite, city, state, postal pincode, and special delivery instructions required to route parcels via insured domestic couriers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FCF9F5] border border-[#E8DCCF] space-y-2">
                <h3 className="font-semibold text-[#2A1C19] text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7A223B]"></span>
                  D. Orders &amp; Purchase History
                </h3>
                <p className="text-xs text-[#6B534E]">
                  Records of pieces ordered, metal finish and variant selections, order reference numbers, dates, payment status, transaction amounts, shipping carrier names, and consignment tracking identifiers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FCF9F5] border border-[#E8DCCF] space-y-2">
                <h3 className="font-semibold text-[#2A1C19] text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7A223B]"></span>
                  E. Client Concierge &amp; Support Messages
                </h3>
                <p className="text-xs text-[#6B534E]">
                  Inquiries, support tickets, size consultation requests, and messages submitted through our Customer Support Portal (<a href="https://sunbloomadorn.com/support" className="text-[#7A223B] underline font-medium">https://sunbloomadorn.com/support</a>) or direct communications with our atelier team.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Financial & Payment Security */}
          <section className="space-y-3 pt-6 border-t border-[#F2E8DE]">
            <div className="flex items-center gap-2.5 text-[#7A223B]">
              <Lock className="w-5 h-5 text-[#DFC598] shrink-0" />
              <h2 className="font-heading text-lg sm:text-xl font-medium text-[#2A1C19]">
                3. Payment Processing &amp; Financial Security
              </h2>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FDF2F5] border border-[#FCE7EC] space-y-2">
              <h3 className="font-semibold text-[#7A223B] text-xs sm:text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7A223B]" />
                We Never Store Card Credentials or Banking Passwords
              </h3>
              <p className="text-xs text-[#5C4540]">
                All online monetary transactions on Sunbloom Adorn are processed through <strong>PayU Payments Private Limited</strong>, an RBI-authorized payment aggregator adhering to stringent PCI-DSS (Payment Card Industry Data Security Standard) Level 1 certification.
              </p>
              <p className="text-xs text-[#5C4540]">
                When you proceed to checkout, you are redirected to PayU&rsquo;s encrypted gateway or complete your payment via secure UPI/Net Banking. <strong>Sunbloom Adorn never receives, processes, or stores your credit/debit card numbers, CVVs, expiry dates, net banking credentials, or UPI MPINs on our servers.</strong> We receive only a cryptographically signed transaction token confirming whether the payment succeeded.
              </p>
            </div>
          </section>

          {/* Section 4: Purposes of Processing */}
          <section className="space-y-3 pt-6 border-t border-[#F2E8DE]">
            <div className="flex items-center gap-2.5 text-[#7A223B]">
              <FileText className="w-5 h-5 text-[#DFC598] shrink-0" />
              <h2 className="font-heading text-lg sm:text-xl font-medium text-[#2A1C19]">
                4. How We Use Your Information
              </h2>
            </div>
            <p>We process your personal information strictly for legitimate commercial and customer care purposes:</p>
            <ul className="space-y-2 text-xs sm:text-sm text-[#5E4742] pl-2 sm:pl-4">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#DFC598] mt-0.5 shrink-0" />
                <span><strong>Order Fulfillment:</strong> To prepare, package, and dispatch your jewellery creations to your specified delivery address.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#DFC598] mt-0.5 shrink-0" />
                <span><strong>Account Authentication:</strong> To authenticate your identity securely through Google Sign-In or email credentials and maintain your client order history.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#DFC598] mt-0.5 shrink-0" />
                <span><strong>Transactional Notifications:</strong> To transmit order confirmations, tax invoices, courier tracking links, and delivery updates via email and WhatsApp.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#DFC598] mt-0.5 shrink-0" />
                <span><strong>Client Concierge &amp; Support:</strong> To resolve questions, process size exchanges, manage warranty/replacement requests, and assist with personalized styling queries.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#DFC598] mt-0.5 shrink-0" />
                <span><strong>Fraud Prevention &amp; Security:</strong> To protect our website, payment integrity, and patrons against automated bots, abuse, and fraudulent transactions.</span>
              </li>
            </ul>
          </section>

          {/* Section 5: Google User Data Limited Use Disclosure */}
          <section className="space-y-3 pt-6 border-t border-[#F2E8DE]">
            <div className="flex items-center gap-2.5 text-[#7A223B]">
              <ShieldCheck className="w-5 h-5 text-[#DFC598] shrink-0" />
              <h2 className="font-heading text-lg sm:text-xl font-medium text-[#2A1C19]">
                5. Google API Services User Data Policy Compliance
              </h2>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF5EB] border border-[#DFC598]/60 space-y-3">
              <p className="text-xs sm:text-sm text-[#3E2F1B] font-medium leading-relaxed">
                Sunbloom Adorn&rsquo;s use and transfer of information received from Google APIs to any other app will adhere to the{' '}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7A223B] underline font-semibold hover:text-[#5E152A]"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-[#5C4524] pl-2">
                <li>We use Google user data solely to authenticate your identity and facilitate your customer account on Sunbloom Adorn.</li>
                <li>We <strong>do not sell, rent, or trade</strong> Google user data to third-party data brokers, marketers, or advertisers.</li>
                <li>We <strong>do not use</strong> Google user data to serve personalized or retargeted advertisements.</li>
                <li>We <strong>do not use</strong> Google user data to build, train, or improve generalized artificial intelligence (AI) or machine learning models.</li>
                <li>Humans are not permitted to read your data unless you have given explicit consent for a specific support ticket, it is necessary for security investigations, or it is required to comply with applicable law.</li>
              </ul>
            </div>
          </section>

          {/* Section 6: Third-Party Service Providers */}
          <section className="space-y-3 pt-6 border-t border-[#F2E8DE]">
            <div className="flex items-center gap-2.5 text-[#7A223B]">
              <FileText className="w-5 h-5 text-[#DFC598] shrink-0" />
              <h2 className="font-heading text-lg sm:text-xl font-medium text-[#2A1C19]">
                6. Service Providers &amp; Data Sharing
              </h2>
            </div>
            <p>
              We share your information solely with trusted infrastructure and service providers essential to fulfilling our ecommerce services:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-[#5E4742] pl-2 sm:pl-4">
              <li><strong>Firebase by Google LLC:</strong> Authentication provider and secure identity verification infrastructure.</li>
              <li><strong>PayU Payments Private Limited:</strong> RBI-licensed payment gateway partner handling secure payment settlement.</li>
              <li><strong>Cloudflare, Inc.:</strong> CDN, DDoS mitigation, and SSL/TLS edge certificate provider ensuring safe website browsing.</li>
              <li><strong>Aiven Cloud:</strong> Encrypted PostgreSQL database hosting provider storing product catalog and client order history.</li>
              <li><strong>Logistics &amp; Courier Partners:</strong> Insured domestic courier partners (such as Delhivery, Blue Dart, or India Post) receiving recipient name, delivery address, and phone number exclusively for parcel transportation.</li>
            </ul>
            <p className="text-xs text-[#7D6460]">
              We do not permit any third-party service provider to use your personal information for their own marketing or secondary purposes.
            </p>
          </section>

          {/* Section 7: Cookies & Storage */}
          <section className="space-y-3 pt-6 border-t border-[#F2E8DE]">
            <div className="flex items-center gap-2.5 text-[#7A223B]">
              <Lock className="w-5 h-5 text-[#DFC598] shrink-0" />
              <h2 className="font-heading text-lg sm:text-xl font-medium text-[#2A1C19]">
                7. Cookies, Local Storage &amp; Session Data
              </h2>
            </div>
            <p>
              We do not use invasive third-party marketing trackers or ad-network surveillance cookies. We use only essential client-side storage technologies:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#5E4742] pl-2 sm:pl-4">
              <li><strong>Browser LocalStorage (<code className="bg-[#FAF5EB] px-1.5 py-0.5 rounded text-[#7A223B]">cart</code>):</strong> Stores your active cart selections so your bag remains intact if you navigate between pages or refresh the browser.</li>
              <li><strong>Firebase Authentication State:</strong> Managed via Firebase Authentication&rsquo;s default browser persistence mechanism (using browser-managed credentials storage such as IndexedDB) to securely maintain your authenticated session without storing plaintext passwords.</li>
              <li><strong>Cloudflare Essential Cookies:</strong> Standard security cookies (such as <code className="bg-[#FAF5EB] px-1.5 py-0.5 rounded text-[#7A223B]">__cf_bm</code>) deployed automatically to detect malicious bot traffic and protect user sessions.</li>
            </ul>
          </section>

          {/* Section 8: Data Security & Retention */}
          <section className="space-y-3 pt-6 border-t border-[#F2E8DE]">
            <div className="flex items-center gap-2.5 text-[#7A223B]">
              <ShieldCheck className="w-5 h-5 text-[#DFC598] shrink-0" />
              <h2 className="font-heading text-lg sm:text-xl font-medium text-[#2A1C19]">
                8. Data Security &amp; Retention
              </h2>
            </div>
            <p>
              We implement industry-standard physical, electronic, and procedural safeguards. All web traffic between your device and Sunbloom Adorn is encrypted via <strong>Transport Layer Security (TLS 1.3 / HTTPS)</strong>. Database records are encrypted at rest and accessible only to authorized personnel via secure access controls.
            </p>
            <p>
              <strong>Data Retention Periods:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#5E4742] pl-2 sm:pl-4">
              <li><strong>Active Accounts:</strong> Maintained as long as your account remains open or until you request deletion.</li>
              <li><strong>Order, Tax &amp; Financial Records:</strong> Order, tax, and financial records may be retained for the periods required by applicable Indian tax, accounting, and legal obligations.</li>
              <li><strong>Support Communications:</strong> Retained for up to 2 years to ensure quality concierge continuity and warranty verification.</li>
            </ul>
          </section>

          {/* Section 9: Data Deletion & User Rights */}
          <section className="space-y-4 pt-6 border-t border-[#F2E8DE]">
            <div className="flex items-center gap-2.5 text-[#7A223B]">
              <AlertCircle className="w-5 h-5 text-[#DFC598] shrink-0" />
              <h2 className="font-heading text-lg sm:text-xl font-medium text-[#2A1C19]">
                9. Your Rights &amp; Data Deletion Request Process
              </h2>
            </div>
            <p>
              You retain full control over your personal data. Depending on your jurisdiction, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#5E4742] pl-2 sm:pl-4">
              <li>Access and receive a copy of the personal information we hold about you.</li>
              <li>Update or correct inaccurate profile details at any time in your <a href="https://sunbloomadorn.com/settings" className="text-[#7A223B] underline font-medium">Account Settings (https://sunbloomadorn.com/settings)</a>.</li>
              <li>Request permanent deletion of your account and associated personal data.</li>
            </ul>

            <div className="p-5 rounded-2xl bg-[#FCF9F5] border border-[#E8DCCF] space-y-3">
              <h3 className="font-semibold text-[#2A1C19] text-xs sm:text-sm">
                How to Request Account &amp; Data Deletion:
              </h3>
              <p className="text-xs text-[#5E4742]">
                To request the complete deletion of your account, profile, and personal records, please submit your request through either of the following methods:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#5E4742] pl-2">
                <li>
                  <strong>By Email:</strong> Send an email from your registered account address to{' '}
                  <a href="mailto:support@sunbloomadorn.com" className="text-[#7A223B] font-semibold underline">
                    support@sunbloomadorn.com
                  </a>{' '}
                  with the subject line: <strong>&ldquo;Data Deletion Request&rdquo;</strong>. Please include your registered full name and phone number.
                </li>
                <li>
                  <strong>Via Concierge Portal:</strong> Submit an inquiry under the category &ldquo;Account Management / Data Request&rdquo; directly in the{' '}
                  <a href="https://sunbloomadorn.com/support" className="text-[#7A223B] underline font-semibold">
                    Support Center (https://sunbloomadorn.com/support)
                  </a>{' '}
                  while logged into your account.
                </li>
              </ol>
              <p className="text-[11px] text-[#7D6460]">
                <strong>Fulfillment Timeline:</strong> We will acknowledge your request within 48 hours and complete the irreversible anonymization or deletion of your profile within <strong>30 business days</strong>, except for order, tax, and financial records which may be retained for the periods required by applicable Indian tax, accounting, and legal obligations.
              </p>
            </div>
          </section>

          {/* Section 10: Atelier Contact Info */}
          <section className="space-y-4 pt-6 border-t border-[#F2E8DE]">
            <div className="flex items-center gap-2.5 text-[#7A223B]">
              <Mail className="w-5 h-5 text-[#DFC598] shrink-0" />
              <h2 className="font-heading text-lg sm:text-xl font-medium text-[#2A1C19]">
                10. Atelier Contact Information
              </h2>
            </div>
            <p>
              If you have any questions, feedback, or concerns regarding this Privacy Policy or our data protection practices, please contact our privacy compliance team:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-[#FCF9F5] border border-[#E8DCCF] space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-[#7A223B] font-semibold block">
                  Official Support &amp; Privacy Email
                </span>
                <a
                  href="mailto:support@sunbloomadorn.com"
                  className="text-xs sm:text-sm font-medium text-[#2A1C19] hover:text-[#7A223B] underline decoration-[#DFC598]"
                >
                  support@sunbloomadorn.com
                </a>
                <p className="text-[11px] text-[#7D6460] pt-1">Mon &ndash; Sat: 9:30 AM &ndash; 6:30 PM IST</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FCF9F5] border border-[#E8DCCF] space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-[#7A223B] font-semibold block">
                  Concierge Desk &amp; WhatsApp
                </span>
                <a
                  href="https://wa.me/919789325964"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-medium text-[#2A1C19] hover:text-[#7A223B] flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>+91 97893 25964</span>
                </a>
                <p className="text-[11px] text-[#7D6460] pt-1">Ateliers: Coonoor &amp; Coimbatore, Tamil Nadu, India</p>
              </div>
            </div>
          </section>

          {/* Section 11: Policy Updates */}
          <section className="pt-6 border-t border-[#F2E8DE] text-xs text-[#7D6460] space-y-2">
            <p>
              We may revise this Privacy Policy periodically to reflect enhancements in our atelier features, security measures, or changes in legal regulations. Material modifications will be highlighted on our homepage or notified directly to registered accounts.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#FAF5EB]">
              <a href="https://sunbloomadorn.com/" className="text-[#7A223B] font-medium hover:underline inline-flex items-center gap-1">
                <span>&larr; Return to Storefront (https://sunbloomadorn.com/)</span>
              </a>
              <div className="flex items-center gap-4 text-[11px]">
                <a href="https://sunbloomadorn.com/terms" className="text-[#7A223B] hover:underline">Terms &amp; Conditions</a>
                <span>•</span>
                <a href="https://sunbloomadorn.com/refund-policy" className="text-[#7A223B] hover:underline">Refund Policy</a>
                <span>•</span>
                <a href="https://sunbloomadorn.com/contact" className="text-[#7A223B] hover:underline">Contact Concierge</a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Privacy;
