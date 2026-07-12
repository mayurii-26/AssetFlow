"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Users, MapPin, Clock, Plus, CheckCircle, AlertTriangle, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { bookingApi, type Resource, type Booking } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const emptyForm = {
  bookedBy: "", department: "", purpose: "",
  startTime: "", endTime: "", attendees: "1", notes: "",
};

export default function BookingPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, bRes] = await Promise.all([bookingApi.resources(), bookingApi.list()]);
      setResources(rRes.data);
      setBookings(bRes.data);
      if (rRes.data.length > 0 && !selectedResource) setSelectedResource(rRes.data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleBook = async () => {
    if (!selectedResource || !form.bookedBy || !form.startTime || !form.endTime) {
      setFormError("Booked by, start time, and end time are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await bookingApi.create({
        resourceId: selectedResource.id,
        bookedBy: form.bookedBy,
        department: form.department,
        purpose: form.purpose,
        startTime: form.startTime,
        endTime: form.endTime,
        attendees: Number(form.attendees) || 1,
        notes: form.notes,
      });
      setBookingOpen(false);
      setForm(emptyForm);
      setSubmitMsg({ ok: true, text: "Booking confirmed successfully!" });
      load();
      setTimeout(() => setSubmitMsg(null), 4000);
    } catch (e: any) {
      setFormError(e.message || "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await bookingApi.cancel(id);
      load();
    } catch (e: any) { alert(e.message); }
  };

  const sf = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const resourceBookings = bookings.filter(b => b.resourceId === selectedResource?.id && b.status !== "Cancelled");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Resource Booking" description="Book meeting rooms, vehicles, equipment, and shared spaces" icon={CalendarClock}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setBookingOpen(true); setForm({ ...emptyForm, bookedBy: user?.name ?? "" }); setFormError(""); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff] text-black rounded-full text-[13px] font-semibold">
          <Plus size={14} /> New Booking
        </motion.button>
      </PageHeader>

      {submitMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-3 rounded-xl text-[13px] ${submitMsg.ok ? "bg-green-500/10 border border-green-500/25 text-green-400" : "bg-red-500/10 border border-red-500/25 text-red-400"}`}>
          {submitMsg.ok ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
          {submitMsg.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Resource List */}
        <div className="space-y-2">
          <h2 className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">Resources</h2>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)
          ) : resources.length === 0 ? (
            <p className="text-[#8e9192] text-[12px]">No resources configured yet.</p>
          ) : (
            resources.map(res => (
              <motion.button key={res.id} onClick={() => setSelectedResource(res)} whileHover={{ x: 2 }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedResource?.id === res.id ? "bg-[#00f0ff]/10 border-[#00f0ff]/30" : "bg-white/3 border-white/8 hover:bg-white/5"}`}>
                <p className={`text-[13px] font-medium ${selectedResource?.id === res.id ? "text-[#00f0ff]" : "text-[#e5e2e1]"}`}>{res.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-[#8e9192] flex items-center gap-1"><Users size={10} />{res.capacity}</span>
                  <span className="text-[11px] text-[#8e9192] flex items-center gap-1"><MapPin size={10} />{res.location}</span>
                </div>
                <p className="text-[11px] text-[#8e9192] mt-0.5">{res.type}</p>
              </motion.button>
            ))
          )}
        </div>

        {/* Bookings for selected resource */}
        <div className="xl:col-span-3 space-y-4">
          {selectedResource && (
            <div className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/8">
                <h2 className="text-[14px] font-semibold text-[#e5e2e1]">{selectedResource.name}</h2>
                <p className="text-[12px] text-[#8e9192]">{selectedResource.type} · {selectedResource.location} · Capacity: {selectedResource.capacity}</p>
              </div>

              {loading ? (
                <div className="p-5 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : resourceBookings.length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarClock size={32} className="text-[#444748] mx-auto mb-3" />
                  <p className="text-[#8e9192] text-[13px]">No bookings for this resource. Book a slot to get started.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      {["Booked By", "Purpose", "Start", "End", "Attendees", "Status", ""].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resourceBookings.map((b, i) => (
                      <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 text-[13px] font-medium text-[#e5e2e1]">{b.bookedBy}</td>
                        <td className="px-4 py-3 text-[13px] text-[#8e9192]">{b.purpose}</td>
                        <td className="px-4 py-3 text-[12px] text-[#8e9192] whitespace-nowrap">
                          <div className="flex items-center gap-1"><Clock size={11} />{new Date(b.startTime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#8e9192] whitespace-nowrap">
                          {new Date(b.endTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#8e9192]">
                          <div className="flex items-center gap-1"><Users size={11} />{b.attendees}</div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                        <td className="px-4 py-3">
                          {b.status === "Confirmed" && (
                            <button onClick={() => handleCancel(b.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#8e9192] hover:text-red-400 transition-colors">
                              <X size={13} />
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* All upcoming bookings */}
          <div className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8">
              <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider">All Upcoming Bookings</h2>
            </div>
            {loading ? (
              <div className="p-5 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : bookings.filter(b => b.status !== "Cancelled").length === 0 ? (
              <div className="py-10 text-center text-[#8e9192] text-[13px]">No bookings yet.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Resource", "Booked By", "Purpose", "Date & Time", "Attendees", "Status"].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-[11px] text-[#8e9192] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.filter(b => b.status !== "Cancelled").map((b, i) => (
                    <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 text-[13px] font-medium text-[#e5e2e1]">{b.resourceName}</td>
                      <td className="px-4 py-3 text-[13px] text-[#8e9192]">{b.bookedBy}</td>
                      <td className="px-4 py-3 text-[13px] text-[#8e9192]">{b.purpose}</td>
                      <td className="px-4 py-3 text-[12px] text-[#8e9192] whitespace-nowrap">
                        <div className="flex items-center gap-1"><Clock size={11} />{new Date(b.startTime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#8e9192]">
                        <div className="flex items-center gap-1"><Users size={11} />{b.attendees}</div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="bg-[#1c1b1b] border-white/10 text-[#e5e2e1] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#e5e2e1]">
              New Booking{selectedResource ? ` — ${selectedResource.name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Resource</Label>
              <select value={selectedResource?.id || ""}
                onChange={e => setSelectedResource(resources.find(r => r.id === e.target.value) || null)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40">
                {resources.map(r => <option key={r.id} value={r.id} className="bg-[#1c1b1b]">{r.name}</option>)}
              </select>
            </div>

            {/* Booked By — pre-filled from logged-in user */}
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">
                Booked By *
                <span className="ml-2 text-[10px] text-[#00f0ff]/70 font-normal">auto-filled from your account</span>
              </Label>
              <div className="relative">
                <input
                  type="text"
                  value={form.bookedBy}
                  onChange={e => setForm(f => ({ ...f, bookedBy: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#00f0ff]/5 border border-[#00f0ff]/20 rounded-xl text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40"
                />
              </div>
            </div>

            {([["Department", "department", "text"], ["Purpose", "purpose", "text"],
               ["Start Time *", "startTime", "datetime-local"], ["End Time *", "endTime", "datetime-local"],
               ["Attendees", "attendees", "number"], ["Notes", "notes", "text"]] as [string, keyof typeof emptyForm, string][]).map(([label, key, type]) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-[#8e9192] text-[12px]">{label}</Label>
                <input type={type} value={form[key]} onChange={sf(key)}
                  placeholder={`Enter ${label.replace(" *", "").toLowerCase()}…`}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40" />
              </div>
            ))}
          </div>
          {formError && <p className="text-red-400 text-[12px] px-1">{formError}</p>}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBookingOpen(false)} className="text-[#8e9192] hover:text-[#e5e2e1]">Cancel</Button>
            <Button onClick={handleBook} disabled={submitting} className="bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90 font-semibold">
              {submitting ? "Booking…" : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
