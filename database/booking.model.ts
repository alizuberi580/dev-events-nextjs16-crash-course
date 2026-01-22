import {
  Schema,
  model,
  models,
  type HydratedDocument,
  type Model,
  Types,
} from 'mongoose';

import { Event } from './event.model';

export interface BookingProps {
  eventId: Types.ObjectId;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type BookingDocument = HydratedDocument<BookingProps>;
export type BookingModel = Model<BookingProps>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<BookingProps>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string): boolean => EMAIL_RE.test(v),
        message: 'Email must be a valid email address.',
      },
    },
  },
  {
    timestamps: true, // Auto-manage createdAt/updatedAt.
  }
);

BookingSchema.index({ eventId: 1 });

BookingSchema.pre('save', async function () {
  // Ensure eventId references a real Event before accepting a booking.
  if (this.isNew || this.isModified('eventId')) {
    const exists = await Event.exists({ _id: this.eventId });
    if (!exists) {
      throw new Error(`Event not found for eventId: ${this.eventId.toString()}`);
    }
  }
});

export const Booking: BookingModel =
  (models.Booking as BookingModel) || model<BookingProps>('Booking', BookingSchema);
