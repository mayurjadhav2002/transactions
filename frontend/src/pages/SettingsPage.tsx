import { User, Shield, Bell, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const SettingsPage = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your account profile, preferences, and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600">
            <User className="size-4" /> Profile & Account
          </button>
          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100">
            <Shield className="size-4" /> Security & 2FA
          </button>
          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100">
            <Bell className="size-4" /> Notifications
          </button>
          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100">
            <DollarSign className="size-4" /> Currency (INR - ₹)
          </button>
        </div>

        <div className="md:col-span-2 space-y-4">
          <Card className="p-5">
            <h3 className="font-bold text-sm text-slate-900 mb-4">
              Profile Information
            </h3>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex size-14 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-lg shadow-sm">
                M
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900">Mayur</h4>
                <p className="text-xs text-slate-400">mayur@confluencr.com</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Account
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <Input defaultValue="Mayur" className="text-xs" />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <Input defaultValue="mayur@confluencr.com" type="email" className="text-xs" />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Base Currency
                </label>
                <Input defaultValue="INR (₹) - Indian Rupee" readOnly className="text-xs bg-slate-50 cursor-not-allowed" />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium text-xs shadow-xs transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
