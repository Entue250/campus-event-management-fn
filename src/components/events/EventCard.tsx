// ============================================================
// CAMPUS EVENTS — EventCard Component
// ============================================================

import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  Users,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/index";
import { formatDate, truncate } from "@/utils/helpers";
import { EVENT_STATUS_COLOURS } from "@/utils/constants";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
  /** Show register button (only on logged-in pages) */
  action?: React.ReactNode;
}

export function EventCard({ event, action }: EventCardProps) {
  const spotsLeft = event.available_spots;
  const isFull = spotsLeft === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-elevated transition-all overflow-hidden group flex flex-col">
      {/* Banner */}
      <div className="relative h-44 bg-gradient-to-br from-primary-100 to-navy-100 overflow-hidden">
        {event.banner_image ? (
          <Image
            src={event.banner_image}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-primary-300">
            <CalendarDays className="h-16 w-16" />
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <Badge className={EVENT_STATUS_COLOURS[event.status]}>
            {event.status}
          </Badge>
        </div>
        {/* Category badge */}
        {event.category && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-gray-700 backdrop-blur-sm">
              <Tag className="h-3 w-3 mr-1" />
              {event.category.name}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/events/${event.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>
        </Link>

        <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 flex-1">
          {truncate(event.description, 120)}
        </p>

        {/* Meta */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CalendarDays className="h-3.5 w-3.5 text-primary-500 shrink-0" />
            <span>{formatDate(event.event_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 text-primary-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Users className="h-3.5 w-3.5 text-primary-500 shrink-0" />
            {isFull ? (
              <span className="text-red-600 font-medium">Full</span>
            ) : (
              <span className="text-gray-500">
                {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        {action && <div className="mt-4">{action}</div>}
        {!action && (
          <Link
            href={`/events/${event.id}`}
            className="mt-4 block text-center py-2 px-4 rounded-lg text-sm font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}
