export default function handler(request,response){
 response.setHeader('Cache-Control','no-store');
 response.status(503).json({error:'This Vercel preview saves stories locally. Cloud snapshots and generation require the hosted workspace backend.'});
}
