import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lock, DollarSign, Users, Calendar, TrendingUp, Building2, Shield, CheckCircle, XCircle, AlertTriangle, RefreshCw, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: "Open", color: "text-muted-foreground", icon: AlertTriangle },
  confirmed: { label: "Confirmed", color: "text-green-500", icon: CheckCircle },
  minimum_not_reached: { label: "Min Not Reached", color: "text-warm", icon: AlertTriangle },
  cancelled: { label: "Cancelled", color: "text-destructive", icon: XCircle },
};

interface SlotData {
  tour_date_id: string;
  tour_time: string;
  max_guests: number;
  min_guests: number;
  booked_guests: number;
  tour_status: string;
  revenue: number;
  bookings: any[];
}

interface DateGroup {
  tour_date: string;
  destination: string;
  slots: SlotData[];
}

const Admin = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [dateGroups, setDateGroups] = useState<DateGroup[]>([]);
  const [interestSubmissions, setInterestSubmissions] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async (pw?: string) => {
    const p = pw || password;
    const { data, error: fnError } = await supabase.functions.invoke("admin-stats", {
      body: { password: p },
    });
    if (fnError) throw fnError;
    if (data?.error === "Unauthorized") throw new Error("Invalid password");
    if (!data?.success) throw new Error("Failed to load");

    setStats(data.stats);
    setInterestSubmissions(data.interest_submissions || []);

    const groups: Record<string, DateGroup> = {};

    for (const td of data.tour_dates || []) {
      const dateKey = `${td.tour_date}_${td.destination}`;
      if (!groups[dateKey]) {
        groups[dateKey] = { tour_date: td.tour_date, destination: td.destination, slots: [] };
      }
      groups[dateKey].slots.push({
        tour_date_id: td.id,
        tour_time: td.tour_time,
        max_guests: td.max_guests || 5,
        min_guests: td.min_guests || 1,
        booked_guests: td.booked_guests || 0,
        tour_status: td.tour_status || "open",
        revenue: 0,
        bookings: [],
      });
    }

    for (const b of data.bookings || []) {
      const dateKey = `${b.tour_date}_${b.destination}`;
      if (groups[dateKey]) {
        const slot = groups[dateKey].slots.find((s) => s.tour_date_id === b.tour_date_id);
        if (slot) {
          slot.revenue += b.total_amount;
          slot.bookings.push(b);
        }
      }
    }

    for (const g of Object.values(groups)) {
      g.slots.sort((a, b) => a.tour_time.localeCompare(b.tour_time));
    }

    const sorted = Object.values(groups).sort((a, b) => a.tour_date.localeCompare(b.tour_date));
    setDateGroups(sorted);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await fetchData();
      setAuthenticated(true);
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (action: string, tour_date_id?: string, booking_id?: string, seats?: number) => {
    const key = `${action}_${tour_date_id || booking_id}`;
    setActionLoading(key);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-actions", {
        body: { password, action, tour_date_id, booking_id, seats },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Success", description: data?.message || "Action completed" });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-light text-foreground">Admin Dashboard</h1>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 bg-card border border-border text-foreground font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {error && <p className="text-destructive text-sm font-body">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-primary text-primary-foreground px-6 py-3 text-sm tracking-[0.15em] uppercase font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-heading font-light text-foreground">Dashboard</h1>
          <button onClick={() => fetchData()} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-body">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        <p className="text-muted-foreground font-body text-sm mb-10">Iconic Giza &amp; Grand Egyptian Museum · Financial overview &amp; booking management</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          <StatCard icon={Calendar} label="Total Bookings" value={stats.total_bookings} />
          <StatCard icon={Users} label="Total Guests" value={stats.total_guests} />
          <StatCard icon={DollarSign} label="Gross Revenue" value={fmt(stats.gross_revenue_cents)} />
          <StatCard icon={Building2} label="Business (25%)" value={fmt(stats.business_share_cents)} accent />
          <StatCard icon={TrendingUp} label="Operator (75%)" value={fmt(stats.operator_share_cents)} accent />
          <StatCard icon={DollarSign} label="Owed to Operator" value={fmt(stats.operator_share_cents)} />
        </div>

        {/* Interest Submissions */}
        <h2 className="text-xl font-heading font-light text-foreground mb-6">Interest Submissions</h2>
        {interestSubmissions.length === 0 ? (
          <div className="border border-border p-8 text-center mb-12">
            <p className="text-muted-foreground font-body">No submissions yet</p>
          </div>
        ) : (
          <div className="border border-border bg-card mb-12 overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Phone</th>
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Group</th>
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Dates</th>
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Message</th>
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {interestSubmissions.map((s: any) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 text-foreground font-medium">{s.name}</td>
                    <td className="px-5 py-3"><a href={`mailto:${s.email}`} className="text-accent hover:underline">{s.email}</a></td>
                    <td className="px-5 py-3 text-foreground text-xs">{s.phone || "—"}</td>
                    <td className="px-5 py-3 text-foreground text-xs">{s.form_type || "—"}</td>
                    <td className="px-5 py-3 text-foreground">{s.group_size || s.number_of_clients || "—"}</td>
                    <td className="px-5 py-3 text-foreground">{s.preferred_date || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs max-w-[200px] truncate">{s.message || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{format(new Date(s.created_at), "MMM d, yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bookings Grouped by Date */}
        <h2 className="text-xl font-heading font-light text-foreground mb-6">Tour Dates</h2>

        {dateGroups.length === 0 && (
          <div className="border border-border p-8 text-center">
            <p className="text-muted-foreground font-body">No tour dates yet</p>
          </div>
        )}

        <div className="space-y-6">
          {dateGroups.map((group) => (
            <div key={`${group.tour_date}_${group.destination}`} className="border border-border bg-card">
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-heading text-foreground text-lg">
                    {format(parseISO(group.tour_date), "EEE, MMM d, yyyy")}
                  </span>
                </div>
              </div>

              {group.slots.map((slot) => {
                const spotsLeft = slot.max_guests - slot.booked_guests;
                const statusInfo = STATUS_LABELS[slot.tour_status] || STATUS_LABELS.open;
                const StatusIcon = statusInfo.icon;

                return (
                  <div key={slot.tour_date_id} className="border-b border-border last:border-0">
                    <div className="px-5 py-3 bg-muted/20">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-body text-foreground text-sm font-medium">9:00 AM</span>
                          <span className={`inline-flex items-center gap-1 text-xs font-body px-2 py-0.5 border border-border ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-body">
                          <span className={`${spotsLeft === 0 ? "text-destructive" : spotsLeft <= 2 ? "text-warm" : "text-accent"}`}>
                            {slot.booked_guests}/{slot.max_guests} seats • {spotsLeft} remaining
                          </span>
                          <span className="text-foreground font-medium">{fmt(slot.revenue)} revenue</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {slot.tour_status !== "confirmed" && (
                          <button
                            onClick={() => handleAdminAction("confirm_date", slot.tour_date_id)}
                            disabled={actionLoading === `confirm_date_${slot.tour_date_id}`}
                            className="text-xs font-body px-3 py-1.5 bg-green-500/10 text-green-600 border border-green-500/30 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === `confirm_date_${slot.tour_date_id}` ? "..." : "✓ Confirm"}
                          </button>
                        )}
                        {slot.tour_status !== "cancelled" && (
                          <button
                            onClick={() => {
                              if (confirm("Cancel this time slot? This cannot be undone.")) {
                                handleAdminAction("cancel_date", slot.tour_date_id);
                              }
                            }}
                            disabled={actionLoading === `cancel_date_${slot.tour_date_id}`}
                            className="text-xs font-body px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === `cancel_date_${slot.tour_date_id}` ? "..." : "✗ Cancel"}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const val = prompt(`Adjust seat count (current: ${slot.booked_guests}):`, String(slot.booked_guests));
                            if (val !== null && !isNaN(Number(val))) {
                              handleAdminAction("adjust_seats", slot.tour_date_id, undefined, Number(val));
                            }
                          }}
                          className="text-xs font-body px-3 py-1.5 bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition-colors"
                        >
                          Adjust Seats
                        </button>
                      </div>
                    </div>

                    <div className="px-5 py-1.5">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-300"
                          style={{ width: `${(slot.booked_guests / slot.max_guests) * 100}%` }}
                        />
                      </div>
                    </div>

                    {slot.bookings.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm font-body">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left px-5 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Guest</th>
                              <th className="text-left px-5 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Phone</th>
                              <th className="text-left px-5 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Type</th>
                              <th className="text-left px-5 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Seats</th>
                              <th className="text-left px-5 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Paid</th>
                              <th className="text-left px-5 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {slot.bookings.map((b: any) => (
                              <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                                <td className="px-5 py-3">
                                  <p className="text-foreground">{b.full_name}</p>
                                  <p className="text-muted-foreground text-xs">{b.email}</p>
                                </td>
                                <td className="px-5 py-3 text-foreground">{b.phone || "—"}</td>
                                <td className="px-5 py-3 text-foreground text-xs">
                                  {b.experience_type === "private" ? "Private" : "Small Group"}
                                </td>
                                <td className="px-5 py-3 text-foreground">{b.num_guests}</td>
                                <td className="px-5 py-3 text-foreground">{fmt(b.total_amount)}</td>
                                <td className="px-5 py-3">
                                  <button
                                    onClick={() => {
                                      if (confirm(`Mark this booking as refunded for ${b.full_name}?`)) {
                                        handleAdminAction("refund_booking", undefined, b.id);
                                      }
                                    }}
                                    disabled={actionLoading === `refund_booking_${b.id}`}
                                    className="text-xs font-body px-2 py-1 text-destructive hover:underline disabled:opacity-50"
                                  >
                                    Refund
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="px-5 py-3 text-center text-muted-foreground font-body text-xs">
                        No bookings
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

const StatCard = ({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent?: boolean }) => (
  <div className={`p-5 border ${accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-2xl font-heading text-foreground">{value}</p>
  </div>
);

export default Admin;
