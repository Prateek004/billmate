"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/lib/store/AppContext";
import type { PaymentMethod } from "@/lib/types";
import { fmtRupee, toP, QUICK_CASH } from "@/lib/utils";
import { CheckCircle2, Banknote, Smartphone, CreditCard } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  totalPaise: number;
  subtotalPaise: number;
  discountPaise: number;
  gstPaise: number;
  gstPercent: number;
  discountType: "flat" | "percent";
  discountValue: number;
}

interface PayMethod {
  id: PaymentMethod;
  label: string;
  Icon: ({ size }: { size: number }) => React.ReactElement;
}

const PAY_METHODS: PayMethod[] = [
  { id: "cash", label: "Cash", Icon: Banknote   },
  { id: "upi",  label: "UPI",  Icon: Smartphone },
  { id: "card", label: "Card", Icon: CreditCard },
];

export default function CheckoutModal({
  open,
  onClose,
  totalPaise,
  subtotalPaise,
  discountPaise,
  gstPaise,
  gstPercent,
  discountType,
  discountValue,
}: Props) {
  const { placeOrder, showToast } = useApp();

  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [cashInput, setCashInput] = useState("");
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState<{ billNumber: string; changePaise: number } | null>(null);

  useEffect(() => {
    if (open) {
      setMethod("cash");
      setCashInput("");
      setPlacing(false);
      setSuccess(null);
    }
  }, [open]);

  const cashPaise = toP(Number(cashInput) || 0);
  const changePaise = Math.max(0, cashPaise - totalPaise);
  const cashShort = method === "cash" && cashPaise < totalPaise && cashInput !== "";
  const canConfirm = !placing && (method !== "cash" || cashPaise >= totalPaise);

  const handleConfirm = async () => {
    if (!canConfirm) {
      if (method === "cash") showToast("Cash received is less than total", "error");
      return;
    }
    setPlacing(true);
    try {
      const order = await placeOrder({
        paymentMethod: method,
        discountType,
        discountValue,
        cashReceivedPaise: method === "cash" ? cashPaise : undefined,
      });
      setSuccess({ billNumber: order.billNumber, changePaise: order.changePaise ?? 0 });
    } catch {
      showToast("Order failed. Try again.", "error");
      setPlacing(false);
    }
  };

  const handleDone = () => {
    setSuccess(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={success ? handleDone : onClose} title={success ? undefined : "Checkout"}>
      {success ? (
        <div className="flex flex-col items-center py-10 px-6 text-center fade-in">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
            <CheckCircle2 size={42} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Order Placed!</h2>
          <p className="text-gray-500 mb-1">
            Bill <span className="font-bold text-gray-800">#{success.billNumber}</span>
          </p>
          <p className="text-4xl font-black text-primary-500 my-4">{fmtRupee(totalPaise)}</p>
          {success.changePaise > 0 && (
            <div className="w-full bg-green-50 border border-green-200 rounded-2xl px-5 py-3 mb-6">
              <p className="text-green-800 font-bold text-lg">
                Return Change: {fmtRupee(success.changePaise)}
              </p>
            </div>
          )}
          <button
            onClick={handleDone}
            className="w-full h-12 bg-primary-500 text-white rounded-2xl font-bold press shadow-md"
          >
            New Order
          </button>
        </div>
      ) : (
        <div className="px-5 pb-6 space-y-4 pt-1">
          {/* Bill summary */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold">{fmtRupee(subtotalPaise)}</span>
            </div>
            {discountPaise > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span className="font-semibold">−{fmtRupee(discountPaise)}</span>
              </div>
            )}
            {gstPercent > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>GST ({gstPercent}%)</span>
                <span className="font-semibold">{fmtRupee(gstPaise)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200 mt-1">
              <span>Total</span>
              <span className="text-primary-500">{fmtRupee(totalPaise)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {PAY_METHODS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setMethod(id)}
                  className={`py-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all press ${
                    method === id
                      ? "border-primary-500 bg-primary-50 text-primary-600"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cash section */}
          {method === "cash" && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">Cash Received</p>
                <input
                  type="number"
                  className={`w-full h-14 px-4 rounded-2xl border-2 outline-none text-2xl font-black transition-colors ${
                    cashShort
                      ? "border-red-400 bg-red-50 text-red-600"
                      : "border-gray-200 focus:border-primary-500"
                  }`}
                  placeholder="0"
                  value={cashInput}
                  onChange={(e) => setCashInput(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {QUICK_CASH.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCashInput(String(amt))}
                    className={`px-3 py-1.5 rounded-xl border font-bold text-sm press transition-all ${
                      Number(cashInput) === amt
                        ? "border-primary-500 bg-primary-50 text-primary-600"
                        : "border-gray-200 text-gray-600 bg-white"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
                <button
                  onClick={() => setCashInput(String(totalPaise / 100))}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 font-bold text-sm text-gray-600 bg-white press"
                >
                  Exact
                </button>
              </div>
              {cashInput !== "" && (
                <div
                  className={`rounded-xl py-3 text-center font-bold text-sm ${
                    cashPaise >= totalPaise ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {cashPaise >= totalPaise
                    ? `Change: ${fmtRupee(changePaise)}`
                    : `Short by ${fmtRupee(totalPaise - cashPaise)}`}
                </div>
              )}
            </div>
          )}

          {method === "upi" && (
            <div className="bg-blue-50 rounded-2xl p-5 text-center">
              <p className="text-3xl mb-2">📱</p>
              <p className="font-bold text-blue-800">Show QR code to customer</p>
              <p className="text-sm text-blue-600 mt-1">Collect {fmtRupee(totalPaise)} via UPI</p>
            </div>
          )}

          {method === "card" && (
            <div className="bg-purple-50 rounded-2xl p-5 text-center">
              <p className="text-3xl mb-2">💳</p>
              <p className="font-bold text-purple-800">Swipe / Tap card on machine</p>
              <p className="text-sm text-purple-600 mt-1">Collect {fmtRupee(totalPaise)} via Card</p>
            </div>
          )}

          <button
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="w-full h-14 bg-primary-500 text-white rounded-2xl font-black text-lg disabled:opacity-40 press shadow-md transition-opacity"
          >
            {placing ? "Processing…" : `Confirm ${fmtRupee(totalPaise)}`}
          </button>
        </div>
      )}
    </Modal>
  );
}
