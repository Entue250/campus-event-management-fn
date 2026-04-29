"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, GraduationCap, Mail, Phone, MapPin, Info, Ticket, Settings2, ChevronRight, Globe, HelpCircle, Download, CheckCircle, ExternalLink } from "lucide-react";
import { submitTicket } from "@/services/supportService";
import { extractErrorMessage } from "@/utils/helpers";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  category: z.enum(["GENERAL","TECHNICAL","REGISTRATION","BILLING","OTHER"]),
  message: z.string().min(10),
});
type SupportForm = z.infer<typeof schema>;

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<SupportForm>({ resolver: zodResolver(schema), defaultValues: { category: "GENERAL" } });

  const onSubmit = async (data: SupportForm) => {
    try {
      await submitTicket(data);
      setSubmitted(true);
      toast.success("Support ticket submitted!");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#1a2744] flex items-center justify-center">
              <GraduationCap style={{height:16,width:16,color:'white'}} />
            </div>
            <span className="font-bold text-gray-900 text-sm">Campus Events Support</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link href="/events" className="hover:text-gray-900">Browse Events</Link>
            <Link href="/dashboard/my-events" className="hover:text-gray-900">My Tickets</Link>
            <span className="font-semibold text-[#1a2744] border-b-2 border-[#1a2744] pb-0.5">Support</span>
            <div className="h-8 w-8 rounded-full bg-orange-400 flex items-center justify-center">
              <span className="text-white text-xs font-bold">U</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#1a2744] py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">How can we help you?</h1>
          <p className="text-blue-200 mb-7">Find answers to frequently asked questions, technical guides, or submit a support request to our team.</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input placeholder="Search help topics, guides, or keywords..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/30" />
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Browse by Category</h2>
          <button className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">View all topics <ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Info, title: "General", desc: "Account settings, notifications, and basic system navigation.", links: ["How to change password", "Managing notifications"] },
            { icon: Ticket, title: "Registration", desc: "Ticket booking, cancellations, and event check-in processes.", links: ["How to book a ticket", "Refund policy"] },
            { icon: Settings2, title: "Technical Support", desc: "Admin tools, scanner troubleshooting, and API access.", links: ["Setting up a new event", "Check-in app guide"] },
          ].map(({ icon: Icon, title, desc, links }) => (
            <div key={title} className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 mb-3">{desc}</p>
              <ul className="space-y-1">
                {links.map(l => (
                  <li key={l}><button className="text-sm text-gray-600 hover:text-[#1a2744] flex items-center gap-1"><span>{l}</span><ExternalLink className="h-3 w-3" /></button></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Ticket form + Contact */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3 border border-gray-200 rounded-xl p-7">
            <h2 className="font-bold text-gray-900 text-xl mb-1">Still need help?</h2>
            <p className="text-sm text-gray-500 mb-5">Submit a support ticket and our team will get back to you within 24 hours.</p>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Ticket Submitted!</h3>
                <p className="text-sm text-gray-500">We&apos;ll respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input {...register("name")} placeholder="John Doe"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30" />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">University Email</label>
                    <input {...register("email")} type="email" placeholder="j.doe@university.edu"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30" />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input {...register("subject")} placeholder="Briefly describe your issue"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Category</label>
                  <div className="relative">
                    <select {...register("category")}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30 appearance-none bg-white">
                      <option value="GENERAL">General Inquiry</option>
                      <option value="TECHNICAL">Technical Support</option>
                      <option value="REGISTRATION">Registration Help</option>
                      <option value="BILLING">Billing</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea {...register("message")} rows={4} placeholder="Describe your problem in detail..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1a2744]/30 resize-none" />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a35] disabled:opacity-60 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-4">Direct Contact</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Email Us</p>
                    <p className="text-xs text-gray-500">support@campus-events.edu</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Call Support</p>
                    <p className="text-xs text-gray-500">+1 (555) 0123-4567</p>
                    <p className="text-xs text-green-600">Mon-Fri, 9am – 5pm EST</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Visit Office</p>
                    <p className="text-xs text-gray-500">Student Union, Room 402<br />Central Campus</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-4">Other Resources</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between py-2.5 text-sm text-gray-700 hover:text-gray-900 border-b border-gray-100">
                  <span>User Manual (PDF)</span><Download className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between py-2.5 text-sm text-gray-700 hover:text-gray-900">
                  <span>System Status</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-5 bg-white">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#1a2744] flex items-center justify-center">
              <GraduationCap style={{height:14,width:14,color:'white'}} />
            </div>
            <span className="text-sm font-bold text-gray-900">Campus Events Support</span>
          </div>
          <p className="text-xs text-gray-400">© 2024 University Campus Events Information System. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-gray-400" /><HelpCircle className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </footer>
    </div>
  );
}
