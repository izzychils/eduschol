"use client";

import { useState } from "react";
import { Bus, MapPin, Phone, Plus, Users, UserRound } from "lucide-react";
import { PageTitle, Badge, Avatar, EmptyState, Progress } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useSchool } from "@/lib/store";
import { useSession } from "@/lib/session";
import { guardianChildren } from "@/lib/analytics";
import { percent } from "@/lib/format";
import { cn, uid } from "@/lib/utils";

export default function TransportPage() {
  const { workspace, update } = useSchool();
  const { user } = useSession();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", driver: "", phone: "", plate: "", capacity: "18", departure: "07:00", stops: "" });
  const [error, setError] = useState("");

  if (!workspace || !user) return null;

  const isParent = user.role === "parent";
  const children = isParent ? guardianChildren(workspace, user.email) : [];
  const routes = isParent
    ? workspace.routes.filter((route) => children.some((child) => route.studentIds.includes(child.id)))
    : workspace.routes;
  const assigned = new Set(workspace.routes.flatMap((route) => route.studentIds));
  const unassigned = workspace.students.filter((student) => student.status === "active" && !assigned.has(student.id));
  const seats = workspace.routes.reduce((total, route) => total + route.capacity, 0);
  const riders = workspace.routes.reduce((total, route) => total + route.studentIds.length, 0);

  function create(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.driver.trim()) {
      setError("A route name and driver are required.");
      return;
    }
    update((current) => ({
      ...current,
      routes: [
        ...current.routes,
        {
          id: uid("rte"),
          name: form.name.trim(),
          driver: form.driver.trim(),
          phone: form.phone.trim() || "+234 800 000 0000",
          plate: form.plate.trim() || "GFA-000-LG",
          capacity: Number(form.capacity) || 16,
          stops: form.stops.split(",").map((stop) => stop.trim()).filter(Boolean).length
            ? form.stops.split(",").map((stop) => stop.trim()).filter(Boolean)
            : ["School gate"],
          studentIds: [],
          departure: form.departure,
          active: true,
        },
      ],
    }));
    setOpen(false);
    setForm({ name: "", driver: "", phone: "", plate: "", capacity: "18", departure: "07:00", stops: "" });
    toast(`${form.name.trim()} added to the transport list`, "success");
  }

  return (
    <div className="space-y-4">
      <PageTitle
        eyebrow="Operations"
        title="Transport"
        description={
          isParent
            ? "The route your children take, the driver, the stops and the departure time."
            : "Routes, drivers and seat allocation. Every child on a bus is on a named route."
        }
        actions={
          !isParent ? (
            <Button size="md" onClick={() => setOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add route
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: isParent ? "Routes used" : "Active routes", value: routes.filter((route) => route.active).length, foot: `${routes.length} on the list` },
          { label: "Students riding", value: riders, foot: `${unassigned.length} not assigned` },
          { label: "Seats available", value: seats, foot: `${percent((riders / Math.max(1, seats)) * 100, 0)}% occupied` },
          { label: "Unassigned", value: unassigned.length, foot: "Walk or parent pickup" },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <p className="text-[10px] font-semibold text-muted">{item.label}</p>
            <p className="mt-1.5 text-[22px] font-extrabold leading-none tracking-[-0.03em] text-ink tnum">{item.value}</p>
            <p className="mt-1.5 text-[9.5px] text-muted">{item.foot}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {routes.map((route) => {
          const load = (route.studentIds.length / Math.max(1, route.capacity)) * 100;
          return (
            <section key={route.id} className="card overflow-hidden">
              <div className="flex items-start gap-3 border-b border-line bg-gradient-to-r from-brand-soft/50 to-transparent px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                  <Bus className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h2 className="text-[12px] font-bold text-ink">{route.name}</h2>
                    <Badge tone={route.active ? "success" : "neutral"} dot>{route.active ? "running" : "paused"}</Badge>
                  </div>
                  <p className="mt-0.5 text-[9.5px] text-muted">{route.plate} · departs {route.departure}</p>
                </div>
                {!isParent ? (
                  <Button
                    size="sm"
                    variant={route.active ? "ghost" : "soft"}
                    onClick={() => {
                      update((current) => ({
                        ...current,
                        routes: current.routes.map((item) => item.id === route.id ? { ...item, active: !item.active } : item),
                      }));
                      toast(`${route.name} ${route.active ? "paused" : "resumed"}`, "success");
                    }}
                  >
                    {route.active ? "Pause" : "Resume"}
                  </Button>
                ) : null}
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2">
                  <Avatar name={route.driver} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-semibold text-ink">{route.driver}</p>
                    <p className="flex items-center gap-1 text-[9px] text-muted">
                      <Phone className="h-2.5 w-2.5" />
                      {route.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-ink tnum">{route.studentIds.length}/{route.capacity}</p>
                    <p className="text-[8.5px] text-muted">seats used</p>
                  </div>
                </div>
                <Progress value={load} tone={load > 90 ? "warning" : "brand"} className="mt-2.5 h-1.5" />

                <div className="mt-3">
                  <p className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">Stops in order</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {route.stops.map((stop, index) => (
                      <span key={stop} className="inline-flex items-center gap-1">
                        <span className="rounded-md bg-canvas px-1.5 py-0.5 text-[9px] text-ink/75">{stop}</span>
                        {index < route.stops.length - 1 ? <span className="text-[8px] text-muted">›</span> : null}
                      </span>
                    ))}
                  </div>
                </div>

                {!isParent ? (
                  <div className="mt-3 border-t border-line pt-2.5">
                    <p className="flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
                      <Users className="h-3 w-3" />
                      Riders
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {route.studentIds.slice(0, 6).map((id) => {
                        const student = workspace.students.find((item) => item.id === id);
                        if (!student) return null;
                        return (
                          <span key={id} className="inline-flex items-center gap-1 rounded-full bg-canvas px-1.5 py-0.5 text-[8.5px] text-ink/75">
                            <UserRound className="h-2.5 w-2.5" />
                            {student.firstName} {student.lastName.slice(0, 1)}.
                          </span>
                        );
                      })}
                      {route.studentIds.length > 6 ? (
                        <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[8.5px] font-semibold text-brand">
                          +{route.studentIds.length - 6} more
                        </span>
                      ) : null}
                      {!route.studentIds.length ? <span className="text-[9px] text-muted">No riders assigned</span> : null}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 border-t border-line pt-2.5">
                    {children.filter((child) => route.studentIds.includes(child.id)).map((child) => (
                      <p key={child.id} className="flex items-center gap-1.5 text-[9.5px] text-ink">
                        <UserRound className="h-3 w-3 text-brand" />
                        {child.firstName} {child.lastName} boards at {route.stops[0]}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {!routes.length ? (
        <EmptyState
          icon={Bus}
          title={isParent ? "No school transport" : "No routes yet"}
          description={isParent ? "Your children are not assigned to a school bus. Contact the school office to arrange pickup." : "Add the first route and the students riding it."}
        />
      ) : null}

      {!isParent && unassigned.length ? (
        <section className="card p-4">
          <h2 className="flex items-center gap-1.5 text-[12px] font-bold text-ink">
            <MapPin className="h-3.5 w-3.5 text-brand" />
            Students not on a route
          </h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {unassigned.slice(0, 12).map((student) => (
              <span key={student.id} className="rounded-full border border-line px-2 py-1 text-[9px] text-ink/70">
                {student.firstName} {student.lastName}
              </span>
            ))}
            {unassigned.length > 12 ? (
              <span className="rounded-full bg-canvas px-2 py-1 text-[9px] font-semibold text-muted">+{unassigned.length - 12} more</span>
            ) : null}
          </div>
        </section>
      ) : null}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add a transport route"
        size="md"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="md" type="submit" form="route-form">Add route</Button>
          </>
        }
      >
        <form id="route-form" onSubmit={create} className="grid gap-3 sm:grid-cols-2">
          <Field label="Route name" htmlFor="rname" className="sm:col-span-2">
            <Input id="rname" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Lekki and Ajah" />
          </Field>
          <Field label="Driver" htmlFor="rdriver">
            <Input id="rdriver" value={form.driver} onChange={(event) => setForm({ ...form, driver: event.target.value })} placeholder="Bashir Lawal" />
          </Field>
          <Field label="Driver phone" htmlFor="rphone">
            <Input id="rphone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+234 800 000 0000" />
          </Field>
          <Field label="Plate number" htmlFor="rplate">
            <Input id="rplate" value={form.plate} onChange={(event) => setForm({ ...form, plate: event.target.value })} placeholder="GFA-105-LG" />
          </Field>
          <Field label="Capacity" htmlFor="rcapacity">
            <Input id="rcapacity" inputMode="numeric" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} />
          </Field>
          <Field label="Departure time" htmlFor="rdeparture">
            <Input id="rdeparture" type="time" value={form.departure} onChange={(event) => setForm({ ...form, departure: event.target.value })} />
          </Field>
          <Field label="Stops" htmlFor="rstops" hint="Separate with commas">
            <Input id="rstops" value={form.stops} onChange={(event) => setForm({ ...form, stops: event.target.value })} placeholder="Lekki Phase 1, Ajah, School gate" />
          </Field>
          {error ? <p className="sm:col-span-2 rounded-lg bg-danger-soft px-3 py-2 text-[11px] font-medium text-danger">{error}</p> : null}
        </form>
      </Modal>
    </div>
  );
}
