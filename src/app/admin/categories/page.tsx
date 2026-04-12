// "use client";
// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Plus, Pencil, Trash2, Tag, X, Check } from "lucide-react";
// import { getCategories, createCategory, updateCategory, deleteCategory } from "@/services/adminService";
// import { extractErrorMessage } from "@/utils/helpers";
// import type { Category } from "@/types";
// import toast from "react-hot-toast";

// const schema = z.object({
//   name: z.string().min(2, "Category name required"),
//   description: z.string().optional(),
// });
// type CatForm = z.infer<typeof schema>;

// const CAT_COLOURS = ["bg-blue-100 text-blue-700","bg-green-100 text-green-700","bg-purple-100 text-purple-700","bg-orange-100 text-orange-700","bg-teal-100 text-teal-700","bg-pink-100 text-pink-700"];

// export default function CategoriesPage() {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [editing, setEditing] = useState<string | null>(null);
//   const [showForm, setShowForm] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
//     useForm<CatForm>({ resolver: zodResolver(schema) });

//   const load = () => {
//     getCategories().then(setCategories).catch(() => {}).finally(() => setLoading(false));
//   };

//   useEffect(() => { load(); }, []);

//   const onSubmit = async (data: CatForm) => {
//     try {
//       if (editing) {
//         await updateCategory(editing, data);
//         toast.success("Category updated!");
//       } else {
//         await createCategory(data);
//         toast.success("Category created!");
//       }
//       reset(); setEditing(null); setShowForm(false); load();
//     } catch (err) { toast.error(extractErrorMessage(err)); }
//   };

//   const startEdit = (cat: Category) => {
//     setEditing(cat.id); setShowForm(true);
//     setValue("name", cat.name);
//     setValue("description", cat.description ?? "");
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm("Delete this category?")) return;
//     try { await deleteCategory(id); toast.success("Deleted"); load(); }
//     catch { toast.error("Failed to delete"); }
//   };

//   return (
//     <div className="flex-1 bg-gray-50 min-h-screen p-6">
//       <div className="max-w-3xl">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
//             <p className="text-gray-500 mt-1">Organize events by creating and managing categories.</p>
//           </div>
//           <button onClick={() => { setShowForm(!showForm); setEditing(null); reset(); }}
//             className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] transition-colors">
//             {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
//             {showForm ? "Cancel" : "Add Category"}
//           </button>
//         </div>

//         {/* Form */}
//         {showForm && (
//           <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
//             <h2 className="font-bold text-gray-900 mb-4">{editing ? "Edit Category" : "New Category"}</h2>
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name</label>
//                 <input {...register("name")} placeholder="e.g. Academic Workshops"
//                   className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20" />
//                 {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
//                 <textarea {...register("description")} rows={2} placeholder="Brief description of this category..."
//                   className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 resize-none" />
//               </div>
//               <div className="flex justify-end gap-3">
//                 <button type="button" onClick={() => { setShowForm(false); setEditing(null); reset(); }}
//                   className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
//                 <button type="submit" disabled={isSubmitting}
//                   className="flex items-center gap-1.5 px-4 py-2 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60">
//                   <Check className="h-4 w-4" />
//                   {isSubmitting ? "Saving..." : (editing ? "Update" : "Create")}
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}

//         {/* Categories grid */}
//         {loading ? (
//           <div className="grid grid-cols-2 gap-4">
//             {[...Array(6)].map((_,i) => (
//               <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
//                 <div className="h-8 w-8 bg-gray-100 rounded-lg mb-3" />
//                 <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
//                 <div className="h-3 bg-gray-50 rounded w-full" />
//               </div>
//             ))}
//           </div>
//         ) : categories.length === 0 ? (
//           <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
//             <Tag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//             <p className="text-gray-500">No categories yet. Create your first one!</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 gap-4">
//             {categories.map((cat, i) => {
//               const clr = CAT_COLOURS[i % CAT_COLOURS.length];
//               return (
//                 <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow group">
//                   <div className="flex items-start justify-between mb-3">
//                     <div className={`h-9 w-9 rounded-lg ${clr.split(" ")[0]} flex items-center justify-center`}>
//                       <Tag className={`h-4.5 w-4.5 ${clr.split(" ")[1]}`} style={{height:18,width:18}} />
//                     </div>
//                     <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                       <button onClick={() => startEdit(cat)} className="text-gray-400 hover:text-gray-700">
//                         <Pencil className="h-4 w-4" />
//                       </button>
//                       <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-500">
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </div>
//                   <h3 className="font-bold text-gray-900 text-sm">{cat.name}</h3>
//                   {cat.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>}
//                   <p className="text-[10px] text-gray-400 mt-2 uppercase font-semibold tracking-wide">
//                     {cat.event_count ?? 0} Events
//                   </p>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
// Placement: src/app/admin/categories/page.tsx
//
// Full redesign matching the reference dashboard UI.
// Features:
//   - Stats cards (Total, Most Popular, Inactive)
//   - Client-side search
//   - 3-column responsive card grid
//   - Inline create / edit slide-in form panel
//   - "Add New Category" dashed card as last item
//   - Confirmation before delete
//   - Skeleton loaders
//   - No modals — form is inline within the page

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Search,
  TrendingUp,
  EyeOff,
  LayoutGrid,
  BookOpen,
  GraduationCap,
  FlaskConical,
  Megaphone,
  Trophy,
  Users,
  Calendar,
  Clock,
  Check,
  X,
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { timeAgo, cn } from "@/utils/helpers";
import type { Category } from "@/types";

// ── Zod schema ───────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(2, "Category name is required"),
  description: z.string().optional(),
});
type CatForm = z.infer<typeof schema>;

// ── Icon pool — assigned by index so each category gets a consistent icon ────
const CATEGORY_ICONS = [
  Tag,
  BookOpen,
  GraduationCap,
  FlaskConical,
  Megaphone,
  Trophy,
  Users,
  Calendar,
  LayoutGrid,
];

// Soft background colours for the icon tile
const ICON_TILE_COLOURS = [
  "bg-blue-50   text-blue-600",
  "bg-orange-50 text-orange-600",
  "bg-purple-50 text-purple-600",
  "bg-green-50  text-green-600",
  "bg-pink-50   text-pink-600",
  "bg-teal-50   text-teal-600",
  "bg-yellow-50 text-yellow-600",
  "bg-rose-50   text-rose-600",
  "bg-indigo-50 text-indigo-600",
];

// Soft card accent colours (top-gradient strip)
const CARD_ACCENT = [
  "from-blue-50   to-white",
  "from-orange-50 to-white",
  "from-purple-50 to-white",
  "from-green-50  to-white",
  "from-pink-50   to-white",
  "from-teal-50   to-white",
  "from-yellow-50 to-white",
  "from-rose-50   to-white",
  "from-indigo-50 to-white",
];

// ── CategoryCard component ────────────────────────────────────────────────────
interface CategoryCardProps {
  cat: Category;
  index: number;
  onEdit: (cat: Category) => void;
  onDelete: (id: string, name: string) => void;
}

function CategoryCard({ cat, index, onEdit, onDelete }: CategoryCardProps) {
  const Icon = CATEGORY_ICONS[index % CATEGORY_ICONS.length];
  const iconCls = ICON_TILE_COLOURS[index % ICON_TILE_COLOURS.length];
  const accentCls = CARD_ACCENT[index % CARD_ACCENT.length];
  const isActive = (cat.event_count ?? 0) > 0;
  // created_at is on the API response — Category type has it as optional
  const createdAt = (cat as Category & { created_at?: string }).created_at;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Coloured header strip with icon + status badge */}
      <div className={cn("bg-gradient-to-b p-5 pb-4", accentCls)}>
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center bg-white shadow-sm border border-white/60"
            )}
          >
            <Icon className={cn("h-6 w-6", iconCls.split(" ")[1])} />
          </div>
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
              isActive
                ? "text-green-600 bg-green-50 border border-green-100"
                : "text-gray-400 bg-gray-100 border border-gray-200"
            )}
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-base mb-1.5 leading-snug">
          {cat.name}
        </h3>
        {cat.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
            {cat.description}
          </p>
        )}

        {/* Metadata row */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {cat.event_count ?? 0} Event{(cat.event_count ?? 0) !== 1 ? "s" : ""}
          </span>
          {createdAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo(createdAt)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(cat)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={() => onDelete(cat.id, cat.name)}
            className="h-9 w-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
            title="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add-new dashed placeholder card ──────────────────────────────────────────
function AddNewCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border-2 border-dashed border-gray-300 p-8 flex flex-col items-center justify-center gap-3 hover:border-[#1a2744] hover:bg-gray-50 transition-colors min-h-[220px] group"
    >
      <div className="h-12 w-12 rounded-full bg-gray-100 group-hover:bg-[#1a2744]/10 flex items-center justify-center transition-colors">
        <Plus className="h-6 w-6 text-gray-400 group-hover:text-[#1a2744] transition-colors" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-gray-400 group-hover:text-gray-700 transition-colors">
          Add New Category
        </p>
        <p className="text-xs text-gray-300 group-hover:text-gray-400 transition-colors mt-0.5">
          Create a new classification
        </p>
      </div>
    </button>
  );
}

// ── Stats card ────────────────────────────────────────────────────────────────
interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconCls: string;
}

function StatsCard({ label, value, icon: Icon, iconCls }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900 leading-none">{value}</p>
        </div>
        <Icon className={cn("h-6 w-6 mt-1", iconCls)} />
      </div>
    </div>
  );
}

// ── Inline form panel ─────────────────────────────────────────────────────────
interface FormPanelProps {
  editing: Category | null;
  onClose: () => void;
  onSubmit: (data: CatForm) => Promise<void>;
}

function FormPanel({ editing, onClose, onSubmit }: FormPanelProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CatForm>({ resolver: zodResolver(schema) });

  const inputCls =
    "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744] bg-white";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-gray-900 text-lg">
          {editing ? "Edit Category" : "New Category"}
        </h2>
        <button
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Category Name <span className="text-red-400">*</span>
          </label>
          <input
            {...register("name")}
            defaultValue={editing?.name ?? ""}
            placeholder="e.g. Academic Workshops"
            className={inputCls}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            {...register("description")}
            defaultValue={editing?.description ?? ""}
            rows={3}
            placeholder="Brief description of this category..."
            className={inputCls + " resize-none"}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
          >
            <Check className="h-4 w-4" />
            {isSubmitting ? "Saving..." : editing ? "Update Category" : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Confirm delete dialog (lightweight inline, no modal library) ──────────────
interface ConfirmDeleteProps {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDeleteBanner({ name, onConfirm, onCancel }: ConfirmDeleteProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
      <div>
        <p className="font-semibold text-red-700 text-sm">
          Delete &ldquo;{name}&rdquo;?
        </p>
        <p className="text-xs text-red-500 mt-0.5">
          This will permanently remove the category and cannot be undone.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const { filtered, total, loading, search, setSearch, actions } =
    useCategories();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Search input ref for debounce
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => setSearch(value), 200);
  };

  useEffect(() => () => { if (searchRef.current) clearTimeout(searchRef.current); }, []);

  // ── Stats derived values ───────────────────────────────────────────────
  const mostPopular = filtered.reduce<Category | null>(
    (best, c) =>
      best === null || (c.event_count ?? 0) > (best.event_count ?? 0) ? c : best,
    null
  );
  const inactiveCount = filtered.filter((c) => (c.event_count ?? 0) === 0).length;

  // ── Form handlers ──────────────────────────────────────────────────────
  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setShowForm(true); };
  const closeForm = () => { setEditing(null); setShowForm(false); };

  const handleFormSubmit = async (data: CatForm) => {
    const result = editing
      ? await actions.update(editing.id, data)
      : await actions.create(data);
    if (result) closeForm();
  };

  // ── Delete handlers ────────────────────────────────────────────────────
  const requestDelete = (id: string, name: string) =>
    setDeleteTarget({ id, name });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await actions.remove(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30"
          />
        </div>

        {/* Create button */}
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] transition-colors ml-4"
        >
          <Plus className="h-4 w-4" />
          Create New Category
        </button>
      </header>

      <div className="p-6 max-w-6xl">
        {/* ── Page heading ────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Event Categories</h1>
          <p className="text-gray-500 mt-1">
            Organize and classify campus activities efficiently.
          </p>
        </div>

        {/* ── Stats row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatsCard
            label="Total Categories"
            value={total}
            icon={LayoutGrid}
            iconCls="text-[#1a2744]"
          />
          <StatsCard
            label="Most Popular"
            value={mostPopular?.name ?? "—"}
            icon={TrendingUp}
            iconCls="text-green-500"
          />
          <StatsCard
            label="Inactive"
            value={inactiveCount}
            icon={EyeOff}
            iconCls="text-gray-400"
          />
        </div>

        {/* ── Inline form panel ────────────────────────────────────────── */}
        {showForm && (
          <FormPanel
            editing={editing}
            onClose={closeForm}
            onSubmit={handleFormSubmit}
          />
        )}

        {/* ── Delete confirmation banner ───────────────────────────────── */}
        {deleteTarget && (
          <ConfirmDeleteBanner
            name={deleteTarget.name}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}

        {/* ── Categories grid ──────────────────────────────────────────── */}
        {loading ? (
          // Skeleton grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
              >
                <div className="h-12 w-12 bg-gray-100 rounded-xl mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-50 rounded w-full mb-1" />
                <div className="h-3 bg-gray-50 rounded w-4/5 mb-4" />
                <div className="h-8 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 && search.trim() !== "" ? (
          // No search results
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">
              No categories match &ldquo;{search}&rdquo;
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Try a different search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                index={i}
                onEdit={openEdit}
                onDelete={requestDelete}
              />
            ))}

            {/* "Add New Category" dashed card — always last */}
            <AddNewCard onClick={openCreate} />
          </div>
        )}
      </div>
    </div>
  );
}