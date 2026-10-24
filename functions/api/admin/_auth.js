export function authorized(request,env){
  const h=request.headers.get('Authorization')||'';
  return env.ADMIN_PASSWORD && h === `Bearer ${env.ADMIN_PASSWORD}`;
}
export const denied=()=>Response.json({ok:false,error:'Senha de administrador incorreta.'},{status:401});
