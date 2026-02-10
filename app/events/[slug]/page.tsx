import EventDetails from "@/components/EventDetails";
import { cacheLife } from "next/cache";
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
