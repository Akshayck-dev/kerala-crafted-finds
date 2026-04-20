import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { addOrUpdateMember } from "@/lib/api";
import { type Member } from "@/lib/data";
import { Loader2 } from "lucide-react";

interface MemberModalProps {
  member: Partial<Member> | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", 
  "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", 
  "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

export function MemberModal({ member, isOpen, onClose, onSuccess }: MemberModalProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Member>>({
    id: "0",
    name: "",
    businessName: "",
    place: "",
    district: "Ernakulam",
    product: "",
    contactNumber: "",
    licenceNumber: "",
    ownProduct: true,
    isActive: true,
  });

  useEffect(() => {
    if (member) {
      setFormData({
        ...member,
        id: member.id || "0",
        name: member.name ?? "",
        businessName: member.businessName ?? "",
        place: member.place ?? "",
        district: member.district ?? "Ernakulam",
        product: member.product ?? "",
        contactNumber: member.contactNumber ?? "",
        licenceNumber: member.licenceNumber ?? "",
        ownProduct: member.ownProduct ?? true,
      });
    } else {
      setFormData({
        id: "0",
        name: "",
        businessName: "",
        place: "",
        district: "Ernakulam",
        product: "",
        contactNumber: "",
        licenceNumber: "",
        ownProduct: true,
        isActive: true,
      });
    }
  }, [member, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Lead Dev Rules: ISO dates and numeric parsing for ID handled in API wrapper
      await addOrUpdateMember(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Save member error:", error);
      alert("Failed to save member.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 border-b pb-4">
            {member && Number(member.id) > 0 ? "Edit Member" : "Add New Member"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="m_name">Full Name</Label>
              <Input
                id="m_name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Member name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="m_business">Business Name</Label>
              <Input
                id="m_business"
                value={formData.businessName || ""}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Shop or Entity name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="m_contact">Contact Number</Label>
              <Input
                id="m_contact"
                value={formData.contactNumber || ""}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="Mobile number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="m_district">District</Label>
              <Select 
                value={formData.district || "Ernakulam"} 
                onValueChange={(val) => setFormData({ ...formData, district: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                    {DISTRICTS.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="m_place">Place</Label>
              <Input
                id="m_place"
                value={formData.place || ""}
                onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                placeholder="City/Town"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="m_licence">Licence Number</Label>
              <Input
                id="m_licence"
                value={formData.licenceNumber || ""}
                onChange={(e) => setFormData({ ...formData, licenceNumber: e.target.value })}
                placeholder="Licence info"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="m_product">Main Product Category</Label>
              <Input
                id="m_product"
                value={formData.product || ""}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                placeholder="e.g., Handicrafts, Spices"
                required
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
               <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Self-Produced Items</Label>
                  <p className="text-xs text-slate-500">Member manufactures their own products</p>
               </div>
               <Switch 
                  checked={formData.ownProduct ?? true}
                  onCheckedChange={(val) => setFormData({ ...formData, ownProduct: val })}
               />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
               <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Active Status</Label>
                  <p className="text-xs text-slate-500">Allow member to sell on platform</p>
               </div>
               <Switch 
                  checked={formData.isActive ?? true}
                  onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
               />
            </div>
          </div>


          <DialogFooter className="border-t pt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
