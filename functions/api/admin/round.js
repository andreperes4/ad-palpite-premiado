import {authorized,denied} from './_auth.js';
const parse=s=>{try{return JSON.parse(s||'[]')}catch{return []}};
export async function onRequestGet({request,env}){
 if(!authorized(request,env)) return denied();
 const round=await env.DB.prepare("SELECT * FROM rounds WHERE active=1 ORDER BY id DESC LIMIT 1").first();
 const participants=round ? (await env.DB.prepare("SELECT id,name,phone,picks_json,created_at,updated_at FROM predictions WHERE round_id=? ORDER BY updated_at DESC").bind(round.id).all()).results : [];
 return Response.json({ok:true,round:round?{...round,games:parse(round.games_json),results:parse(round.results_json)}:null,participants:participants.map(p=>({...p,picks:parse(p.picks_json)}))});
}
export async function onRequestPost({request,env}){
 if(!authorized(request,env)) return denied();
 const b=await request.json();
 const games=Array.isArray(b.games)?b.games:[];
 if(games.length<1||games.length>20) return Response.json({ok:false,error:'Cadastre entre 1 e 20 jogos.'},{status:400});
 const clean=games.map((g,i)=>({id:i+1,a:String(g.a||'').trim().slice(0,80),b:String(g.b||'').trim().slice(0,80),time:String(g.time||'').slice(0,10),logoA:String(g.logoA||''),logoB:String(g.logoB||'')}));
 if(clean.some(g=>!g.a||!g.b)) return Response.json({ok:false,error:'Preencha os dois times de todos os jogos.'},{status:400});
 const current=await env.DB.prepare("SELECT id FROM rounds WHERE active=1 ORDER BY id DESC LIMIT 1").first();
 const vals=[String(b.title||'Palpite Premiado').slice(0,100),String(b.prize||'PIX').slice(0,80),b.closes_at||null,JSON.stringify(clean)];
 if(current) await env.DB.prepare("UPDATE rounds SET title=?,prize=?,closes_at=?,games_json=? WHERE id=?").bind(...vals,current.id).run();
 else await env.DB.prepare("INSERT INTO rounds(title,prize,closes_at,games_json) VALUES(?,?,?,?)").bind(...vals).run();
 return Response.json({ok:true});
}
