"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store/AppContext";
import type { BusinessType, BusinessProfile } from "@/lib/types";
import { Coffee, Store, Truck, ShoppingBag, Cookie, Layers } from "lucide-react";

interface BizTypeOption {
  type: BusinessType;
  label: string;
  icon: ReactNode;
  desc: string;
}

const BIZ_TYPES: BizTypeOption[] = [
  { type: "cafe",       label: "Cafe",       icon: <Coffee     size={26} />, desc: "Coffee shop, tea house" },
  { type: "restaurant", label: "Restaurant", icon: <Store      size={26} />, desc: "Dhaba, dining, QSR" },
  { type: "food_truck", label: "Food Truck", icon: <Truck      size={26} />, desc: "Street food, mobile" },
  { type: "kiosk",      label: "Kiosk",      icon: <ShoppingBag size={26} />, desc: "Quick service, canteen" },
  { type: "bakery",     label: "Bakery",     icon: <Cookie     size={26} />, desc: "Bakery, sweet shop" },
  { type: "franchise",  label: "Franchise",  icon: <Layers     size={26} />, desc: "Chain outlet" },
];

const GST_RATES = [0, 5, 12, 18];

export default function OnboardingPage() {
  const router = useRouter();
  const { saveBusiness, showToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bizType, setBizType] = useState<BusinessType | null>(null);
  const [form, setForm] = useState({ name: "", ownerName: "", phone: "", city: "" });
  const [gst, setGst] = useState(5);
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    if (!bizType || !form.name) return;
    setSaving(true);
    const profile: BusinessProfile = {
      businessType: bizType,
      name: form.name.trim(),
      ownerName: form.ownerName.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      gstPercent: gst,
      currencySymbol: "₹",
      createdAt: new Date().toISOString(),
    };
    await saveBusiness(profile);
    showToast(`Welcome! ${profile.name} is ready 🎉`);
    router.replace("/pos");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-primary-500 pt-14 pb-8 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-2xl font-black">B</span>
        </div>
        <h1 className="text-2xl font-black text-white">BillMate</h1>
        <p className="text-primary-100 text-sm mt-1">Smart billing for Indian F&amp;B</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 justify-center py-5">
        {([1, 2, 3] as const).map((s) => (
          <div
            key={s}
            className={`rounded-full h-1.5 transition-all duration-300 ${
              s === step ? "w-8 bg-primary-500" : s < step ? "w-5 bg-primary-300" : "w-5 bg-gray-200"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 overflow-auto px-5 pb-8">
        {/* Step 1: Business type */}
        {step === 1 && (
          <div className="fade-in">
            <h2 className="text-xl font-black text-center text-gray-900 mb-1">What kind of business?</h2>
            <p className="text-gray-400 text-sm text-center mb-6">We&apos;ll set up the right menu template</p>
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              {BIZ_TYPES.map(({ type, label, icon, desc }) => (
                <button
                  key={type}
                  onClick={() => setBizType(type)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all press ${
                    bizType === type
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`mb-2 ${bizType === type ? "text-primary-500" : "text-gray-400"}`}>
                    {icon}
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
            <div className="max-w-sm mx-auto mt-6">
              <button
                disabled={!bizType}
                onClick={() => setStep(2)}
                className="w-full h-12 rounded-2xl bg-primary-500 text-white font-bold disabled:opacity-40 press shadow-md"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Business details */}
        {step === 2 && (
          <div className="fade-in max-w-sm mx-auto">
            <h2 className="text-xl font-black text-center text-gray-900 mb-1">Business details</h2>
            <p className="text-gray-400 text-sm text-center mb-6">Appears on your bills</p>
            <div className="space-y-3">
              {[
                { key: "name",      label: "Business Name *", placeholder: "e.g. Sharma Cafe", type: "text" },
                { key: "ownerName", label: "Owner Name",       placeholder: "Your name",        type: "text" },
                { key: "phone",     label: "Phone Number",     placeholder: "9876543210",       type: "tel"  },
                { key: "city",      label: "City",             placeholder: "Delhi",            type: "text" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">{label}</label>
                  <input
                    type={type}
                    className="bm-input"
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="h-12 px-5 rounded-2xl border-2 border-gray-200 font-semibold text-gray-700 press"
              >
                ← Back
              </button>
              <button
                disabled={!form.name.trim()}
                onClick={() => setStep(3)}
                className="flex-1 h-12 rounded-2xl bg-primary-500 text-white font-bold disabled:opacity-40 press shadow-md"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: GST */}
        {step === 3 && (
          <div className="fade-in max-w-sm mx-auto">
            <h2 className="text-xl font-black text-center text-gray-900 mb-1">GST Settings</h2>
            <p className="text-gray-400 text-sm text-center mb-6">You can change this in Settings anytime</p>

            <div className="bg-gray-50 rounded-2xl p-4 mb-5">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Summary</p>
              <p className="font-black text-gray-900">{form.name}</p>
              <p className="text-sm text-gray-500">
                {BIZ_TYPES.find((b) => b.type === bizType)?.label}
                {form.city ? ` · ${form.city}` : ""}
              </p>
            </div>

            <p className="text-sm font-bold text-gray-700 mb-2">GST Rate</p>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {GST_RATES.map((rate) => (
                <button
                  key={rate}
                  onClick={() => setGst(rate)}
                  className={`h-12 rounded-xl border-2 font-bold transition-all press ${
                    gst === rate
                      ? "border-primary-500 bg-primary-50 text-primary-600"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mb-6">
              {gst === 0 ? "No GST on bills" : gst === 5 ? "Standard restaurant GST" : `${gst}% GST on bills`}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="h-12 px-5 rounded-2xl border-2 border-gray-200 font-semibold text-gray-700 press"
              >
                ← Back
              </button>
              <button
                disabled={saving}
                onClick={handleFinish}
                className="flex-1 h-12 rounded-2xl bg-primary-500 text-white font-bold disabled:opacity-40 press shadow-md"
              >
                {saving ? "Setting up…" : "Start Billing 🚀"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
