'use client';

import {useState} from "react";
import {createBooking} from "@/lib/actions/booking.actions";
import posthog from "posthog-js";

const BookEvent = ({eventId, slug}:{eventId:string; slug:string}) => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async(e: React.FormEvent) => {

        e.preventDefault();
        const {success} = await createBooking({eventId, slug, email});

        if(success){
            setSubmitted(true);
            posthog.capture('event_booked', {eventId, slug, email});
        }else{
            //setSubmitted(false);
            console.error('Booking creation failed');
            posthog.captureException('Booking creation failed');
        }
    }
    return (
        <div id={"book-event"}>
            {submitted ? (
                <p className={"text-sm"}>Thank you for signing up!</p>
            ):(
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Email Address</label>
                        <input
                            type={"email"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            placeholder={"Enter your email address"}
                        />
                    </div>
                    <button type={"submit"} className={"button-submit"}>Submit</button>
                </form>
            )}
        </div>
    )
}
export default BookEvent
/*
* Without e.preventDefault()
Your handleSubmit function starts running
Simultaneously, the browser triggers its default form submission
The page fully reloads — wiping all React state, cancelling your await createBooking() call mid-flight, and navigating away
Your setSubmitted(true) never runs
The PostHog event never fires
The user sees nothing — just a reloaded page

* with e.preventDefault(), we tell browser to do do noting on its own, Iam in full control 
*/