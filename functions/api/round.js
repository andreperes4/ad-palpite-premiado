export async function onRequestGet({env}) {
  const r=await env.DB.prepare("SELECT * FROM rounds WHERE active=1 ORDER BY id DESC LIMIT 1").first();
  if(!r) return Response.json({ok:true,round:null});
  let games=[];try{games=JSON.parse(r.games_json||'[]')}catch{}
  const closed=!!r.locked||(r.closes_at&&Date.now()>=new Date(r.closes_at).getTime());
  return Response.json({ok:true,round:{...r,games,closed}});
}
