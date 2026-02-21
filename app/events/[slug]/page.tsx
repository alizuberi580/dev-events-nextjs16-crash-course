import EventDetails from "@/components/EventDetails";
import { Suspense } from "react";


const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const slug = params.then((p) => p.slug)
    return (
        <main>
            <Suspense>
                <EventDetails params={slug} />
            </Suspense>
        </main>
    )
}

export default EventDetailsPage
/*
Suspense is a React mechanism for handling async operations in the component tree. 
When React encounters a component wrapped in Suspense that is not ready yet 
(either it's fetching data or waiting on a Promise), React doesn't block the 
entire page render. Instead it does two things simultaneously — renders and 
streams whatever it can immediately (the <main> wrapper, the Navbar, anything 
outside Suspense), and shows a fallback (or nothing, since no fallback prop is 
provided here) until the suspended component is ready, then streams that chunk down too.

Without Suspense, the entire page would wait for EventDetails to finish fetching before 
sending anything to the browser. With Suspense, the browser gets the shell of the page 
instantly and the event content streams in once it's ready.
*/