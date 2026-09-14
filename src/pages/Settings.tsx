// src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateCustomerProfileApi } from '../lib/api';
import { User, ShieldCheck, CheckCircle2, AlertCircle, Save, LogOut } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, profile, token, refreshProfile, logout } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || user?.displayName || '');
      setPhone(profile.phone || '');
      setWhatsappNumber(profile.whatsappNumber || profile.phone || '');
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setState(profile.state || '');
      setPincode(profile.pincode || '');
    } else if (user) {
      setName(user.displayName || '');
    }
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateCustomerProfileApi(token, {
        name: name.trim(),
        phone: phone.trim(),
        whatsappNumber: whatsappNumber.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      });
      await refreshProfile();
      setSuccessMsg('Your profile and delivery settings have been saved successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 md:mb-10 pb-6 border-b border-[#E8E1D5] flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium block mb-1">
              Client Account
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-normal text-[#1C1612]">
              Account <span className="font-serif italic text-[#C5A059]">Settings</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8A7E72]">
            <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
            <span>Verified Customer Profile</span>
          </div>
        </div>

        {/* Profile Card & Form */}
        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-10 shadow-xs space-y-6">
          
          {/* Top User Info Bar */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1C1612] text-[#FEF3C7] flex items-center justify-center font-serif text-lg font-bold">
                {name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div>
                <span className="text-sm font-semibold text-[#1C1612] block">
                  {name || user?.displayName || 'Client'}
                </span>
                <span className="text-xs text-[#8A7E72]">{user?.email}</span>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-semibold">
              Authenticated
            </span>
          </div>

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <h2 className="font-heading text-lg font-normal text-[#1C1612] pb-2 border-b border-[#F0EAE1]">
              Personal &amp; Default Shipping Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Radhika Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10 digit mobile"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="10 digit WhatsApp number"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#E8E1D5]/40 border border-[#E8E1D5] text-xs sm:text-sm text-[#8A7E72] cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                  Default Delivery Address
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Apartment, Street address, Landmark…"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Coimbatore"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Tamil Nadu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                  Postal Pincode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="6 digit PIN (e.g. 641001)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 rounded-2xl bg-[#1C1612] text-[#FEF3C7] text-xs font-semibold uppercase tracking-[0.2em] shadow-gold hover:bg-[#2A231D] transition-all flex items-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#D4AF37]" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={logout}
                className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Atelier</span>
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
