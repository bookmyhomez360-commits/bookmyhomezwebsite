import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Loader2, Home, Inbox, MapPin, Phone, Eye,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getMyProperties, getMyLeads, deleteProperty, formatPrice, mediaUrl } from "@/lib/api";
import PropertyFormDialog from "@/components/PropertyFormDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("listings");
  const [props, setProps] = useState([]);
  const [leads, setLeads] = useState([]);
  const [busy, setBusy] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [p, l] = await Promise.all([getMyProperties(), getMyLeads()]);
      setProps(p);
      setLeads(l);
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (user === false) {
      navigate("/login");
      return;
    }
    if (user) load();
  }, [user, loading, navigate, load]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteProperty(toDelete.id);
      toast.success("Listing deleted");
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Delete failed");
    }
  };

  if (loading || user === null || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-300">
        <Loader2 className="mr-2 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-28" data-testid="dashboard">
      <div className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-xl font-semibold text-white">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                (user.name || user.email || "?").charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold text-white">
                {user.name || "My Dashboard"}
              </h1>
              <p className="text-sm text-slate-400">
                {user.email} · <span className="uppercase tracking-wide text-indigo-400">{user.role}</span>
              </p>
            </div>
          </div>
          <button
            data-testid="dash-add-property"
            onClick={() => navigate("/list-property")}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition-transform duration-200 hover:bg-indigo-500 active:scale-95"
          >
            <Plus size={18} /> Add property
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-2 border-b border-white/10">
          <TabBtn active={tab === "listings"} onClick={() => setTab("listings")} icon={<Home size={16} />} label={`My Listings (${props.length})`} testid="tab-listings" />
          <TabBtn active={tab === "leads"} onClick={() => setTab("leads")} icon={<Inbox size={16} />} label={`Leads (${leads.length})`} testid="tab-leads" />
        </div>

        {busy ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="mr-2 animate-spin" /> Loading…
          </div>
        ) : tab === "listings" ? (
          <div className="mt-8">
            {props.length === 0 ? (
              <Empty label="No listings yet. Add your first property!" />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {props.map((p) => (
                  <motion.div
                    key={p.id}
                    data-testid={`dash-property-${p.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                  >
                    <div className="aspect-[16/10] bg-slate-900">
                      {p.images?.[0] && <img src={mediaUrl(p.images[0])} alt={p.title} className="h-full w-full object-cover" />}
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-1 font-medium text-white">{p.title}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm capitalize text-slate-400">
                        <MapPin size={13} className="text-indigo-400" /> {p.city} · {formatPrice(p.price, p.price_unit)}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Link to={`/property/${p.id}`} data-testid={`dash-view-${p.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10">
                          <Eye size={15} /> View
                        </Link>
                        <button data-testid={`dash-edit-${p.id}`} onClick={() => { setEditing(p); setFormOpen(true); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10">
                          <Pencil size={15} /> Edit
                        </button>
                        <button data-testid={`dash-delete-${p.id}`} onClick={() => setToDelete(p)} className="flex items-center justify-center rounded-lg border border-red-500/30 px-3 py-2 text-red-400 transition-colors hover:bg-red-500/10">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8">
            {leads.length === 0 ? (
              <Empty label="No leads yet. Enquiries on your listings will appear here." />
            ) : (
              <div className="space-y-3">
                {leads.map((l) => (
                  <div key={l.id} data-testid={`lead-${l.id}`} className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center">
                    <div>
                      <p className="font-medium text-white">{l.name} <span className="text-slate-500">· enquired about</span> {l.property_title}</p>
                      {l.message && <p className="mt-1 text-sm text-slate-400">“{l.message}”</p>}
                      <p className="mt-1 text-xs text-slate-500">{new Date(l.created_at).toLocaleString()}</p>
                    </div>
                    <a href={`tel:${l.phone}`} className="inline-flex items-center gap-2 self-start rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 md:self-auto">
                      <Phone size={14} /> {l.phone}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <PropertyFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} onSaved={load} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent className="border-white/10 bg-slate-950 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              “{toDelete?.title}” will be permanently removed. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-transparent text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction data-testid="confirm-delete" onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-500">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function TabBtn({ active, onClick, icon, label, testid }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
        active ? "border-indigo-500 text-white" : "border-transparent text-slate-400 hover:text-white"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function Empty({ label }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 py-20 text-center text-slate-400">
      {label}
    </div>
  );
}
