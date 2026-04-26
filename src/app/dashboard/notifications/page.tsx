"use client";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, SlidersHorizontal, Clock, CheckCircle, AlertTriangle, Megaphone, CreditCard, RotateCcw, ChevronDown } from "lucide-react";
import { getNotifications, markAllAsRead, markAsRead } from "@/services/notificationService";
import { timeAgo, cn } from "@/utils/helpers";
import type { Notification } from "@/types";
import toast from "react-hot-toast";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; iconBg: string; iconColor: string; labelColor: string; label: string }> = {
  SYSTEM: { icon: Clock, iconBg: "bg-[#1a2744]", iconColor: "text-white", labelColor: "text-[#1a2744]", label: "Event Reminder" },
  EVENT: { icon: CheckCircle, iconBg: "bg-green-100", iconColor: "text-green-600", labelColor: "text-green-600", label: "Registration" },
  ANNOUNCEMENT: { icon: Megaphone, iconBg: "bg-gray-100", iconColor: "text-gray-500", labelColor: "text-gray-500", label: "Campus News" },
  BILLING: { icon: AlertTriangle, iconBg: "bg-red-100", iconColor: "text-red-500", labelColor: "text-red-500", label: "Billing" },
  WARNING: { icon: AlertTriangle, iconBg: "bg-yellow-100", iconColor: "text-yellow-500", labelColor: "text-yellow-500", label: "System Announcement" },
  REMINDER: { icon: RotateCcw, iconBg: "bg-gray-100", iconColor: "text-gray-500", labelColor: "text-gray-400", label: "Feedback Request" },
};

const TABS = ["All Notifications", "Events", "System"];

const STATIC_NOTIFICATIONS = [
  { id:"1", title:"Workshop: Career Fair Prep", message:"Don't forget the workshop starting in 1 hour at Main Hall.", notification_type:"SYSTEM", is_read:false, created_at:new Date(Date.now()-120000).toISOString() },
  { id:"2", title:"Registration Confirmed: Hackathon 2024", message:"Your spot is secured! View your digital ticket and pre-event materials in the events tab.", notification_type:"EVENT", is_read:true, created_at:new Date(Date.now()-3600000).toISOString() },
  { id:"3", title:"Maintenance Schedule: Portal Update", message:"The Student Portal will be offline for scheduled maintenance this Saturday from 02:00 AM to 05:00 AM EST.", notification_type:"WARNING", is_read:true, created_at:new Date(Date.now()-14400000).toISOString() },
  { id:"4", title:"New Event: International Food Festival", message:"A new event matching your interests has been posted. Discover flavors from around the world next Friday.", notification_type:"ANNOUNCEMENT", is_read:true, created_at:new Date(Date.now()-86400000).toISOString() },
  { id:"5", title:"Unsuccessful Payment Attempt", message:"The payment for \"Advanced Photography Seminar\" could not be processed. Please update your payment method.", notification_type:"BILLING", is_read:true, created_at:new Date(Date.now()-172800000).toISOString() },
  { id:"6", title:"Survey: Career Center Feedback", message:"We'd love to hear about your experience with our career counseling services last month.", notification_type:"REMINDER", is_read:true, created_at:new Date(Date.now()-604800000).toISOString() },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState("All Notifications");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .then(r => setNotifications(r.results))
      .catch(() => setNotifications(STATIC_NOTIFICATIONS as unknown as Notification[]))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success("All marked as read");
    } catch { /* silent */ }
  };

  const handleRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch { /* silent */ }
  };

  const display = notifications.length > 0 ? notifications : STATIC_NOTIFICATIONS as unknown as Notification[];

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center gap-4">
        <Bell className="h-5 w-5 text-gray-700" />
        <h1 className="font-bold text-gray-900">Notifications</h1>
        <div className="flex-1 max-w-xs ml-4">
          <div className="relative">
            <input placeholder="Search notifications..." className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30" />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={handleMarkAll} className="h-8 w-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50" title="Mark all as read">
            <CheckCheck className="h-4 w-4" />
          </button>
          <button className="h-8 w-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <div className="h-8 w-8 rounded-full bg-orange-400 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-0">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("pb-3 text-sm font-medium transition-colors",
                activeTab === tab ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400 hover:text-gray-600")}>
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-b-xl divide-y divide-gray-100">
          {display.map((n) => {
            const config = TYPE_CONFIG[n.notification_type] ?? TYPE_CONFIG.SYSTEM;
            const Icon = config.icon;
            return (
              <div key={n.id}
                onClick={() => !n.is_read && handleRead(n.id)}
                className={cn("flex items-start gap-4 px-5 py-5 transition-colors cursor-pointer",
                  !n.is_read ? "bg-blue-50/50 hover:bg-blue-50" : "hover:bg-gray-50")}>
                <div className={`h-12 w-12 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${config.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${config.labelColor}`}>
                        {config.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <p className="text-xs text-gray-400">{timeAgo(n.created_at)}</p>
                      {!n.is_read && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button className="w-full mt-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1.5 border border-gray-200 rounded-xl bg-white">
          View older notifications <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
