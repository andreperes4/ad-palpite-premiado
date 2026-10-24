export async function onRequest(context) {
  try { return await context.next(); }
  catch (e) {
    console.error(e);
    return Response.json({ok:false,error:'Erro interno do servidor.'},{status:500});
  }
}
