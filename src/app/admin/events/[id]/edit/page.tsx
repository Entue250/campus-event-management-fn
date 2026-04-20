// "use client";
// // Placement: src/app/admin/events/[id]/edit/page.tsx
// //
// // Loads existing event via getEvent(id), pre-fills the form,
// // then submits PATCH /events/update/{id} via updateEvent().
// // Field mapping (in buildEventFormData inside eventService):
// //   form.category_id  → FormData "category"
// //   form.max_capacity → FormData "capacity"
// // No UI changes — only logic and API integration updated.

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useParams, useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { List, ChevronRight, Plus, Save } from "lucide-react";
// import { getEvent, updateEvent } from "@/services/eventService";
// import { getCategories } from "@/services/adminService";
// import { extractErrorMessage } from "@/utils/helpers";
// import type { Category } from "@/types";
// import toast from "react-hot-toast";

// // ── Zod validation schema ────────────────────────────────────────────────────
// const schema = z.object({
//   title: z.string().min(3, "Title must be at least 3 characters"),
//   category_id: z.string().optional(),
//   location: z.string().min(2, "Location must be at least 2 characters"),
//   event_date: z.string().min(1, "Start date is required"),
//   end_date: z.string().optional(),
//   description: z.string().min(10, "Description must be at least 10 characters"),
//   max_capacity: z.string().optional(),
//   registration_fee: z.string().optional(),
//   status: z.string().optional(),
// });

// type EditForm = z.infer<typeof schema>;

// // ── Helper: format a UTC ISO string to datetime-local value ─────────────────
// function toDatetimeLocal(iso: string): string {
//   const d = new Date(iso);
//   const pad = (n: number) => String(n).padStart(2, "0");
//   return (
//     `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
//     `T${pad(d.getHours())}:${pad(d.getMinutes())}`
//   );
// }

// export default function EditEventPage() {
//   const { id } = useParams<{ id: string }>();
//   const router = useRouter();
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [eventTitle, setEventTitle] = useState("Event");
//   const [loadingEvent, setLoadingEvent] = useState(true);

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm<EditForm>({ resolver: zodResolver(schema) });

//   // Load categories and pre-fill form with existing event data
//   useEffect(() => {
//     getCategories()
//       .then(setCategories)
//       .catch(() => toast.error("Failed to load categories"));

//     if (!id) return;

//     setLoadingEvent(true);
//     getEvent(id)
//       .then((ev) => {
//         setEventTitle(ev.title);

//         reset({
//           title: ev.title,
//           // category field in Event can be a Category object or a raw UUID string
//           category_id:
//             typeof ev.category === "object"
//               ? (ev.category?.id ?? "")
//               : (ev.category ?? ""),
//           location: ev.location,
//           event_date: ev.event_date ? toDatetimeLocal(ev.event_date) : "",
//           end_date: ev.end_date ? toDatetimeLocal(ev.end_date) : "",
//           description: ev.description ?? "",
//           max_capacity: ev.max_capacity ? String(ev.max_capacity) : "",
//           registration_fee: ev.registration_fee
//             ? String(ev.registration_fee)
//             : "",
//           status: ev.status ?? "UPCOMING",
//         });
//       })
//       .catch(() => toast.error("Failed to load event details"))
//       .finally(() => setLoadingEvent(false));
//   }, [id, reset]);

//   // ── Form submission ──────────────────────────────────────────────────────
//   const onSubmit = async (data: EditForm) => {
//     try {
//       await updateEvent(id, {
//         title: data.title,
//         description: data.description,
//         category_id: data.category_id,       // mapped → "category" in FormData
//         location: data.location,
//         event_date: data.event_date,
//         end_date: data.end_date,
//         max_capacity: data.max_capacity,      // mapped → "capacity" in FormData
//         registration_fee: data.registration_fee,
//         status: data.status as string | undefined,
//       });
//       toast.success("Event updated successfully!");
//       router.push("/admin/events");
//     } catch (err) {
//       toast.error(extractErrorMessage(err));
//     }
//   };

//   const inputCls =
//     "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]";

//   return (
//     <div className="flex-1 bg-gray-50 min-h-screen">
//       {/* ── Top bar ─────────────────────────────────────────────────────── */}
//       <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
//         <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//           <List className="h-4 w-4" />
//           Edit Event
//         </div>
//         <div className="flex items-center gap-3">
//           <div className="relative">
//             <input
//               placeholder="Search events..."
//               className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none w-52"
//             />
//             <svg
//               className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//               />
//             </svg>
//           </div>
//           <div className="h-8 w-8 rounded-full bg-orange-400 flex items-center justify-center">
//             <span className="text-white text-xs font-bold">A</span>
//           </div>
//         </div>
//       </header>

//       <div className="p-6 max-w-4xl mx-auto">
//         {/* Breadcrumb */}
//         <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
//           <Link href="/admin" className="hover:text-gray-600">
//             Dashboard
//           </Link>
//           <ChevronRight className="h-3.5 w-3.5" />
//           <Link href="/admin/events" className="hover:text-gray-600">
//             Events
//           </Link>
//           <ChevronRight className="h-3.5 w-3.5" />
//           <span className="text-gray-700">Edit: {eventTitle}</span>
//         </div>

//         {loadingEvent ? (
//           // Loading skeleton while event data is fetched
//           <div className="space-y-4 animate-pulse">
//             <div className="h-8 bg-gray-100 rounded w-1/3" />
//             <div className="h-4 bg-gray-50 rounded w-1/2" />
//             <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
//               {[...Array(4)].map((_, i) => (
//                 <div key={i} className="h-12 bg-gray-100 rounded-lg" />
//               ))}
//             </div>
//           </div>
//         ) : (
//           <>
//             <h1 className="text-2xl font-bold text-gray-900 mb-1">
//               {eventTitle}
//             </h1>
//             <p className="text-gray-500 mb-6">
//               Modify details for the upcoming campus event.
//             </p>

//             <form
//               onSubmit={handleSubmit(onSubmit)}
//               noValidate
//               className="space-y-5"
//             >
//               {/* ── General Information ─────────────────────────────────── */}
//               <div className="bg-white rounded-xl border border-gray-200 p-6">
//                 <h2 className="font-bold text-gray-900 mb-5">
//                   General Information
//                 </h2>

//                 <div className="space-y-4">
//                   {/* Title */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                       Event Title
//                     </label>
//                     <input {...register("title")} className={inputCls} />
//                     {errors.title && (
//                       <p className="text-xs text-red-500 mt-1">
//                         {errors.title.message}
//                       </p>
//                     )}
//                   </div>

//                   {/* Category + Location */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                         Event Category
//                       </label>
//                       <div className="relative">
//                         <select
//                           {...register("category_id")}
//                           className={inputCls + " appearance-none"}
//                         >
//                           <option value="">Select a category</option>
//                           {categories.map((c) => (
//                             <option key={c.id} value={c.id}>
//                               {c.name}
//                             </option>
//                           ))}
//                         </select>
//                         <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90 pointer-events-none" />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                         Location
//                       </label>
//                       <input {...register("location")} className={inputCls} />
//                       {errors.location && (
//                         <p className="text-xs text-red-500 mt-1">
//                           {errors.location.message}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Start + End datetime */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                         Start Date &amp; Time
//                       </label>
//                       <input
//                         {...register("event_date")}
//                         type="datetime-local"
//                         className={inputCls}
//                       />
//                       {errors.event_date && (
//                         <p className="text-xs text-red-500 mt-1">
//                           {errors.event_date.message}
//                         </p>
//                       )}
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                         End Date &amp; Time
//                       </label>
//                       <input
//                         {...register("end_date")}
//                         type="datetime-local"
//                         className={inputCls}
//                       />
//                     </div>
//                   </div>

//                   {/* Description */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                       Description
//                     </label>
//                     <textarea
//                       {...register("description")}
//                       rows={5}
//                       className={inputCls + " resize-none"}
//                     />
//                     {errors.description && (
//                       <p className="text-xs text-red-500 mt-1">
//                         {errors.description.message}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* ── Event Logistics ────────────────────────────────────── */}
//               <div className="bg-white rounded-xl border border-gray-200 p-6">
//                 <h2 className="font-bold text-gray-900 mb-5">
//                   Event Logistics
//                 </h2>

//                 <div className="grid grid-cols-3 gap-4">
//                   {/* Capacity */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                       Maximum Capacity
//                     </label>
//                     <input
//                       {...register("max_capacity")}
//                       type="number"
//                       className={inputCls}
//                     />
//                   </div>

//                   {/* Fee */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                       Registration Fee
//                     </label>
//                     <div className="relative">
//                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
//                         $
//                       </span>
//                       <input
//                         {...register("registration_fee")}
//                         type="number"
//                         step="0.01"
//                         className={inputCls + " pl-7"}
//                       />
//                     </div>
//                   </div>

//                   {/* Status — values match backend enum */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                       Status
//                     </label>
//                     <div className="relative">
//                       <select
//                         {...register("status")}
//                         className={inputCls + " appearance-none"}
//                       >
//                         <option value="UPCOMING">Upcoming</option>
//                         <option value="ONGOING">Ongoing</option>
//                         <option value="COMPLETED">Completed</option>
//                         <option value="CANCELLED">Cancelled</option>
//                       </select>
//                       <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90 pointer-events-none" />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* ── Actions ─────────────────────────────────────────────── */}
//               <div className="flex items-center justify-between">
//                 <Link
//                   href="/admin/events"
//                   className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </Link>

//                 <div className="flex items-center gap-3">
//                   <Link
//                     href="/admin/events/create"
//                     className="flex items-center gap-2 px-5 py-2.5 border border-[#1a2744] text-[#1a2744] rounded-lg text-sm font-semibold hover:bg-[#1a2744]/5 transition-colors"
//                   >
//                     <Plus className="h-4 w-4" />
//                     Create New
//                   </Link>

//                   <button
//                     type="submit"
//                     disabled={isSubmitting}
//                     className="flex items-center gap-2 px-6 py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
//                   >
//                     <Save className="h-4 w-4" />
//                     {isSubmitting ? "Saving..." : "Save Changes"}
//                   </button>
//                 </div>
//               </div>
//             </form>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
// Placement: src/app/admin/events/[id]/edit/page.tsx
//
// Added:
//   - tags field (pre-filled from event, sent on save)
//   - Toggle Publish button (POST /admin/events/{id}/toggle-publish)
// No layout or styling changes.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { List, ChevronRight, Plus, Save, Globe, EyeOff } from "lucide-react";
import { getEvent, updateEvent } from "@/services/eventService";
import { getCategories, toggleEventPublish } from "@/services/adminService";
import { extractErrorMessage } from "@/utils/helpers";
import type { Category } from "@/types";
import toast from "react-hot-toast";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category_id: z.string().optional(),
  location: z.string().min(2, "Location must be at least 2 characters"),
  event_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  max_capacity: z.string().optional(),
  registration_fee: z.string().optional(),
  status: z.string().optional(),
  /** Comma-separated tags, e.g. "AI, Ethics, Tech" */
  tags: z.string().optional(),
});

type EditForm = z.infer<typeof schema>;

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [eventTitle, setEventTitle] = useState("Event");
  const [isPublished, setIsPublished] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [togglingPublish, setTogglingPublish] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditForm>({ resolver: zodResolver(schema) });

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => toast.error("Failed to load categories"));

    if (!id) return;

    setLoadingEvent(true);
    getEvent(id)
      .then((ev) => {
        setEventTitle(ev.title);
        setIsPublished(ev.is_published);

        reset({
          title: ev.title,
          category_id:
            typeof ev.category === "object"
              ? (ev.category?.id ?? "")
              : (ev.category ?? ""),
          location: ev.location,
          event_date: ev.event_date ? toDatetimeLocal(ev.event_date) : "",
          end_date: ev.end_date ? toDatetimeLocal(ev.end_date) : "",
          description: ev.description ?? "",
          max_capacity: ev.max_capacity ? String(ev.max_capacity) : "",
          registration_fee: ev.registration_fee
            ? String(ev.registration_fee)
            : "",
          status: ev.status ?? "UPCOMING",
          tags: ev.tags ?? "",
        });
      })
      .catch(() => toast.error("Failed to load event details"))
      .finally(() => setLoadingEvent(false));
  }, [id, reset]);

  // ── Save changes (PATCH) ─────────────────────────────────────────────────
  const onSubmit = async (data: EditForm) => {
    try {
      await updateEvent(id, {
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        location: data.location,
        event_date: data.event_date,
        end_date: data.end_date,
        max_capacity: data.max_capacity,
        registration_fee: data.registration_fee,
        status: data.status,
        tags: data.tags,
      });
      toast.success("Event updated successfully!");
      router.push("/admin/events");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // ── Toggle publish (POST /admin/events/{id}/toggle-publish) ─────────────
  const handleTogglePublish = async () => {
    setTogglingPublish(true);
    try {
      const res = await toggleEventPublish(id);
      setIsPublished(res.is_published);
      toast.success(res.message ?? (res.is_published ? "Event published!" : "Event unpublished"));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setTogglingPublish(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]";

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <List className="h-4 w-4" />
          Edit Event
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              placeholder="Search events..."
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none w-52"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="h-8 w-8 rounded-full bg-orange-400 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
          <Link href="/admin" className="hover:text-gray-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/admin/events" className="hover:text-gray-600">Events</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-700">Edit: {eventTitle}</span>
        </div>

        {loadingEvent ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-50 rounded w-1/2" />
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Title row with publish toggle */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{eventTitle}</h1>
                <p className="text-gray-500">Modify details for the upcoming campus event.</p>
              </div>

              {/* Toggle publish button — logic only, minimal styling matching existing design */}
              <button
                type="button"
                onClick={handleTogglePublish}
                disabled={togglingPublish}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 ${isPublished
                    ? "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100"
                    : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  }`}
              >
                {isPublished ? (
                  <><EyeOff className="h-4 w-4" />{togglingPublish ? "Unpublishing..." : "Unpublish"}</>
                ) : (
                  <><Globe className="h-4 w-4" />{togglingPublish ? "Publishing..." : "Publish"}</>
                )}
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              {/* ── General Information ─────────────────────────────────── */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-5">General Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Title</label>
                    <input {...register("title")} className={inputCls} />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Category</label>
                      <div className="relative">
                        <select {...register("category_id")} className={inputCls + " appearance-none"}>
                          <option value="">Select a category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                      <input {...register("location")} className={inputCls} />
                      {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date &amp; Time</label>
                      <input {...register("event_date")} type="datetime-local" className={inputCls} />
                      {errors.event_date && <p className="text-xs text-red-500 mt-1">{errors.event_date.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date &amp; Time</label>
                      <input {...register("end_date")} type="datetime-local" className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea {...register("description")} rows={5} className={inputCls + " resize-none"} />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                  </div>

                  {/* Tags field — new */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tags{" "}
                      <span className="text-gray-400 font-normal">(comma-separated)</span>
                    </label>
                    <input
                      {...register("tags")}
                      placeholder="e.g. AI, Ethics, Technology, Research"
                      className={inputCls}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Separate multiple tags with commas. Max 500 characters.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Event Logistics ─────────────────────────────────────── */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-5">Event Logistics</h2>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Maximum Capacity</label>
                    <input {...register("max_capacity")} type="number" className={inputCls} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Registration Fee</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input {...register("registration_fee")} type="number" step="0.01" className={inputCls + " pl-7"} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <div className="relative">
                      <select {...register("status")} className={inputCls + " appearance-none"}>
                        <option value="UPCOMING">Upcoming</option>
                        <option value="ONGOING">Ongoing</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Actions ─────────────────────────────────────────────── */}
              <div className="flex items-center justify-between">
                <Link
                  href="/admin/events"
                  className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>

                <div className="flex items-center gap-3">
                  <Link
                    href="/admin/events/create"
                    className="flex items-center gap-2 px-5 py-2.5 border border-[#1a2744] text-[#1a2744] rounded-lg text-sm font-semibold hover:bg-[#1a2744]/5 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Create New
                  </Link>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}