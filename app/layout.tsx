import '../src/styles/application.css';
import type { Metadata } from 'next';
import {SITE_ORIGIN, TITLE, DESCRIPTION, SOCIAL_IMAGE} from '../deployment/domain.mjs';
export const metadata:Metadata={
  metadataBase:new URL(SITE_ORIGIN),title:TITLE,description:DESCRIPTION,
  alternates:{canonical:`${SITE_ORIGIN}/`},icons:{icon:'/favicon.svg'},
  openGraph:{type:'website',siteName:'AltWing',url:`${SITE_ORIGIN}/`,title:TITLE,description:DESCRIPTION,images:[{url:SOCIAL_IMAGE,width:1536,height:1024,alt:'AltWing penguin guide'}]},
  twitter:{card:'summary_large_image',title:TITLE,description:DESCRIPTION,images:[{url:SOCIAL_IMAGE,alt:'AltWing penguin guide'}]},
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className="aw-theme-golden-horizon"><body className="aw-theme-black-gold aw-theme-golden-horizon" data-aw-kick="ion-blue" data-aw-kick-level="3">{children}</body></html>;}
