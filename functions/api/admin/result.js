import {authorized,denied} from './_auth.js';
const parse=s=>{try{return JSON.parse(s||'[]')}catch{return []}};
export async function onRequestPost({request,env}){
 if(!authorized(request,env))return denied();
 const b=await request.json(),results=Array.isArray(b.results)?b.results:[];
 const r=await env.DB.prepare("SELECT id,games_json FROM rounds WHERE active=1 ORDER BY id DESC LIMIT 1").first();
 if(!r)return Response.json({ok:false,error:'Nenhuma rodada ativa.'},{status:404});
 const games=parse(r.games_json);
 if(results.length!==games.length||results.some(x=>!Number.isInteger(Number(x.a))||!Number.isInteger(Number(x.b))||Number(x.a)<0||Number(x.b)<0))return Response.json({ok:false,error:'Preencha o resultado de todos os jogos.'},{status:400});
 const clean=results.map(x=>({a:Number(x.a),b:Number(x.b)}));
 await env.DB.prepare("UPDATE rounds SET results_json=? WHERE id=?").bind(JSON.stringify(clean),r.id).run();
 const all=(await env.DB.prepare("SELECT name,phone,picks_json FROM predictions WHERE round_id=?").bind(r.id).all()).results;
 const key=JSON.stringify(clean),winners=all.filter(p=>JSON.stringify(parse(p.picks_json))===key).map(({name,phone})=>({name,phone}));
 return Response.json({ok:true,winners});
}
