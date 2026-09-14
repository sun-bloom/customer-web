// src/pages/Support.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { submitSupportQueryApi } from '../lib/api';
import { HelpCircle, Send, CheckCircle2, AlertCircle, Video } from 'lucide-react';

export const Support: React.FC = () => {
  const { user, profile, token } = useAuth();

  const [name, setName] = useState(profile?.name || user?.displayName || '');
  const [mobile, setMobile] = useState(profile?.phone || '');
  const [whatsapp, setWhatsapp] = useState(profile?.whatsappNumber || profile?.phone || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [queryType, setQueryType] = useState('Product Enquiry');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim() || !mobile.trim() || !email.trim() || !description.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      await submitSupportQueryApi(
        {
          name: name.trim(),
          mobile: mobile.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim(),
          queryType,
          description: description.trim(),
        },
        token
      );
      setSuccessMsg('Your concierge support enquiry has been received. Our team will contact you shortly.');
      setDescription('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to submit enquiry. Please try again or message us on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium block mb-2">
            Atelier Concierge
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-normal text-[#1C1612]">
            Customer <span className="font-serif italic text-[#C5A059]">Support</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7063] font-light mt-2">
            Have a question regarding custom sizing, care, or order dispatch? Our concierge is at your service.
          </p>
        </div>

        <div>
          
          {/* Support Form */}
          <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs max-w-2xl mx-auto">
            <h2 className="font-heading text-xl font-normal text-[#1C1612] mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#C5A059]" />
              <span>Submit Concierge Request</span>
            </h2>

            {successMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Radhika Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10 digit mobile"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="10 digit WhatsApp"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                  Query Classification
                </label>
                <select
                  value={queryType}
                  onChange={(e) => setQueryType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="Product Enquiry">Product Details &amp; Custom Sizing</option>
                  <option value="Order Tracking">Consignment Tracking &amp; Delivery</option>
                  <option value="Payment / Invoice">Payment &amp; Billing Query</option>
                  <option value="Replacement / Return">Replacement or Return Request</option>
                  <option value="General Concierge">General Atelier Enquiry</option>
                </select>
              </div>

              {/* Unboxing Video Policy Notice — shown only for Return / Replacement */}
              {queryType === 'Replacement / Return' && (
                <div
                  role="note"
                  aria-label="Unboxing video requirement for return or replacement"
                  className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex gap-3 items-start"
                >
                  <Video className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                      Unboxing Video Required for Return &amp; Replacement
                    </p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      A Return or Replacement request can be raised <strong>only</strong> when you have a clear, uninterrupted unboxing video of the parcel. Please record a continuous video while opening the package and keep it safely. If there is any issue with the product, this video is required to raise and support your Return or Replacement request.
                    </p>
                    <p className="text-[11px] text-amber-600 leading-relaxed">
                      Note: Selecting this query type does not automatically approve a return or replacement. The final decision remains subject to our store review and policy.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                  Message Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kindly explain your enquiry in detail…"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#1C1612] text-[#FEF3C7] text-xs font-semibold uppercase tracking-[0.2em] shadow-gold hover:bg-[#2A231D] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#D4AF37]" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
