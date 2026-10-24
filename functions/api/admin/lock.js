import {authorized,denied} from './_auth.js';
export async function onRequestPost({request,env}){
 if(!authorized(request,env)) return denied();
 const b=await request.json();
 const r=await env.DB.prepare("SELECT id FROM rounds WHERE active=1 ORDER BY id DESC LIMIT 1").first();
 if(!r) return Response.json({ok:false,error:'Nenhuma rodada ativa.'},{status:404});
 await env.DB.prepare("UPDATE rounds SET locked=? WHERE id=?").bind(b.locked?1:0,r.id).run();
 return Response.json({ok:true});
}
