"use client";
// Placement: src/app/admin/settings/page.tsx
//
// Fully API-driven. All values from GET /admin/settings.
// Save via PUT /admin/settings.
// No dummy/static data.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, ChevronRight, HardDrive, ImageIcon, RefreshCw, AlertTriangle } from "lucide-react";
import { useSystemSettings } from "@/hooks/useAuditLogsAndSettings";
import { cn, formatDate } from "@/utils/helpers";
import type { SystemSettings } from "@/types";

const TABS = ["General Settings", "Notifications", "Security", "Maintenance"] as const;
type Tab = (typeof TABS)[number];

// ── Toggle component ──────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-[#1a2744]" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 bg-white rounded-full shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function FieldSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-24 mb-2" />
      <div className="h-11 bg-gray-100 rounded-lg w-full" />
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]";

export default function SystemSettingsPage() {
  const { settings, loading, saving, error, save, refetch } = useSystemSettings();
  const [activeTab, setActiveTab] = useState<Tab>("General Settings");

  // Local editable state — mirrors the API response
  const [draft, setDraft] = useState<Partial<SystemSettings>>({});

  // Populate draft whenever settings load
  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  const set = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    // Only send the fields the PUT endpoint accepts
    await save({
      registration_enabled: draft.registration_enabled ?? true,
      site_name: draft.site_name ?? "",
      site_description: draft.site_description ?? "",
      contact_email: draft.contact_email ?? "",
      max_registrations_per_event: draft.max_registrations_per_event ?? 0,
      send_registration_emails: draft.send_registration_emails ?? true,
      send_cancellation_emails: draft.send_cancellation_emails ?? true,
      maintenance_mode: draft.maintenance_mode ?? false,
      maintenance_message: draft.maintenance_message ?? "",
    });
  };

  // ── Error state ───────────────────────────────────────────────────────────
  if (error && !settings) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold mb-4">Failed to load settings</p>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a2744] text-white text-sm font-semibold rounded-lg mx-auto"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-6">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500 mt-0.5">
            Configure global university event preferences and security policies.
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Last updated */}
      {settings?.updated_at && (
        <p className="text-xs text-gray-400 mb-5">
          Last updated: {formatDate(settings.updated_at)}
        </p>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-3 text-sm font-medium transition-colors",
              activeTab === tab
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Main content ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* ── GENERAL SETTINGS tab ─────────────────────────────────── */}
          {activeTab === "General Settings" && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-1">General Information</h2>
                <p className="text-sm text-gray-400 mb-5">
                  Global identity settings for the campus portal.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {loading ? (
                    <>
                      <FieldSkeleton /><FieldSkeleton />
                      <FieldSkeleton /><FieldSkeleton />
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Site Name
                        </label>
                        <input
                          value={draft.site_name ?? ""}
                          onChange={(e) => set("site_name", e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Contact Email
                        </label>
                        <input
                          value={draft.contact_email ?? ""}
                          onChange={(e) => set("contact_email", e.target.value)}
                          className={inputCls}
                          type="email"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Site Description
                        </label>
                        <textarea
                          value={draft.site_description ?? ""}
                          onChange={(e) => set("site_description", e.target.value)}
                          rows={2}
                          className={inputCls + " resize-none"}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Max Registrations per Event
                        </label>
                        <input
                          value={draft.max_registrations_per_event ?? ""}
                          onChange={(e) => set("max_registrations_per_event", Number(e.target.value))}
                          type="number"
                          min={0}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          University Name
                        </label>
                        <input
                          value={draft.university_name ?? ""}
                          onChange={(e) => set("university_name", e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* University Logo */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-5">University Logo</h2>
                <div className="flex items-start gap-5">
                  <div className="h-20 w-20 rounded-xl bg-teal-800 flex items-center justify-center shrink-0 border-2 border-gray-200 overflow-hidden">
                    {settings?.university_logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={settings.university_logo} alt="Logo" className="object-cover w-full h-full" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-white/50" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Upload a high-resolution logo for brand consistency across all reports and emails.
                      Recommended size: 512×512px.
                    </p>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] transition-colors">
                        Upload New
                      </button>
                      {settings?.university_logo && (
                        <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration toggle */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-5">Registration Settings</h2>
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Event Registration</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Allow students to register for events on the platform.
                    </p>
                  </div>
                  <Toggle
                    checked={draft.registration_enabled ?? true}
                    onChange={(v) => set("registration_enabled", v)}
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

          {/* ── NOTIFICATIONS tab ────────────────────────────────────── */}
          {activeTab === "Notifications" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-1">System Notifications</h2>
              <p className="text-sm text-gray-400 mb-5">
                Configure how users are notified about activities.
              </p>
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-12 bg-gray-100 rounded-lg" />
                  <div className="h-12 bg-gray-100 rounded-lg" />
                </div>
              ) : (
                <div className="space-y-5">
                  {[
                    {
                      key: "send_registration_emails" as keyof SystemSettings,
                      label: "Registration Emails",
                      desc: "Notify users upon successful event registration.",
                    },
                    {
                      key: "send_cancellation_emails" as keyof SystemSettings,
                      label: "Cancellation Emails",
                      desc: "Notify users when their registration is cancelled.",
                    },
                    {
                      key: "event_reminder_enabled" as keyof SystemSettings,
                      label: "Event Reminders",
                      desc: "Send automated email reminders 24 hours before events start.",
                    },
                    {
                      key: "registration_confirmation_enabled" as keyof SystemSettings,
                      label: "Registration Confirmations",
                      desc: "Send confirmation emails after every registration.",
                    },
                    {
                      key: "event_update_notifications" as keyof SystemSettings,
                      label: "Event Update Notifications",
                      desc: "Notify registrants when event details change.",
                    },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-1">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                      </div>
                      <Toggle
                        checked={Boolean(draft[key])}
                        onChange={(v) => set(key, v as SystemSettings[typeof key])}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SECURITY tab ─────────────────────────────────────────── */}
          {activeTab === "Security" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-1">Security Settings</h2>
              <p className="text-sm text-gray-400 mb-5">
                Configure authentication and security policies.
              </p>
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg" />)}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Two-Factor Enforcement</p>
                      <p className="text-xs text-gray-400 mt-0.5">Require 2FA for all admin accounts.</p>
                    </div>
                    <Toggle
                      checked={draft.two_factor_enforcement ?? false}
                      onChange={(v) => set("two_factor_enforcement", v)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">SSL Enabled</p>
                      <p className="text-xs text-gray-400 mt-0.5">Enforce HTTPS across all connections.</p>
                    </div>
                    <Toggle
                      checked={draft.ssl_enabled ?? true}
                      onChange={(v) => set("ssl_enabled", v)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Session Timeout (minutes)
                    </label>
                    <input
                      value={draft.session_timeout_minutes ?? ""}
                      onChange={(e) => set("session_timeout_minutes", Number(e.target.value))}
                      type="number"
                      min={5}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Max Login Attempts
                    </label>
                    <input
                      value={draft.max_login_attempts ?? ""}
                      onChange={(e) => set("max_login_attempts", Number(e.target.value))}
                      type="number"
                      min={1}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MAINTENANCE tab ──────────────────────────────────────── */}
          {activeTab === "Maintenance" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-1">Maintenance Mode</h2>
              <p className="text-sm text-gray-400 mb-5">
                Enable to take the system offline for maintenance.
              </p>
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-12 bg-gray-100 rounded-lg" />
                  <div className="h-24 bg-gray-100 rounded-lg" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Maintenance Mode</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        When enabled, users see a maintenance message instead of the app.
                      </p>
                    </div>
                    <Toggle
                      checked={draft.maintenance_mode ?? false}
                      onChange={(v) => set("maintenance_mode", v)}
                    />
                  </div>

                  {draft.maintenance_mode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Maintenance Message
                      </label>
                      <textarea
                        value={draft.maintenance_message ?? ""}
                        onChange={(e) => set("maintenance_message", e.target.value)}
                        rows={3}
                        className={inputCls + " resize-none"}
                        placeholder="The system is under maintenance. Please try again later."
                      />
                    </div>
                  )}

                  {/* Backup info */}
                  {settings?.last_backup_at && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
                        Last Backup
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(settings.last_backup_at)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right sidebar ────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Security status — live from settings */}
          <div className="bg-[#1a2744] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-white" />
              <h3 className="font-bold text-white">Security Status</h3>
            </div>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 bg-white/10 rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  {
                    label: "2FA Enforcement",
                    active: settings?.two_factor_enforcement ?? false,
                    activeLabel: "ACTIVE",
                    inactiveLabel: "DISABLED",
                  },
                  {
                    label: "SSL Encryption",
                    active: settings?.ssl_enabled ?? false,
                    activeLabel: "VERIFIED",
                    inactiveLabel: "DISABLED",
                  },
                ].map(({ label, active, activeLabel, inactiveLabel }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-blue-200 text-sm">{label}</span>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded",
                        active ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      )}
                    >
                      {active ? activeLabel : inactiveLabel}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <span className="text-blue-200 text-sm">Session Timeout</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-600 text-white">
                    {settings?.session_timeout_minutes ?? "—"} MIN
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* System maintenance card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-3">System Maintenance</h3>
            <div className="flex items-center gap-2 mb-1">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  settings?.maintenance_mode ? "bg-yellow-500" : "bg-green-500"
                )}
              />
              <p className="text-sm font-medium text-gray-700">
                {settings?.maintenance_mode ? "Maintenance mode active" : "All systems operational"}
              </p>
            </div>
            {settings?.last_backup_at && (
              <p className="text-xs text-gray-400 mb-4">
                Last backup: {formatDate(settings.last_backup_at)}
              </p>
            )}
            <div className="space-y-1">
              {/* Schedule Maintenance → switches to the Maintenance tab */}
              <button
                onClick={() => setActiveTab("Maintenance")}
                className="w-full flex items-center justify-between py-2.5 text-sm text-gray-700 hover:text-gray-900 border-b border-gray-100 transition-colors"
              >
                <span>Schedule Maintenance</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>

              {/* View System Logs → navigates to the audit-logs page */}
              <Link
                href="/admin/audit-logs"
                className="w-full flex items-center justify-between py-2.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                <span>View System Logs</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1a2744] text-white font-bold rounded-xl hover:bg-[#0f1a35] disabled:opacity-60 transition-colors"
          >
            <HardDrive className="h-4 w-4" />
            {saving ? "Saving..." : "Save All Changes"}
          </button>
          <button
            onClick={() => settings && setDraft(settings)}
            disabled={saving}
            className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Discard changes
          </button>
        </div>
      </div>
    </div>
  );
}