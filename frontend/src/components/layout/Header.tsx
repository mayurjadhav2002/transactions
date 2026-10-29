import { useState } from "react";
import { ChevronDown, Menu, ShieldCheck } from "lucide-react";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps) => {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden cursor-pointer"
        >
          <Menu className="size-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 rounded-full p-1 pl-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-white font-medium text-xs shadow-xs">
              M
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                Mayur
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Admin
              </span>
            </div>
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-lg z-50 text-xs">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 mb-2.5">
                <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-white font-semibold text-xs shadow-xs">
                  M
                </div>
                <div>
                  <div className="flex items-center gap-1 font-semibold text-slate-900">
                    <span>Mayur</span>
                    <ShieldCheck className="size-3.5 text-blue-600" />
                  </div>
                  <p className="text-[11px] text-slate-400">mayur@confluencr.com</p>
                </div>
              </div>

              <div className="space-y-1.5 py-1 text-slate-600 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Role</span>
                  <span className="font-semibold text-slate-800">System Admin</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Organization</span>
                  <span className="font-medium text-slate-800">Confluencr</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Status</span>
                  <span className="font-medium text-emerald-600">Active</span>
                </div>
              </div>

              <button
                onClick={() => setProfileOpen(false)}
                className="w-full mt-2 rounded-lg bg-slate-100 hover:bg-slate-200 py-1.5 text-center font-medium text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
