import React from 'react'
import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import {EventProps} from "@/database/event.model";
import {cacheLife} from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page =async () => {
    'use cache'
    cacheLife('hours')
    const response = await fetch(`${BASE_URL}/api/events`);
    const { events } = await response.json();
    return (
        <section>
            <h1 className="text-center">The Hub for Every Dev <br/> Event You Can't Miss </h1>
            <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in one place</p>
            <ExploreBtn/>

            <div className={"mt-20 space-y-7"}>
                <h3>Featured Events</h3>
                <ul className={"events list-none"}>
                    {events && events.length>0 && events.map((event:EventProps)=>(
                        <li key={event.title} className={"list-none"}>
                            <EventCard {...event}/>
                        </li>)
                    )}
                </ul>
            </div>
        </section>


    )
}
export default Page

/*
* Client side rendering example:
* Buttons including onClick prop, animation,
* */

/*
* What Server Components CAN do

✅ Access database
✅ Use environment secrets
✅ Fetch data directly
✅ Be async
✅ Smaller bundle size

What they CANNOT do

❌ useState
❌ useEffect
❌ onClick
❌ browser APIs (window, localStorage)


* cache --> improving speed, reducing load, keeping website fast
* In Next.js (App Router), this usually means:
  Saving data fetched from APIs / DB
  Saving rendered HTML / RSC output
  So next time:
* why caching matters in Next.js:
  Without cache:
  Request → fetch DB → render → send response
  With cache:
  Request → return saved result (skip DB + render)

  i) cache Life (TTL) – “How long should this stay cached?"
  * when to use
   ✔ Public pages
   ✔ Data that changes occasionally
   ✔ SEO pages
  ii) Cache Tags – “Which cached things should be invalidated together?”
   Update happens → cache is cleared immediately
   Users see fresh data instantly
* */