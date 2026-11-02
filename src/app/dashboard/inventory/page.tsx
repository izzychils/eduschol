"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, MapPin, Package, PackagePlus, Plus } from "lucide-react";
import { PageTitle, Badge, EmptyState } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, SearchField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useSchool } from "@/lib/store";
import { useSession } from "@/lib/session";
import { lowStock } from "@/lib/analytics";
import { compactNaira, dateLabel, naira } from "@/lib/format";
import { cn, uid } from "@/lib/utils";

export default function InventoryPage() {
  const { workspace, update } = useSchool();
  const { user } = useSession();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [amount, setAmount] = useState("10");
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Stationery", quantity: "50", unit: "pieces", reorderLevel: "20", location: "Central store", unitCost: "1200" });
  const [error, setError] = useState("");

  const categories = useMemo(
    () => (workspace ? [...new Set(workspace.inventory.map((item) => item.category))].sort() : []),
    [workspace],
  );

  const items = useMemo(() => {
    if (!workspace) return [];
    const clean = query.trim().toLowerCase();
    return workspace.inventory
      .filter((item) => category === "all" || item.category === category)
      .filter((item) => (clean ? `${item.name} ${item.location} ${item.category}`.toLowerCase().includes(clean) : true))
      .sort((a, b) => a.quantity / Math.max(1, a.reorderLevel) - b.quantity / Math.max(1, b.reorderLevel));
  }, [workspace, category, query]);

  if (!workspace || !user) return null;

  if (user.role !== "admin") {
    return <EmptyState icon={Boxes} title="Inventory is restricted" description="Only administrators and operations staff can manage stock." />;
  }

  const low = lowStock(workspace);
  const value = workspace.inventory.reduce((total, item) => total + item.quantity * item.unitCost, 0);
  const selected = workspace.inventory.find((item) => item.id === adjustId);

  function adjust(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const delta = Math.abs(Number(amount) || 0) * (direction === "in" ? 1 : -1);
    update((current) => ({
      ...current,
      inventory: current.inventory.map((item) =>
        item.id === selected.id
          ? { ...item, quantity: Math.max(0, item.quantity + delta), updatedAt: new Date().toISOString() }
          : item,
      ),
      activity: [
        {
          id: uid("act"),
          kind: "inventory.adjusted",
          text: `${user?.name ?? "Operations"} recorded ${direction === "in" ? "a delivery of" : "an issue of"} ${Math.abs(delta)} ${selected.unit} of ${selected.name}`,
          at: new Date().toISOString(),
        },
        ...current.activity,
      ],
    }));
    setAdjustId(null);
    toast(`${selected.name} adjusted by ${delta > 0 ? "+" : ""}${delta} ${selected.unit}`, "success");
  }

  function create(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Give the item a name.");
      return;
    }
    update((current) => ({
      ...current,
      inventory: [
        {
          id: uid("inv_item"),
          name: form.name.trim(),
          category: form.category,
          quantity: Number(form.quantity) || 0,
          unit: form.unit,
          reorderLevel: Number(form.reorderLevel) || 0,
          location: form.location,
          unitCost: Number(form.unitCost) || 0,
          updatedAt: new Date().toISOString(),
        },
        ...current.inventory,
      ],
    }));
    setOpen(false);
    toast(`${form.name.trim()} added to inventory`, "success");
  }

  return (
    <div className="space-y-4">
      <PageTitle
        eyebrow="Operations"
        title="Inventory and assets"
        description="Stock on the shelves, what it is worth, and what needs reordering before the week starts."
        actions={
          <Button size="md" onClick={() => setOpen(true)}>
            <PackagePlus className="h-3.5 w-3.5" />
            Add item
          </Button>
        }
      />

      {low.length ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 text-warning">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-bold text-ink">{low.length} items at or below the reorder level</p>
            <p className="text-[10px] text-ink/60">{low.map((item) => item.name).slice(0, 3).join(", ")}</p>
          </div>
          <Badge tone="warning">{low.length} to reorder</Badge>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Line items", value: workspace.inventory.length, foot: `${categories.length} categories` },
          { label: "Units in store", value: workspace.inventory.reduce((total, item) => total + item.quantity, 0), foot: "Across all locations" },
          { label: "Stock value", value: compactNaira(value), foot: "At unit cost" },
          { label: "Low stock", value: low.length, foot: low.length ? "Needs a purchase order" : "Everything above minimum" },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <p className="text-[10px] font-semibold text-muted">{item.label}</p>
            <p className="mt-1.5 text-[22px] font-extrabold leading-none tracking-[-0.03em] text-ink tnum">{item.value}</p>
            <p className="mt-1.5 text-[9.5px] text-muted">{item.foot}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <SearchField value={query} onChange={setQuery} placeholder="Search stock" className="min-w-[160px] flex-1" />
          <Select value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 w-[160px] text-[11px]">
            <option value="all">Every category</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
        </div>

        <div className="hidden grid-cols-[1.6fr_0.9fr_0.7fr_0.9fr_0.9fr_0.7fr] gap-2 border-b border-line bg-canvas/60 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-muted sm:grid">
          <span>Item</span>
          <span>Category</span>
          <span className="text-right">Quantity</span>
          <span className="text-right">Value</span>
          <span>Location</span>
          <span className="text-right">Adjust</span>
        </div>
        <div className="divide-y divide-line-soft">
          {items.map((item) => {
            const isLow = item.quantity <= item.reorderLevel;
            return (
              <div key={item.id} className="grid grid-cols-2 gap-2 px-4 py-2.5 sm:grid-cols-[1.6fr_0.9fr_0.7fr_0.9fr_0.9fr_0.7fr] sm:items-center">
                <div className="flex items-center gap-2">
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", isLow ? "bg-warning-soft text-warning" : "bg-brand-soft text-brand")}>
                    <Package className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[10.5px] font-semibold text-ink">{item.name}</p>
                    <p className="text-[9px] text-muted">Updated {dateLabel(item.updatedAt, { day: "numeric", month: "short" })}</p>
                  </div>
                </div>
                <span className="hidden text-[9.5px] text-muted sm:block">{item.category}</span>
                <div className="text-right">
                  <p className={cn("text-[10.5px] font-bold tnum", isLow ? "text-warning" : "text-ink")}>
                    {item.quantity} {item.unit}
                  </p>
                  <p className="text-[8.5px] text-muted">min {item.reorderLevel}</p>
                </div>
                <p className="hidden text-right text-[10px] text-ink tnum sm:block">{naira(item.quantity * item.unitCost)}</p>
                <p className="hidden items-center gap-1 text-[9.5px] text-muted sm:flex">
                  <MapPin className="h-2.5 w-2.5" />
                  {item.location}
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setAdjustId(item.id); setAmount("10"); setDirection("in"); }}
                    className="inline-flex items-center gap-1 rounded-md border border-line px-1.5 py-1 text-[9px] font-semibold text-ink transition-colors hover:border-brand/30 hover:bg-brand-soft"
                  >
                    <Plus className="h-2.5 w-2.5" />
                    Adjust
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {!items.length ? <EmptyState icon={Boxes} title="No stock matches" description="Try another category or add the item." /> : null}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setAdjustId(null)}
        title={selected?.name ?? "Adjust stock"}
        description={selected ? `${selected.quantity} ${selected.unit} currently at ${selected.location}` : undefined}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setAdjustId(null)}>Cancel</Button>
            <Button size="md" type="submit" form="adjust-form">Save adjustment</Button>
          </>
        }
      >
        <form id="adjust-form" onSubmit={adjust} className="space-y-3">
          <Field label="Direction" htmlFor="direction">
            <Select id="direction" value={direction} onChange={(event) => setDirection(event.target.value as "in" | "out")}>
              <option value="in">Stock in (delivery or return)</option>
              <option value="out">Stock out (issued or used)</option>
            </Select>
          </Field>
          <Field label="Quantity" htmlFor="qty">
            <Input id="qty" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </Field>
          <p className="rounded-lg bg-canvas px-3 py-2 text-[9.5px] leading-relaxed text-muted">
            The adjustment is logged in the school activity feed with your name.
          </p>
        </form>
      </Modal>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add an inventory item"
        size="md"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="md" type="submit" form="item-form">Add item</Button>
          </>
        }
      >
        <form id="item-form" onSubmit={create} className="grid gap-3 sm:grid-cols-2">
          <Field label="Item name" htmlFor="iname" className="sm:col-span-2">
            <Input id="iname" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="A4 exercise books" />
          </Field>
          <Field label="Category" htmlFor="icat">
            <Input id="icat" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} list="categories" />
          </Field>
          <Field label="Unit" htmlFor="iunit">
            <Select id="iunit" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })}>
              {["pieces", "packs", "boxes", "litres", "kg", "sets"].map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </Select>
          </Field>
          <Field label="Quantity" htmlFor="iqty">
            <Input id="iqty" inputMode="numeric" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
          </Field>
          <Field label="Reorder level" htmlFor="ilevel">
            <Input id="ilevel" inputMode="numeric" value={form.reorderLevel} onChange={(event) => setForm({ ...form, reorderLevel: event.target.value })} />
          </Field>
          <Field label="Location" htmlFor="ilocation">
            <Input id="ilocation" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
          </Field>
          <Field label="Unit cost" htmlFor="icost">
            <Input id="icost" inputMode="numeric" value={form.unitCost} onChange={(event) => setForm({ ...form, unitCost: event.target.value })} />
          </Field>
          {error ? <p className="sm:col-span-2 rounded-lg bg-danger-soft px-3 py-2 text-[11px] font-medium text-danger">{error}</p> : null}
          <datalist id="categories">
            {categories.map((item) => <option key={item} value={item} />)}
          </datalist>
        </form>
      </Modal>
    </div>
  );
}
