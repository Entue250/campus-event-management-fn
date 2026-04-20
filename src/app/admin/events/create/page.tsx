// "use client";
// // Placement: src/app/admin/events/create/page.tsx
// //
// // Uses createEvent() from eventService which sends multipart/form-data.
// // Field mapping (handled inside buildEventFormData in eventService):
// //   form.category_id  → FormData "category"
// //   form.max_capacity → FormData "capacity"
// // No UI changes — only logic and API integration updated.

// import { useEffect, useState, useRef } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import {
//   Info,
//   Clock,
//   ImageIcon,
//   MapPin,
//   Upload,
//   ChevronRight,
// } from "lucide-react";
// import { createEvent } from "@/services/eventService";
// import { getCategories } from "@/services/adminService";
// import { extractErrorMessage } from "@/utils/helpers";
// import type { Category } from "@/types";
// import toast from "react-hot-toast";

// // ── Zod validation schema ────────────────────────────────────────────────────
// const schema = z.object({
//   title: z.string().min(3, "Title must be at least 3 characters"),
//   description: z.string().min(10, "Description must be at least 10 characters"),
//   category_id: z.string().min(1, "Please select a category"),
//   organizer: z.string().optional(),
//   event_date: z.string().min(1, "Event date is required"),
//   start_time: z.string().optional(),
//   end_time: z.string().optional(),
//   location: z.string().min(2, "Location must be at least 2 characters"),
//   max_capacity: z.string().optional(),
//   registration_fee: z.string().optional(),
// });

// type CreateForm = z.infer<typeof schema>;

// export default function CreateEventPage() {
//   const router = useRouter();
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [posterFile, setPosterFile] = useState<File | null>(null);
//   const [posterPreview, setPosterPreview] = useState<string | null>(null);
//   const fileRef = useRef<HTMLInputElement>(null);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<CreateForm>({ resolver: zodResolver(schema) });

//   // Load categories for the dropdown
//   useEffect(() => {
//     getCategories()
//       .then(setCategories)
//       .catch(() => toast.error("Failed to load categories"));
//   }, []);

//   // ── Image preview helpers ────────────────────────────────────────────────
//   const handleFile = (f: File) => {
//     setPosterFile(f);
//     setPosterPreview(URL.createObjectURL(f));
//   };

//   const onDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     const f = e.dataTransfer.files[0];
//     if (f) handleFile(f);
//   };

//   // ── Form submission ──────────────────────────────────────────────────────
//   // publish=true  → is_published: true  (live immediately)
//   // publish=false → is_published: false (saved as draft)
//   const onSubmit = async (data: CreateForm, publish: boolean) => {
//     try {
//       // Combine date + time into an ISO-like datetime string expected by backend
//       const eventDatetime = data.start_time
//         ? `${data.event_date}T${data.start_time}`
//         : data.event_date;

//       const endDatetime =
//         data.end_time ? `${data.event_date}T${data.end_time}` : undefined;

//       await createEvent({
//         title: data.title,
//         description: data.description,
//         category_id: data.category_id,       // mapped → "category" in FormData
//         organizer: data.organizer,
//         event_date: eventDatetime,
//         end_date: endDatetime,
//         location: data.location,
//         max_capacity: data.max_capacity,      // mapped → "capacity" in FormData
//         registration_fee: data.registration_fee,
//         is_published: publish,
//         banner_image: posterFile ?? undefined,
//       });

//       toast.success(publish ? "Event published!" : "Draft saved successfully!");
//       router.push("/admin/events");
//     } catch (err) {
//       toast.error(extractErrorMessage(err));
//     }
//   };

//   return (
//     <div className="flex-1 bg-gray-50 min-h-screen">
//       {/* ── Header ──────────────────────────────────────────────────────── */}
//       <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
//         <h1 className="font-semibold text-gray-900">Create New Event</h1>
//         <div className="flex items-center gap-3">
//           <button className="h-8 w-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
//             <svg
//               className="h-4 w-4"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//               />
//             </svg>
//           </button>
//           <div className="h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center">
//             <span className="text-white text-xs font-bold">A</span>
//           </div>
//         </div>
//       </header>

//       <div className="p-6 max-w-4xl mx-auto">
//         {/* Breadcrumb */}
//         <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
//           <Link href="/admin/events" className="hover:text-gray-600">
//             Events
//           </Link>
//           <ChevronRight className="h-3.5 w-3.5" />
//           <span className="text-gray-700">Create Event</span>
//         </div>

//         <h2 className="text-2xl font-bold text-gray-900 mb-1">
//           Post an Event
//         </h2>
//         <p className="text-gray-500 mb-6">
//           Fill in the official details to broadcast this event to the campus
//           community.
//         </p>

//         <form noValidate>
//           {/* ── General Information ─────────────────────────────────────── */}
//           <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
//             <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
//               <div className="h-6 w-6 rounded-full bg-[#1a2744] flex items-center justify-center">
//                 <Info className="h-3.5 w-3.5 text-white" />
//               </div>
//               General Information
//             </h3>

//             <div className="space-y-4">
//               {/* Title */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                   Event Title
//                 </label>
//                 <input
//                   {...register("title")}
//                   placeholder="e.g. Annual Tech Symposium 2024"
//                   className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]"
//                 />
//                 {errors.title && (
//                   <p className="text-xs text-red-500 mt-1">
//                     {errors.title.message}
//                   </p>
//                 )}
//               </div>

//               {/* Description */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                   Event Description
//                 </label>
//                 <textarea
//                   {...register("description")}
//                   rows={5}
//                   placeholder="Provide a detailed description of the event, itinerary, and guest speakers..."
//                   className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744] resize-none"
//                 />
//                 {errors.description && (
//                   <p className="text-xs text-red-500 mt-1">
//                     {errors.description.message}
//                   </p>
//                 )}
//               </div>

//               {/* Category + Organizer */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                     Category
//                   </label>
//                   <div className="relative">
//                     <select
//                       {...register("category_id")}
//                       className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 appearance-none bg-white"
//                     >
//                       <option value="">Select a category</option>
//                       {categories.map((c) => (
//                         <option key={c.id} value={c.id}>
//                           {c.name}
//                         </option>
//                       ))}
//                     </select>
//                     <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90 pointer-events-none" />
//                   </div>
//                   {errors.category_id && (
//                     <p className="text-xs text-red-500 mt-1">
//                       {errors.category_id.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                     Organizer
//                   </label>
//                   <input
//                     {...register("organizer")}
//                     placeholder="e.g. Student Council / Computer Society"
//                     className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ── Date, Time & Poster ─────────────────────────────────────── */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
//             {/* Date / Time / Venue */}
//             <div className="bg-white rounded-xl border border-gray-200 p-6">
//               <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
//                 <div className="h-6 w-6 rounded-full bg-[#1a2744] flex items-center justify-center">
//                   <Clock className="h-3.5 w-3.5 text-white" />
//                 </div>
//                 Date, Time &amp; Venue
//               </h3>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                     Event Date
//                   </label>
//                   <input
//                     {...register("event_date")}
//                     type="date"
//                     className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20"
//                   />
//                   {errors.event_date && (
//                     <p className="text-xs text-red-500 mt-1">
//                       {errors.event_date.message}
//                     </p>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                       Start Time
//                     </label>
//                     <input
//                       {...register("start_time")}
//                       type="time"
//                       className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                       End Time
//                     </label>
//                     <input
//                       {...register("end_time")}
//                       type="time"
//                       className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                     Location
//                   </label>
//                   <div className="relative">
//                     <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <input
//                       {...register("location")}
//                       placeholder="e.g. Main Auditorium, Building B"
//                       className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20"
//                     />
//                   </div>
//                   {errors.location && (
//                     <p className="text-xs text-red-500 mt-1">
//                       {errors.location.message}
//                     </p>
//                   )}
//                 </div>

//                 {/* Capacity & Fee */}
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                       Max Capacity
//                     </label>
//                     <input
//                       {...register("max_capacity")}
//                       type="number"
//                       placeholder="e.g. 200"
//                       className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                       Registration Fee
//                     </label>
//                     <input
//                       {...register("registration_fee")}
//                       type="number"
//                       step="0.01"
//                       placeholder="0.00"
//                       className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Event Poster upload */}
//             <div className="bg-white rounded-xl border border-gray-200 p-6">
//               <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
//                 <div className="h-6 w-6 rounded-full bg-[#1a2744] flex items-center justify-center">
//                   <ImageIcon className="h-3.5 w-3.5 text-white" />
//                 </div>
//                 Event Poster
//               </h3>

//               <div
//                 onDrop={onDrop}
//                 onDragOver={(e) => e.preventDefault()}
//                 onClick={() => fileRef.current?.click()}
//                 className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#1a2744]/30 hover:bg-gray-50 transition-colors"
//               >
//                 {posterPreview ? (
//                   <img
//                     src={posterPreview}
//                     alt="Preview"
//                     className="max-h-32 mx-auto rounded-lg object-contain"
//                   />
//                 ) : (
//                   <>
//                     <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
//                       <Upload className="h-6 w-6 text-gray-400" />
//                     </div>
//                     <p className="font-semibold text-gray-700 text-sm">
//                       Click or drag to upload
//                     </p>
//                     <p className="text-xs text-gray-400 mt-1">
//                       PNG, JPG or JPEG (Max. 5MB)
//                     </p>
//                   </>
//                 )}
//                 <input
//                   ref={fileRef}
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={(e) => {
//                     const f = e.target.files?.[0];
//                     if (f) handleFile(f);
//                   }}
//                 />
//               </div>

//               {!posterPreview && (
//                 <button
//                   type="button"
//                   onClick={() => fileRef.current?.click()}
//                   className="mt-3 w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
//                 >
//                   Select File
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* ── Action buttons ──────────────────────────────────────────── */}
//           <div className="flex items-center justify-between">
//             <button
//               type="button"
//               onClick={handleSubmit((d) => onSubmit(d, false))}
//               disabled={isSubmitting}
//               className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
//             >
//               Save as Draft
//             </button>

//             <div className="flex items-center gap-3">
//               <Link
//                 href="/admin/events"
//                 className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-900"
//               >
//                 Cancel
//               </Link>
//               <button
//                 type="button"
//                 onClick={handleSubmit((d) => onSubmit(d, true))}
//                 disabled={isSubmitting}
//                 className="flex items-center gap-2 px-6 py-3 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
//               >
//                 <ChevronRight className="h-4 w-4" />
//                 {isSubmitting ? "Publishing..." : "Publish Event"}
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";
// Placement: src/app/admin/events/create/page.tsx
//
// Added: tags field (comma-separated string sent to backend as "tags")
// No other UI changes.

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Info,
  Clock,
  ImageIcon,
  MapPin,
  Upload,
  ChevronRight,
  Tag,
} from "lucide-react";
import { createEvent } from "@/services/eventService";
import { getCategories } from "@/services/adminService";
import { extractErrorMessage } from "@/utils/helpers";
import type { Category } from "@/types";
import toast from "react-hot-toast";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category_id: z.string().min(1, "Please select a category"),
  organizer: z.string().optional(),
  event_date: z.string().min(1, "Event date is required"),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  location: z.string().min(2, "Location must be at least 2 characters"),
  max_capacity: z.string().optional(),
  registration_fee: z.string().optional(),
  /** Comma-separated tags, e.g. "AI, Ethics, Tech" */
  tags: z.string().optional(),
});

type CreateForm = z.infer<typeof schema>;

export default function CreateEventPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({ resolver: zodResolver(schema) });

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const handleFile = (f: File) => {
    setPosterFile(f);
    setPosterPreview(URL.createObjectURL(f));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const onSubmit = async (data: CreateForm, publish: boolean) => {
    try {
      const eventDatetime = data.start_time
        ? `${data.event_date}T${data.start_time}`
        : data.event_date;
      const endDatetime = data.end_time
        ? `${data.event_date}T${data.end_time}`
        : undefined;

      await createEvent({
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        organizer: data.organizer,
        event_date: eventDatetime,
        end_date: endDatetime,
        location: data.location,
        max_capacity: data.max_capacity,
        registration_fee: data.registration_fee,
        is_published: publish,
        banner_image: posterFile ?? undefined,
        tags: data.tags,
      });

      toast.success(publish ? "Event published!" : "Draft saved successfully!");
      router.push("/admin/events");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const inputCls =
    "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]";

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <h1 className="font-semibold text-gray-900">Create New Event</h1>
        <div className="flex items-center gap-3">
          <button className="h-8 w-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
          <Link href="/admin/events" className="hover:text-gray-600">Events</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-700">Create Event</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Post an Event</h2>
        <p className="text-gray-500 mb-6">
          Fill in the official details to broadcast this event to the campus community.
        </p>

        <form noValidate>
          {/* ── General Information ─────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[#1a2744] flex items-center justify-center">
                <Info className="h-3.5 w-3.5 text-white" />
              </div>
              General Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Title</label>
                <input {...register("title")} placeholder="e.g. Annual Tech Symposium 2024" className={inputCls} />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Description</label>
                <textarea
                  {...register("description")}
                  rows={5}
                  placeholder="Provide a detailed description of the event, itinerary, and guest speakers..."
                  className={inputCls + " resize-none"}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <div className="relative">
                    <select {...register("category_id")} className={inputCls + " appearance-none"}>
                      <option value="">Select a category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                  {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Organizer</label>
                  <input {...register("organizer")} placeholder="e.g. Student Council / Computer Society" className={inputCls} />
                </div>
              </div>

              {/* Tags field — new */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-gray-400" />
                  Tags
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

          {/* ── Date, Time & Poster ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#1a2744] flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 text-white" />
                </div>
                Date, Time &amp; Venue
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Date</label>
                  <input {...register("event_date")} type="date" className={inputCls} />
                  {errors.event_date && <p className="text-xs text-red-500 mt-1">{errors.event_date.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                    <input {...register("start_time")} type="time" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                    <input {...register("end_time")} type="time" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input {...register("location")} placeholder="e.g. Main Auditorium, Building B" className={inputCls + " pl-9"} />
                  </div>
                  {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Capacity</label>
                    <input {...register("max_capacity")} type="number" placeholder="e.g. 200" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Registration Fee</label>
                    <input {...register("registration_fee")} type="number" step="0.01" placeholder="0.00" className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            {/* Event Poster */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#1a2744] flex items-center justify-center">
                  <ImageIcon className="h-3.5 w-3.5 text-white" />
                </div>
                Event Poster
              </h3>

              <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#1a2744]/30 hover:bg-gray-50 transition-colors"
              >
                {posterPreview ? (
                  <img src={posterPreview} alt="Preview" className="max-h-32 mx-auto rounded-lg object-contain" />
                ) : (
                  <>
                    <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-700 text-sm">Click or drag to upload</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG or JPEG (Max. 5MB)</p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>

              {!posterPreview && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-3 w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Select File
                </button>
              )}
            </div>
          </div>

          {/* ── Actions ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleSubmit((d) => onSubmit(d, false))}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              Save as Draft
            </button>

            <div className="flex items-center gap-3">
              <Link href="/admin/events" className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-900">
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleSubmit((d) => onSubmit(d, true))}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
                {isSubmitting ? "Publishing..." : "Publish Event"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}