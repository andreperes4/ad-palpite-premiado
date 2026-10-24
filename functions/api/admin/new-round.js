import {authorized,denied} from './_auth.js';
export async function onRequestPost({request,env}){
 if(!authorized(request,env)) return denied();
 await env.DB.prepare("UPDATE rounds SET active=0 WHERE active=1").run();
 return Response.json({ok:true});
}
