import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Check, Mail, Bell, Shield, KeyRound, Store } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => setSaveStatus("saved"), 800);
    setTimeout(() => setSaveStatus("idle"), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">System Settings</h2>
            <p className="text-sm text-slate-500">Manage your store preferences and security.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saveStatus !== "idle"}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all active:scale-[0.98] min-w-[120px] justify-center"
          >
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? <><Check className="h-4 w-4" /> Saved</> : "Save Changes"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Navigation Sidebar inside Settings */}
          <div className="space-y-1">
             <button className="w-full flex items-center gap-3 px-4 py-3 bg-white text-blue-600 font-medium rounded-lg text-sm border-l-2 border-blue-600 shadow-sm">
                <Store className="h-4 w-4" /> General Store Settings
             </button>
             <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium rounded-lg text-sm transition-colors">
                <Bell className="h-4 w-4" /> Notifications
             </button>
             <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium rounded-lg text-sm transition-colors">
                <Shield className="h-4 w-4" /> Security
             </button>
          </div>

          {/* Form Content */}
          <div className="md:col-span-2 space-y-6">
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Store Identity</h3>
                
                <div className="space-y-4">
                   <div className="grid gap-2">
                     <label className="text-sm font-medium text-slate-700">Store Name</label>
                     <input type="text" defaultValue="Mallu Smart" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                   </div>
                   
                   <div className="grid gap-2">
                     <label className="text-sm font-medium text-slate-700">Contact Email</label>
                     <div className="relative">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                       <input type="email" defaultValue="admin@mallusmart.com" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                     </div>
                   </div>

                   <div className="grid gap-2">
                     <label className="text-sm font-medium text-slate-700">Currency</label>
                     <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                        <option value="INR">₹ (INR) - Indian Rupee</option>
                        <option value="USD">$ (USD) - US Dollar</option>
                     </select>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 text-red-600">Danger Zone</h3>
                
                <div className="space-y-4">
                   <p className="text-sm text-slate-600">These actions are destructive. Proceed with caution.</p>
                   <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100">
                      <KeyRound className="h-4 w-4" /> Reset Admin Password
                   </button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
