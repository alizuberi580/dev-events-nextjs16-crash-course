import {NextRequest} from "next/server";
import {NextResponse} from "next/server";
import {Event} from "@/database";
import {v2 as cloudinary} from "cloudinary";
import connectDB from "@/lib/mongodb";

export async function POST(req:NextRequest){
    try{
        await connectDB();
        //multipart/form-data,<form> submission, FormData in frontend
        const formData= await req.formData();
        let event: any;
        let rawEvent
        try{
            //converts FormData → Object
            rawEvent = Object.fromEntries(formData.entries());

            event = {
                ...rawEvent,
                agenda: JSON.parse(rawEvent.agenda as string),
                tags: JSON.parse(rawEvent.tags as string),
            };
        }catch(e){
            return NextResponse.json({message: 'Invalid JSON data format'}, {status:400});
        }
        const file = formData.get('image') as File;
        if(!file)return NextResponse.json({message:'Image file is required'}, {status:400})

        const tags = JSON.parse(formData.get('tags') as string);
        const agenda = JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject)=>{
            cloudinary.uploader.upload_stream({resource_type:'image', folder:'DevEvent'}, (error, results)=>{
                if(error) return reject(error);
                resolve(results);
            }).end(buffer);
        });

        //stroing cloudniary image url in our database, not the actual image
        event.image = (uploadResult as {secure_url:string}).secure_url;

        //const createdEvent = await Event.create(event)
        //Event saved with all validations methods, hooks indexes applied
        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        return NextResponse.json({message: 'Event created successfully.', event: createdEvent}, {status:201});
    }catch (e) {
        console.error(e);
        return NextResponse.json({message: 'Event creation Failed', error: e instanceof Error? e.message : 'Unknown'}, {status:400});
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 });
    }
}
// a route that accepts slug as an input and returns the event against it
/*
The API route is your public HTTP interface — built for external consumers, 
carries full HTTP overhead, validated defensively, returns proper status codes
*/