import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { fetchMembers, deleteMember } from "@/lib/api";
import { toast } from "sonner";
import { type Member } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserPlus, Mail, Phone, Calendar, Trash2, MapPin, Building2, UserX, Edit } from "lucide-react";
import { MemberModal } from "@/components/admin/MemberModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/members")({
  component: AdminMembers,
});

const DISTRICTS = [
    "All Districts", "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", 
    "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", 
    "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All Districts");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Partial<Member> | null>(null);

  // Delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadMembers() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMembers();
      setMembers(data);
    } catch (err: any) {
      console.error("Members load error:", err);
      setError(err.message || "Failed to load members. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  const handleAdd = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const confirmDelete = (id: string | number) => {
    setMemberToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      await deleteMember(Number(memberToDelete));
      toast.success("Member deleted successfully.");
      await loadMembers();
      setIsDeleteOpen(false);
    } catch (err: any) {
      console.error("Delete member error:", err);
      toast.error(err.message || "Failed to delete member.");
    } finally {
      setIsDeleting(false);
      setMemberToDelete(null);
    }
  };

    const filteredMembers = members.filter(m => {
      const matchesSearch = 
        (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (m.businessName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.phone && m.phone.includes(searchTerm));
      
      const matchesDistrict = districtFilter === "All Districts" || m.district === districtFilter;
      // Temporarily allowing all members to show to verify data persistence
      const isActive = true; // m.isActive !== false;
      
      return matchesSearch && matchesDistrict && isActive;
    });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">Members</h2>
            <p className="text-sm text-slate-500">Manage your verified sellers and artisans.</p>
          </div>
          <button 
            onClick={handleAdd}
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
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
             <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                    type="text" 
                    placeholder="Search by name, business or phone..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <div className="w-48">
                    <Select value={districtFilter} onValueChange={setDistrictFilter}>
                        <SelectTrigger className="bg-white border-slate-200">
                            <SelectValue placeholder="District Filter" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
             </div>
             <span className="text-sm font-medium text-slate-500 hidden sm:block whitespace-nowrap">Total: {filteredMembers.length} members</span>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[calc(100vh-280px)] min-h-[400px]">
            <table className="w-full text-sm text-left relative">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-slate-900">Member</th>
                  <th className="px-6 py-4 text-slate-900">Contact & Business</th>
                  <th className="px-6 py-4 text-slate-900">Location</th>
                  <th className="px-6 py-4 text-right text-slate-900">Actions</th>
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
                         <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-blue-600 font-bold text-sm tracking-tighter">{(member.name || "?").charAt(0).toUpperCase()}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{member.name ?? "N/A"}</span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span className="bg-slate-100 px-1 rounded uppercase font-bold tracking-tighter">ID: {member.id}</span>
                                {member.joinedDate && (
                                    <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {new Date(member.joinedDate).toLocaleDateString()}</span>
                                )}
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                             <Building2 className="h-3.5 w-3.5 text-slate-400" />
                             <span className="text-xs">{member.businessName ?? "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                             <Phone className="h-3.5 w-3.5 text-slate-400" />
                             <span className="text-xs">{member.phone ?? "N/A"}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-2 text-slate-700">
                               <MapPin className="h-3.5 w-3.5 text-slate-400" />
                               <span className="text-xs font-semibold">{member.district ?? "N/A"}</span>
                           </div>
                           <span className="text-[10px] text-slate-400 ml-5">{member.place ?? "Kerala"}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => handleEdit(member)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
                                title="Edit"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                            <button 
                                onClick={() => confirmDelete(member.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                                title="Delete/Block"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                       </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <MemberModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={selectedMember}
        onSuccess={() => {
            const isUpdate = !!selectedMember?.id;
            toast.success(isUpdate ? "Member updated successfully." : "Member added successfully.");
            // Delay refresh slightly to ensure database stability
            setTimeout(() => {
                loadMembers();
            }, 1000);
        }}
      />

      {/* Delete/Block Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Permanent Action Required</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this member? This will remove all their access and data irreversibly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                }}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Processing..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
