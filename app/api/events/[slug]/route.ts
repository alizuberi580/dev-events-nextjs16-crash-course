import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';

import connectDB from '@/lib/mongodb';
import { Event } from '@/database';
import type { EventProps } from '@/database/event.model';

// Mongoose requires the Node.js runtime (not Edge).
export const runtime = 'nodejs';

// Next.js provides dynamic route params via the 2nd handler arg.
type RouteParams = {
  slug?: string | string[];
};

type RouteContext = {
  params: Promise<RouteParams>;
};

// Slugs are generated as lowercase alphanumerics separated by single hyphens.
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type ParsedSlug =
  | { ok: true; slug: string }
  | { ok: false; message: string };

function parseSlug(params: RouteParams): ParsedSlug {
  const { slug } = params;

  if (!slug) return { ok: false, message: 'Missing required route parameter: slug.' };
  if (Array.isArray(slug)) return { ok: false, message: 'Invalid slug: expected a single string value.' };

  const normalized = slug.trim().toLowerCase();
  if (!normalized) return { ok: false, message: 'Invalid slug: must be a non-empty string.' };
  if (normalized.length > 200) return { ok: false, message: 'Invalid slug: too long.' };
  if (!SLUG_RE.test(normalized)) {
    return {
      ok: false,
      message: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.',
    };
  }

  return { ok: true, slug: normalized };
}

// Shape returned from `lean()` (includes MongoDB _id).
type EventLean = EventProps & {
  _id: Types.ObjectId;
};

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const params = await ctx.params;
  const parsed = parseSlug(params ?? {});
  if (!parsed.ok) {
    return NextResponse.json(
      { message: parsed.message },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // `lean()` returns a plain object, which is cheaper to serialize than a full Mongoose document.
    const event = await Event.findOne({ slug: parsed.slug })
      .select('-__v')
      .lean<EventLean>()
      .exec();

    if (!event) {
      return NextResponse.json(
        { message: `Event not found for slug: ${parsed.slug}.` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Event fetched successfully.', event },
      { status: 200 }
    );
  } catch (err: unknown) {
    // Avoid leaking internal details in production.
    const isProd = process.env.NODE_ENV === 'production';

    console.error('GET /api/events/[slug] failed:', err);

    return NextResponse.json(
      {
        message: 'Unexpected error fetching event.',
        ...(isProd
          ? {}
          : {
              error: err instanceof Error ? err.message : 'Unknown error',
            }),
      },
      { status: 500 }
    );
  }
}
