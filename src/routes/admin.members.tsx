import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { fetchMembers, type Member } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserPlus, Mail, Phone, Calendar } from "lucide-react";

export const Route = createFileRoute("/admin/members")({
  component: AdminMembers,
});

function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadMembers() {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchMembers(token);
        setMembers(data);
      } catch (err) {
        console.error("Members load error:", err);
        setError("Failed to load members. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    loadMembers();
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.phone && m.phone.includes(searchTerm))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">Members</h2>
            <p className="text-sm text-slate-500">Manage your registered customers.</p>
          </div>
          <button 
             onClick={() => alert("Add User functionality coming soon!")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all shadow-blue-600/20 active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            Add Member
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 p-4 text-sm font-medium text-red-600 border border-red-500/20 shadow-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
             <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by name, email, or phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
             </div>
             <span className="text-sm font-medium text-slate-500 hidden sm:block">Total: {filteredMembers.length} users</span>
          </div>

          <div className="overflow-x-auto flex-1 h-[calc(100vh-280px)] min-h-[400px]">
            <table className="w-full text-sm text-left relative">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                   Array.from({length: 6}).map((_, i) => (
                    <tr key={i}>
                       <td colSpan={4} className="p-4"><Skeleton className="h-16 w-full rounded" /></td>
                    </tr>
                   ))
                ) : filteredMembers.length === 0 ? (
                   <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                         No members found matching your search.
                      </td>
                   </tr>
                ) : (
                  filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0">
                            <span className="text-slate-600 font-medium text-sm">{member.name.charAt(0).toUpperCase()}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{member.name}</span>
                            <span className="text-xs text-slate-500">ID: {member.id.substring(0, 8)}...</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-600">
                             <Mail className="h-3.5 w-3.5 text-slate-400" />
                             <span>{member.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                             <Phone className="h-3.5 w-3.5 text-slate-400" />
                             <span>{member.phone || "Not provided"}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2 text-slate-600">
                           <Calendar className="h-4 w-4 text-slate-400" />
                           <span>{member.joinedDate ? new Date(member.joinedDate).toLocaleDateString() : 'Unknown'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-blue-600 hover:text-blue-800 font-medium text-xs px-3 py-1.5 rounded-md bg-blue-50 transition-colors mr-2 opacity-0 group-hover:opacity-100">
                          Edit
                       </button>
                       <button className="text-red-600 hover:text-red-800 font-medium text-xs px-3 py-1.5 rounded-md bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                          Block
                       </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
