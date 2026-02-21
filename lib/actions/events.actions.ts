'use server'

import {Event} from '@/database/event.model'
import connectDB from "@/lib/mongodb";

export const getSimilarEventsBySlug = async (slug: string)=>{
    try{
        await connectDB();
        const event = await Event.findOne({slug});
        if(!event){
            return [];
        }
        return await Event.find({_id:{$ne:event._id}, tags:{$in:event.tags}}).lean();
        // the object returned to us is by mongoose, for which we actually have to convert intoJSON using lean() function
    }catch{
        return []
    }
}
//this is called server actions
/*
The server action is your internal shortcut — built for use within the Next.js app, 
direct function call, no network overhead, simpler code. 
Same database, same data, fundamentally different transport layer.
*/