# DevEvent

The hub for every developer event you can't miss — hackathons, meetups, and conferences, all in one place.

**[Live Demo](https://dev-events-tau-five.vercel.app/)**

## Features

- **Browse Events** — View a curated list of featured developer events with poster images, locations, dates, and times.
- **Event Details** — Dedicated pages for each event with full description, overview, agenda, organizer info, and tags.
- **Event Booking** — Book your spot at any event via a simple email-based registration form.
- **Similar Events** — Tag-based recommendations for discovering related events on each detail page.
- **Event Creation** — Create new events via API with image uploads powered by Cloudinary.
- **Server-side Caching** — Uses Next.js `'use cache'` and `cacheLife` for fast page loads with time-based revalidation.
- **Analytics** — PostHog integration for tracking user interactions and event bookings.
- **Dynamic Light Rays** — Interactive WebGL background effect using OGL that follows mouse movement.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 4
- **Database:** MongoDB with Mongoose ODM
- **Image Storage:** Cloudinary
- **Analytics:** PostHog
- **Icons:** Lucide React
- **Visual Effects:** OGL (WebGL)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB database (e.g. [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Cloudinary](https://cloudinary.com/) account (for image uploads)
- A [PostHog](https://posthog.com/) account (for analytics)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd nextjs-crash-course
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```env
   MONGODB_URI=<your-mongodb-connection-string>
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-key>
   NEXT_PUBLIC_POSTHOG_HOST=<your-posthog-host>
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── events/
│   │       ├── route.ts            # GET all events, POST create event
│   │       └── [slug]/route.ts     # GET event by slug
│   ├── events/
│   │   └── [slug]/page.tsx         # Event detail page
│   ├── layout.tsx                  # Root layout with fonts, navbar, light rays
│   ├── page.tsx                    # Homepage with featured events
│   └── providers.tsx               # PostHog provider (client component)
├── components/
│   ├── BookEvent.tsx               # Email booking form
│   ├── EventCard.tsx               # Event card for listings
│   ├── EventDetails.tsx            # Full event detail view
│   ├── EventList.tsx               # Event list component
│   ├── ExploreBtn.tsx              # Explore events CTA button
│   ├── LightRays.tsx               # WebGL light rays background
│   └── Navbar.tsx                  # Navigation bar
├── database/
│   ├── event.model.ts              # Event Mongoose schema & model
│   ├── booking.model.ts            # Booking Mongoose schema & model
│   └── index.ts                    # Model exports
├── lib/
│   ├── actions/
│   │   ├── booking.actions.ts      # Server action: create booking
│   │   └── events.actions.ts       # Server action: get similar events
│   ├── constants.ts                # Static event data (fallback)
│   ├── mongodb.ts                  # MongoDB connection with caching
│   └── utils.ts                    # Utility functions (cn)
└── public/
    ├── icons/                      # SVG icons
    └── images/                     # Event images
```

## API Endpoints

- **`GET /api/events`** — Returns all events sorted by newest first.
- **`POST /api/events`** — Creates a new event. Accepts `multipart/form-data` with an image file and event fields. Uploads the image to Cloudinary.
- **`GET /api/events/[slug]`** — Returns a single event by its URL slug.

## Database Models

### Event
Stores developer event data including title, description, overview, image URL, venue, location, date, time, mode (online/offline), audience, agenda, organizer, and tags. Slugs are auto-generated from titles with collision handling via a pre-save hook. Dates and times are normalized to ISO and 24-hour formats respectively.

### Booking
Stores event bookings with an email and a reference to the event. Validates email format and ensures the referenced event exists before saving.

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Deployment

This project is deployed on [Vercel](https://vercel.com). Push to the `main` branch to trigger a deployment.

Make sure all environment variables are configured in your Vercel project settings.
