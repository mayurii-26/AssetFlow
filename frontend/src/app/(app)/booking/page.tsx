"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CalendarClock, Users, MapPin, Clock, Plus, CheckCircle,
  AlertTriangle, X, ShieldCheck, RefreshCw,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { bookingApi, getUserId, type Resource, type Booking } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const emptyForm = {
  department: "", purpose: "",
  startTime: "", endTime: "", attendees: "1", notes: "",
};

const isAdmin = (role?: string) => {
  const r = (role ?? "").toLowerCase();
  return r === "admin" || r === "asset_manager";
};

export default function BookingPage() {
  const { user } = useAuth();
  const admin = isAdmin(user?.role);

  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
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
      const userId = getUserId();
      const [rRes, bRes, myRes] = await Promise.all([
        bookingApi.resources(),
        bookingApi.list(),
        userId ? bookingApi.list({ bookedById: userId }) : Promise.resolve({ data: [] as Booking[] }),
      ]);
      setResources(rRes.data);
      setBookings(bRes.data);
      setMyBookings((myRes as { data: Booking[] }).data);
      if (rRes.data.length > 0 && !selectedResource) setSelectedResource(rRes.data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleBook = async () => {
    if (!selectedResource || !form.startTime || !form.endTime) {
      setFormError("Start time and end time are required.");
      return;
    }
    const userId = getUserId();
    if (!userId) { setFormError("Session expired. Please log in again."); return; }

    setSubmitting(true);
    setFormError("");
    try {
      await bookingApi.create({
        resourceId: selectedResource.id,
        bookedById: userId,
        department: form.department,
        purpose: form.purpose,
        startTime: form.startTime,
        endTime: form.endTime,
        attendees: Number(form.attendees) || 1,
        notes: form.notes,
      });
      setBookingOpen(false);
      setForm(emptyForm);
      setSubmitMsg({ ok: true, text: "Booking request submitted! Awaiting admin approval." });
      load();
      setTimeout(() => setSubmitMsg(null), 5000);
    } catch (e: any) {
      setFormError(e.message || "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try { await bookingApi.approve(id); load(); }
    catch (e: any) { alert(e.message); }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject this booking request?")) return;
    try { await bookingApi.reject(id); load(); }
    catch (e: any) { alert(e.message); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    try { await bookingApi.cancel(id); load(); }
    catch (e: any) { alert(e.message); }
  };

  const sf = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const pendingBookings = bookings.filter(b => b.status === "PENDING");
  const resourceBookings = bookings.filter(b => b.resourceId === selectedResource?.id && b.status !== "CANCELLED");

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Resource Booking"
        description={admin ? "Manage booking requests and view all resource schedules" : "Book meeting rooms, vehicles, equipment, and shared spaces"}
        icon={CalendarClock}
      >
        {!admin && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setBookingOpen(true); setForm(emptyForm); setFormError(""); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff] text-black rounded-full text-[13px] font-semibold"
          >
            <Plus size={14} /> New Booking
          </motion.button>
        )}
      </PageHeader>

      {submitMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-3 rounded-xl text-[13px] ${submitMsg.ok
            ? "bg-green-500/10 border border-green-500/25 text-green-400"
            : "bg-red-500/10 border border-red-500/25 text-red-400"}`}
        >
          {submitMsg.ok ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
          {submitMsg.text}
        </motion.div>
      )}

      {/* ── ADMIN VIEW ── */}
      {admin ? (
        <div className="space-y-6">
          {/* Pending approvals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl border border-white/8 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#00f0ff]" />
                <h2 className="text-[14px] font-semibold text-[#e5e2e1]">Pending Approvals</h2>
                {pendingBookings.length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded-full text-[11px] font-semibold">
                    {pendingBookings.length}
                  </span>
                )}
              </div>
              <button onClick={load} className="p-1.5 rounded-lg hover:bg-white/8 text-[#8e9192] transition-colors">
                <RefreshCw size={13} />
              </button>
            </div>
            {loading ? (
              <div className="p-5 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : pendingBookings.length === 0 ? (
              <div className="py-10 text-center text-[#8e9192] text-[13px]">No pending booking requests.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    {["Resource", "Requested By", "Purpose", "Start", "End", "Attendees", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingBookings.map((b, i) => (
                    <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 text-[13px] font-medium text-[#e5e2e1]">
                        {b.resource ? b.resource.name : b.resourceId}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#8e9192]">
                        {b.bookedById === user?.id ? user.name : b.bookedById}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#8e9192]">{b.purpose}</td>
                      <td className="px-4 py-3 text-[12px] text-[#8e9192] whitespace-nowrap">
                        <div className="flex items-center gap-1"><Clock size={11} />{fmtDate(b.startTime)}</div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#8e9192] whitespace-nowrap">{fmtTime(b.endTime)}</td>
                      <td className="px-4 py-3 text-[13px] text-[#8e9192]">
                        <div className="flex items-center gap-1"><Users size={11} />{b.attendees}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => handleApprove(b.id)}
                            className="px-2.5 py-1 bg-green-500/10 text-green-400 rounded-lg text-[11px] font-medium hover:bg-green-500/20 transition-colors flex items-center gap-1">
                            <CheckCircle size={11} /> Approve
                          </button>
                          <button onClick={() => handleReject(b.id)}
                            className="px-2.5 py-1 bg-red-500/10 text-red-400 rounded-lg text-[11px] font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1">
                            <X size={11} /> Reject
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>

          {/* All bookings by resource */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h2 className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">Resources</h2>
              {resources.map(res => (
                <motion.button key={res.id} onClick={() => setSelectedResource(res)} whileHover={{ x: 2 }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${selectedResource?.id === res.id
                    ? "bg-[#00f0ff]/10 border-[#00f0ff]/30"
                    : "bg-white/3 border-white/8 hover:bg-white/5"}`}>
                  <p className={`text-[13px] font-medium ${selectedResource?.id === res.id ? "text-[#00f0ff]" : "text-[#e5e2e1]"}`}>{res.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-[#8e9192] flex items-center gap-1"><Users size={10} />{res.capacity}</span>
                    <span className="text-[11px] text-[#8e9192] flex items-center gap-1"><MapPin size={10} />{res.location}</span>
                  </div>
                  <p className="text-[11px] text-[#8e9192] mt-0.5">{res.type}</p>
                </motion.button>
              ))}
            </div>

            <div className="xl:col-span-3">
              {selectedResource && (
                <div className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/8">
                    <h2 className="text-[14px] font-semibold text-[#e5e2e1]">{selectedResource.name}</h2>
                    <p className="text-[12px] text-[#8e9192]">{selectedResource.type} · {selectedResource.location} · Capacity: {selectedResource.capacity}</p>
                  </div>
                  {resourceBookings.length === 0 ? (
                    <div className="py-12 text-center text-[#8e9192] text-[13px]">No bookings for this resource.</div>
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
                            <td className="px-4 py-3 text-[13px] font-medium text-[#e5e2e1]">
                              {b.bookedById === user?.id ? user.name : b.bookedById}
                            </td>
                            <td className="px-4 py-3 text-[13px] text-[#8e9192]">{b.purpose}</td>
                            <td className="px-4 py-3 text-[12px] text-[#8e9192] whitespace-nowrap">
                              <div className="flex items-center gap-1"><Clock size={11} />{fmtDate(b.startTime)}</div>
                            </td>
                            <td className="px-4 py-3 text-[12px] text-[#8e9192] whitespace-nowrap">{fmtTime(b.endTime)}</td>
                            <td className="px-4 py-3 text-[13px] text-[#8e9192]">
                              <div className="flex items-center gap-1"><Users size={11} />{b.attendees}</div>
                            </td>
                            <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                            <td className="px-4 py-3">
                              {b.status === "PENDING" && (
                                <div className="flex gap-1">
                                  <button onClick={() => handleApprove(b.id)}
                                    className="p-1.5 rounded-lg hover:bg-green-500/10 text-[#8e9192] hover:text-green-400 transition-colors">
                                    <CheckCircle size={13} />
                                  </button>
                                  <button onClick={() => handleReject(b.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#8e9192] hover:text-red-400 transition-colors">
                                    <X size={13} />
                                  </button>
                                </div>
                              )}
                              {b.status === "CONFIRMED" && (
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
            </div>
          </div>
        </div>
      ) : (
        /* ── EMPLOYEE VIEW ── */
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Resource list */}
          <div className="space-y-2">
            <h2 className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">Resources</h2>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)
            ) : resources.length === 0 ? (
              <p className="text-[#8e9192] text-[12px]">No resources configured yet.</p>
            ) : (
              resources.map(res => (
                <motion.button key={res.id} onClick={() => setSelectedResource(res)} whileHover={{ x: 2 }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${selectedResource?.id === res.id
                    ? "bg-[#00f0ff]/10 border-[#00f0ff]/30"
                    : "bg-white/3 border-white/8 hover:bg-white/5"}`}>
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

          {/* My booking requests */}
          <div className="xl:col-span-3 space-y-4">
            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 bg-[#00f0ff]/5 border border-[#00f0ff]/20 rounded-xl">
              <CalendarClock size={16} className="text-[#00f0ff] shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-[#00f0ff]">How Booking Works</p>
                <p className="text-[12px] text-[#8e9192] mt-0.5">
                  Submit a booking request for any resource. An admin will review and approve or reject it. You'll see the status below.
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider">My Booking Requests</h2>
                <button onClick={load} className="p-1.5 rounded-lg hover:bg-white/8 text-[#8e9192] transition-colors">
                  <RefreshCw size={13} />
                </button>
              </div>
              {loading ? (
                <div className="p-5 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : myBookings.filter(b => b.status !== "CANCELLED").length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarClock size={32} className="text-[#444748] mx-auto mb-3" />
                  <p className="text-[#8e9192] text-[13px]">No booking requests yet. Hit "New Booking" to get started.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      {["Resource", "Purpose", "Start", "End", "Attendees", "Status", ""].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {myBookings.filter(b => b.status !== "CANCELLED").map((b, i) => (
                      <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 text-[13px] font-medium text-[#e5e2e1]">
                          {b.resource ? b.resource.name : b.resourceId}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#8e9192]">{b.purpose}</td>
                        <td className="px-4 py-3 text-[12px] text-[#8e9192] whitespace-nowrap">
                          <div className="flex items-center gap-1"><Clock size={11} />{fmtDate(b.startTime)}</div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#8e9192] whitespace-nowrap">{fmtTime(b.endTime)}</td>
                        <td className="px-4 py-3 text-[13px] text-[#8e9192]">
                          <div className="flex items-center gap-1"><Users size={11} />{b.attendees}</div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                        <td className="px-4 py-3">
                          {(b.status === "PENDING" || b.status === "CONFIRMED") && (
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
          </div>
        </div>
      )}

      {/* Booking modal — shared for both roles */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="bg-[#1c1b1b] border-white/10 text-[#e5e2e1] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#e5e2e1]">
              New Booking Request{selectedResource ? ` — ${selectedResource.name}` : ""}
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

            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">
                Booking For
                <span className="ml-2 text-[10px] text-[#00f0ff]/70 font-normal">your account</span>
              </Label>
              <input value={user?.name ?? "—"} disabled
                className="w-full px-3 py-2 bg-[#00f0ff]/5 border border-[#00f0ff]/20 rounded-xl text-[13px] text-[#8e9192]" />
            </div>

            {([
              ["Department", "department", "text"],
              ["Purpose", "purpose", "text"],
              ["Start Time *", "startTime", "datetime-local"],
              ["End Time *", "endTime", "datetime-local"],
              ["Attendees", "attendees", "number"],
              ["Notes", "notes", "text"],
            ] as [string, keyof typeof emptyForm, string][]).map(([label, key, type]) => (
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
              {submitting ? "Submitting…" : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
