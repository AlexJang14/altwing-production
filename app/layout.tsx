import type { Metadata } from 'next';
import {SITE_ORIGIN, TITLE, DESCRIPTION, SOCIAL_IMAGE} from '../deployment/domain.mjs';
import '../src/App.css';
import '../src/styles/global.css';
import '../src/styles/readability-final.css';
import '../src/styles/readability-sitewide.css';
import '../src/styles/readiness-rescue.css';
import '../src/styles/submission.css';
import '../src/styles/experience.css';
export const metadata:Metadata={
  metadataBase:new URL(SITE_ORIGIN),title:TITLE,description:DESCRIPTION,
  alternates:{canonical:`${SITE_ORIGIN}/`},icons:{icon:'/favicon.svg'},
  openGraph:{type:'website',siteName:'AltWing',url:`${SITE_ORIGIN}/`,title:TITLE,description:DESCRIPTION,images:[{url:SOCIAL_IMAGE,width:1536,height:1024,alt:'AltWing penguin guide'}]},
  twitter:{card:'summary_large_image',title:TITLE,description:DESCRIPTION,images:[{url:SOCIAL_IMAGE,alt:'AltWing penguin guide'}]},
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
