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
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(false);
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
      const wa = profile.whatsappNumber || profile.phone || '';
      setWhatsappNumber(wa);
      if (profile.phone && profile.whatsappNumber && profile.phone.trim() === profile.whatsappNumber.trim()) {
        setWhatsappSameAsPhone(true);
      } else if (profile.phone && !profile.whatsappNumber) {
        setWhatsappSameAsPhone(true);
      }
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setState(profile.state || '');
      setPincode(profile.pincode || '');
    } else if (user) {
      setName(user.displayName || '');
    }
  }, [profile, user]);

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (whatsappSameAsPhone) {
      setWhatsappNumber(val);
    }
  };

  const handleWhatsappSameToggle = (checked: boolean) => {
    setWhatsappSameAsPhone(checked);
    if (checked) {
      setWhatsappNumber(phone);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const cleanPhone = phone.trim();
    const cleanWhatsapp = (whatsappSameAsPhone ? phone : whatsappNumber).trim();

    if (cleanPhone && !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number starting with 6-9 (e.g. 9876543210).');
      setSaving(false);
      return;
    }

    if (cleanWhatsapp && !/^[6-9]\d{9}$/.test(cleanWhatsapp)) {
      setErrorMsg('Please enter a valid 10-digit Indian WhatsApp number starting with 6-9 (e.g. 9876543210).');
      setSaving(false);
      return;
    }

    try {
      await updateCustomerProfileApi(token, {
        name: name.trim(),
        phone: cleanPhone,
        whatsappNumber: cleanWhatsapp,
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
    <div className="min-h-screen bg-[#FCF9F5] py-10 md:py-16 relative overflow-hidden">
      <div className="absolute top-0 right-10 w-96 h-96 rounded-full bg-[#FCE7EC]/35 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#FAF5EB]/50 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-8 md:mb-10 pb-6 border-b border-[#E8DCCF]/60 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A223B] font-semibold block mb-1">
              Client Account
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-normal text-[#2A1C19]">
              Account <span className="font-serif italic text-rose-gold-gradient">Settings</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#A8928D]">
            <ShieldCheck className="w-4 h-4 text-[#C9A86A]" />
            <span>Verified Customer Profile</span>
          </div>
        </div>

        {/* Profile Card & Form */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-6 sm:p-10 shadow-xs space-y-6">
          
          {/* Top User Info Bar */}
          <div className="p-4 rounded-xl sm:rounded-2xl bg-[#FAF6F0]/80 border border-[#E8DCCF] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7A223B] text-[#FFF6FA] flex items-center justify-center font-serif text-lg font-bold">
                {name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div>
                <span className="text-sm font-semibold text-[#2A1C19] block">
                  {name || user?.displayName || 'Client'}
                </span>
                <span className="text-xs text-[#A8928D]">{user?.email}</span>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-wider bg-[#FDF2F5] text-[#7A223B] border border-[#FCE7EC] px-2.5 py-1 rounded-full font-semibold">
              Authenticated
            </span>
          </div>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <h2 className="font-heading text-lg font-normal text-[#2A1C19] pb-2 border-b border-[#FAF6F0]">
              Personal &amp; Default Shipping Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="settingsFullName" className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540] mb-1.5">
                  Full Name
                </label>
                <input
                  id="settingsFullName"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Radhika Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B]"
                />
              </div>

              <div>
                <label htmlFor="settingsPhone" className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540] mb-1.5">
                  Mobile Number
                </label>
                <input
                  id="settingsPhone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="10 digit mobile"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B]"
                />
              </div>

              <div>
                <label htmlFor="settingsWhatsapp" className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540] mb-1.5">
                  WhatsApp Number
                </label>
                <input
                  id="settingsWhatsapp"
                  name="whatsappNumber"
                  type="tel"
                  autoComplete="tel"
                  readOnly={whatsappSameAsPhone}
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="10 digit WhatsApp number"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                    whatsappSameAsPhone
                      ? 'bg-[#FAF6F0]/40 border-[#E8DCCF] text-[#7D6460] cursor-not-allowed'
                      : 'bg-[#FAF6F0]/70 border-[#E8DCCF] text-[#2A1C19] focus:border-[#7A223B]'
                  }`}
                />
              </div>

              <div className="sm:col-span-2 -mt-1.5 mb-1">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-[#5C4540] hover:text-[#2A1C19]">
                  <input
                    type="checkbox"
                    checked={whatsappSameAsPhone}
                    onChange={(e) => handleWhatsappSameToggle(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E8DCCF] text-[#7A223B] focus:ring-[#7A223B]/30"
                  />
                  <span>WhatsApp number same as mobile number</span>
                </label>
              </div>

              <div>
                <label htmlFor="settingsEmail" className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540] mb-1.5">
                  Email Address
                </label>
                <input
                  id="settingsEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#E8DCCF]/30 border border-[#E8DCCF] text-xs sm:text-sm text-[#A8928D] cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="settingsAddress" className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540] mb-1.5">
                  Default Delivery Address
                </label>
                <textarea
                  id="settingsAddress"
                  name="address"
                  autoComplete="street-address"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Apartment, Street address, Landmark…"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B]"
                />
              </div>

              <div>
                <label htmlFor="settingsCity" className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540] mb-1.5">
                  City
                </label>
                <input
                  id="settingsCity"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Coimbatore"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B]"
                />
              </div>

              <div>
                <label htmlFor="settingsState" className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540] mb-1.5">
                  State
                </label>
                <input
                  id="settingsState"
                  name="state"
                  type="text"
                  autoComplete="address-level1"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Tamil Nadu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B]"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="settingsPincode" className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540] mb-1.5">
                  Postal Pincode
                </label>
                <input
                  id="settingsPincode"
                  name="pincode"
                  type="text"
                  autoComplete="postal-code"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="6 digit PIN (e.g. 641001)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B]"
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-rose-primary px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-[0.16em] shadow-xs flex items-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#DFC598]" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={logout}
                className="text-xs text-rose-700 hover:text-rose-900 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
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

export default Settings;
