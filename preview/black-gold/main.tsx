import '../../src/styles/application.css';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from '../../src/App';
// Review-only routing: the real app runs without production analytics/submission.
document.addEventListener('click',event=>{if(event.defaultPrevented)return;const target=(event.target as Element).closest('a');const page=target?.getAttribute('href');const map:Record<string,string>={'research.html':'#/research','credits.html':'#/credits','terms.html':'#/terms','privacy.html':'#/privacy'};const destination=page?.startsWith('#/')?page:page?map[page]:undefined;if(destination){event.preventDefault();location.hash=destination;}});
window.addEventListener('message',event=>{if(event.source===window.parent&&event.data?.kind==='altwing-preview-home'){location.hash='#/';window.scrollTo({top:0});}});
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
