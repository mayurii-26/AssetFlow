"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, Users, MapPin, Clock, Plus, X, CheckCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { mockResources, mockBookings } from "@/lib/mock-data-extra";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const hours = Array.from({ length: 10 }, (_, i) => `${i + 8}:00`);
const days = ["Mon Jul 14", "Tue Jul 15", "Wed Jul 16", "Thu Jul 17", "Fri Jul 18"];

const bookedSlots: Record<string, { label: string; color: string }> = {
  "Mon Jul 14-9:00": { label: "Sprint Planning\nArjun Mehta", color: "bg-[#00f0ff]/20 border-[#00f0ff]/40 text-[#00f0ff]" },
  "Tue Jul 15-14:00": { label: "Client Demo\nPriya Sharma", color: "bg-purple-500/20 border-purple-500/40 text-purple-300" },
  "Wed Jul 16-10:00": { label: "Board Meeting\nVikram Patel", color: "bg-[#00f0ff]/20 border-[#00f0ff]/40 text-[#00f0ff]" },
  "Tue Jul 15-9:00": { label: "CONFLICT\nDouble-booked", color: "bg-red-500/20 border-red-500/40 text-red-400" },
};

export default function BookingPage() {
  const [selectedResource, setSelectedResource] = useState(mockResources[0]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleBook = () => { setSubmitted(true); setBookingOpen(false); setTimeout(() => setSubmitted(false), 3000); };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Resource Booking" description="Book meeting rooms, vehicles, equipment, and shared spaces" icon={CalendarClock}>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setBookingOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff] text-black rounded-full text-[13px] font-semibold"
        >
          <Plus size={14} /> New Booking
        </motion.button>
      </PageHeader>

      {submitted && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/25 rounded-xl text-green-400 text-[13px]">
          <CheckCircle size={14} /> Booking submitted successfully!
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Resource List */}
        <div className="space-y-2">
          <h2 className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">Resources</h2>
          {mockResources.map(res => (
            <motion.button key={res.id} onClick={() => setSelectedResource(res)}
              whileHover={{ x: 2 }}
              className={`w-full text-left p-3 rounded-xl border transition-all ${selectedResource.id === res.id ? "bg-[#00f0ff]/10 border-[#00f0ff]/30" : "bg-white/3 border-white/8 hover:bg-white/5"}`}>
              <p className={`text-[13px] font-medium ${selectedResource.id === res.id ? "text-[#00f0ff]" : "text-[#e5e2e1]"}`}>{res.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[11px] text-[#8e9192] flex items-center gap-1"><Users size={10} />{res.capacity}</span>
                <span className="text-[11px] text-[#8e9192] flex items-center gap-1"><MapPin size={10} />{res.location}</span>
              </div>
              <p className="text-[11px] text-[#8e9192] mt-0.5">{res.type}</p>
            </motion.button>
          ))}
        </div>

        {/* Calendar / Timeline */}
        <div className="xl:col-span-3">
          <div className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-[#e5e2e1]">{selectedResource.name}</h2>
                <p className="text-[12px] text-[#8e9192]">Week of July 14–18, 2024</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00f0ff]" />Booked</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" />Conflict</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" />Available</span>
              </div>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Header row */}
                <div className="grid grid-cols-6 border-b border-white/8">
                  <div className="px-3 py-2 text-[11px] text-[#444748]">Time</div>
                  {days.map(d => (
                    <div key={d} className="px-3 py-2 text-[11px] font-medium text-[#8e9192] text-center">{d}</div>
                  ))}
                </div>
                {/* Time slots */}
                {hours.map(hour => (
                  <div key={hour} className="grid grid-cols-6 border-b border-white/5">
                    <div className="px-3 py-3 text-[11px] text-[#444748] font-mono">{hour}</div>
                    {days.map(day => {
                      const key = `${day}-${hour}`;
                      const slot = bookedSlots[key];
                      return (
                        <div key={day} className="px-1 py-1">
                          {slot ? (
                            <motion.div whileHover={{ scale: 1.02 }}
                              className={`h-full min-h-[40px] rounded-lg border px-2 py-1.5 text-[10px] cursor-pointer whitespace-pre-line leading-tight ${slot.color}`}>
                              {slot.label}
                            </motion.div>
                          ) : (
                            <button onClick={() => setBookingOpen(true)}
                              className="w-full h-full min-h-[40px] rounded-lg hover:bg-green-500/10 hover:border hover:border-green-500/25 transition-all group">
                              <Plus size={12} className="text-[#444748] group-hover:text-green-400 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="mt-4 glass-panel rounded-2xl border border-white/8 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8">
              <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider">Upcoming Bookings</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Resource","Booked By","Purpose","Date & Time","Attendees","Status"].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-[11px] text-[#8e9192] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockBookings.map((b, i) => (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 text-[13px] font-medium text-[#e5e2e1]">{b.resourceName}</td>
                    <td className="px-4 py-3 text-[13px] text-[#8e9192]">{b.bookedBy}</td>
                    <td className="px-4 py-3 text-[13px] text-[#8e9192]">{b.purpose}</td>
                    <td className="px-4 py-3 text-[12px] text-[#8e9192] whitespace-nowrap">
                      <div className="flex items-center gap-1"><Clock size={11} />{new Date(b.startTime).toLocaleDateString("en-IN",{day:"numeric",month:"short"})} {new Date(b.startTime).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#8e9192]">
                      <div className="flex items-center gap-1"><Users size={11} />{b.attendees}</div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="bg-[#1c1b1b] border-white/10 text-[#e5e2e1] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#e5e2e1]">New Booking — {selectedResource.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {[["Purpose","text"],["Department","text"],["Start Time","datetime-local"],["End Time","datetime-local"],["Attendees","number"],["Notes","text"]].map(([l,t]) => (
              <div key={l} className="space-y-1.5">
                <Label className="text-[#8e9192] text-[12px]">{l}</Label>
                <input type={t} placeholder={`Enter ${l.toLowerCase()}…`}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40" />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBookingOpen(false)} className="text-[#8e9192] hover:text-[#e5e2e1]">Cancel</Button>
            <Button onClick={handleBook} className="bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90 font-semibold">Submit Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
