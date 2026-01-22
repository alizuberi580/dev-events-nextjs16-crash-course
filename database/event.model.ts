import {
  Schema,
  model,
  models,
  type HydratedDocument,
  type Model,
} from 'mongoose';

export interface EventProps {
  title: string;
  slug?: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type EventDocument = HydratedDocument<EventProps>;
export type EventModel = Model<EventProps>;

const isNonEmptyString = (v: string): boolean => v.trim().length > 0;

const normalizeStringArray = (values: string[]): string[] =>
  values.map((v) => v.trim()).filter((v) => v.length > 0);

const normalizeDateToISODate = (raw: string): string => {
  const value = raw.trim();
  if (!value) throw new Error('Event date is required.');

  // Normalize to ISO date (YYYY-MM-DD) to keep date storage consistent.
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoMatch) {
    const d = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) {
      throw new Error(`Invalid event date: ${raw}`);
    }
    return value;
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid event date: ${raw}`);
  return d.toISOString().slice(0, 10);
};

const normalizeTimeToHHmm = (raw: string): string => {
  const value = raw.trim();
  if (!value) throw new Error('Event time is required.');

  // Normalize to 24h time (HH:mm) for consistent comparisons/sorting.
  const hhmm = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value);
  if (hhmm) {
    const hours = Number(hhmm[1]);
    const minutes = Number(hhmm[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error(`Invalid event time: ${raw}`);
    }
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const ampm = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i.exec(value);
  if (ampm) {
    let hours = Number(ampm[1]);
    const minutes = ampm[2] ? Number(ampm[2]) : 0;
    const meridiem = ampm[3].toLowerCase();

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      throw new Error(`Invalid event time: ${raw}`);
    }

    if (meridiem === 'pm' && hours !== 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  throw new Error(`Invalid event time: ${raw}`);
};

const slugifyTitle = (title: string): string => {
  // Simple slugification: lowercase + hyphenate non-alphanumerics.
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/["']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug) throw new Error('Unable to generate slug from empty title.');
  return slug;
};

const EventSchema = new Schema<EventProps>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: 'Title is required.',
      },
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: 'Description is required.',
      },
    },
    overview: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: 'Overview is required.',
      },
    },
    image: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: 'Image is required.',
      },
    },
    venue: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: 'Venue is required.',
      },
    },
    location: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: 'Location is required.',
      },
    },
    date: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: 'Date is required.',
      },
    },
    time: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: 'Time is required.',
      },
    },
    mode: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: 'Mode is required.',
      },
    },
    audience: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: 'Audience is required.',
      },
    },
    agenda: {
      type: [String],
      required: true,
      set: normalizeStringArray,
      validate: {
        validator: (v: string[]): boolean => v.length > 0,
        message: 'Agenda must have at least one item.',
      },
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: 'Organizer is required.',
      },
    },
    tags: {
      type: [String],
      required: true,
      set: normalizeStringArray,
      validate: {
        validator: (v: string[]): boolean => v.length > 0,
        message: 'Tags must have at least one item.',
      },
    },
  },
  {
    timestamps: true, // Auto-manage createdAt/updatedAt.
  }
);

EventSchema.index({ slug: 1 }, { unique: true });

EventSchema.pre('save', async function () {
  // Only regenerate slug when the title changes (or slug is missing).
  if (!this.slug || this.isModified('title')) {
    const base = slugifyTitle(this.title);
    let candidate = base;
    let attempt = 1;

    // Keep slugs unique by suffixing when collisions exist.
    while (
      await Event.exists({
        slug: candidate,
        _id: { $ne: this._id },
      })
    ) {
      attempt += 1;
      if (attempt > 50) {
        candidate = `${base}-${this._id.toString()}`;
        break;
      }
      candidate = `${base}-${attempt}`;
    }

    this.slug = candidate;
  }

  // Normalize date/time into consistent formats before persisting.
  this.date = normalizeDateToISODate(this.date);
  this.time = normalizeTimeToHHmm(this.time);
});

export const Event: EventModel =
  (models.Event as EventModel) || model<EventProps>('Event', EventSchema);
