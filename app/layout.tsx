import type { Metadata } from "next";
import {Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import LightRays from "@/components/LightRays";
import Navbar from "@/components/Navbar";
import { PostHogProvider } from './providers';


//each font martianmono and schibsted grotesk is imported as a variable and 
//then used in the body className to apply the font globally across the app. 
//The variable property allows us to define a custom CSS variable that can be used to 
//reference the font in our styles. By including both fonts in the body className, 
//we ensure that they are available throughout the entire application, allowing us to 
//use them in any component or page as needed.
//imported as functions from google and then used to return an object
const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted_grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dev Event",
  description: "The Hub for Every Dev Event You Mustn't Miss",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} min-h-screen antialiased`}
      >
      <PostHogProvider>
      <Navbar />
          <div className="absolute inset-0 top-0 z-[-1] min-h-screen">
              <LightRays
                  raysOrigin="top-center-offset"
                  raysColor="#5dfeca"
                  raysSpeed={0.5}
                  lightSpread={0.9}
                  rayLength={3}
                  followMouse={true}
                  mouseInfluence={0.1}
                  noiseAmount={0}
                  distortion={0.01}
                  className="custom-rays"
                  pulsating={false}
                  fadeDistance={1}
                  saturation={1}
              />
          </div>
          <main>
              {children}
          </main>
      </PostHogProvider>
      </body>
    </html>
  );
}
