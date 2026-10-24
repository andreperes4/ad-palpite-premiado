const cleanPhone=v=>String(v||'').replace(/\D/g,'');
const parse=s=>{try{return JSON.parse(s||'[]')}catch{return []}};
export async function onRequestGet({request,env}){
 const u=new URL(request.url),phone=cleanPhone(u.searchParams.get('phone'));
 if(phone.length<8)return Response.json({ok:false,error:'WhatsApp inválido.'},{status:400});
 const r=await env.DB.prepare("SELECT id FROM rounds WHERE active=1 ORDER BY id DESC LIMIT 1").first();
 if(!r)return Response.json({ok:false,error:'Nenhuma rodada ativa.'},{status:404});
 const p=await env.DB.prepare("SELECT name,phone,picks_json,updated_at FROM predictions WHERE round_id=? AND phone=?").bind(r.id,phone).first();
 return Response.json({ok:true,prediction:p?{...p,picks:parse(p.picks_json)}:null});
}
export async function onRequestPost({request,env}){
 const body=await request.json(),name=String(body.name||'').trim().slice(0,80),phone=cleanPhone(body.phone);
 const r=await env.DB.prepare("SELECT * FROM rounds WHERE active=1 ORDER BY id DESC LIMIT 1").first();
 if(!r)return Response.json({ok:false,error:'Nenhuma rodada ativa.'},{status:404});
 let games=parse(r.games_json),picks=Array.isArray(body.picks)?body.picks:[];
 if(name.length<2||phone.length<8||picks.length!==games.length)return Response.json({ok:false,error:'Preencha nome, WhatsApp e todos os placares.'},{status:400});
 picks=picks.map(p=>({a:Number(p.a),b:Number(p.b)}));
 if(picks.some(p=>!Number.isInteger(p.a)||!Number.isInteger(p.b)||p.a<0||p.b<0||p.a>99||p.b>99))return Response.json({ok:false,error:'Placares inválidos.'},{status:400});
 if(r.locked||(r.closes_at&&Date.now()>=new Date(r.closes_at).getTime()))return Response.json({ok:false,error:'Os palpites estão encerrados.'},{status:423});
 const key=picks.map(p=>`${p.a}-${p.b}`).join('|');
 try{
  const old=await env.DB.prepare("SELECT id FROM predictions WHERE round_id=? AND phone=?").bind(r.id,phone).first();
  if(old)await env.DB.prepare("UPDATE predictions SET name=?,picks_json=?,combination_key=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(name,JSON.stringify(picks),key,old.id).run();
  else await env.DB.prepare("INSERT INTO predictions(round_id,name,phone,picks_json,combination_key) VALUES(?,?,?,?,?)").bind(r.id,name,phone,JSON.stringify(picks),key).run();
  return Response.json({ok:true,message:old?'Palpite alterado com sucesso!':'Palpite confirmado com sucesso!'});
 }catch(e){if(String(e).toLowerCase().includes('unique'))return Response.json({ok:false,error:'Essa combinação completa de placares já foi escolhida. Altere pelo menos um jogo.'},{status:409});throw e}
}
