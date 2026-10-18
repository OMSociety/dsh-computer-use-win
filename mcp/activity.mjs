import {atomicJson} from './takeover.mjs';

export function isDesktopTool(name=''){
  return /^(?:mcp__wincu__)?windows_computer_use_(?!health$|tools$)[a-z_]+$/.test(name);
}

// The host knows turn boundaries; the stdio worker only knows individual calls.
// Keep this lease outside the worker so tool-list reloads preserve the series.
export function installActivity(ctx,file){
  let owner,closed=false;
  const publish=()=>atomicJson(file,{active:!!owner,sessionId:owner?.id??null,turn:owner?.turn??null,expiresAt:owner?Date.now()+5000:0});
  publish();
  ctx.on('tools/execute',async(exec,next)=>{
    if(!isDesktopTool(exec.name)||exec.signal?.aborted)return next();
    const session=exec.agent?.session;
    const turn=exec.agent?.phase?.kind==='running'?exec.agent.phase.turn:undefined;
    if(session&&turn!==undefined){
      if(owner&&owner.id!==session.id)throw Error('COMPUTER_USE_BUSY: Another conversation is using the desktop. Wait for that operation series to finish or stop it before retrying.');
      owner={id:session.id,turn};publish();
    }
    return next();
  },{global:true});
  ctx.on('session/event',(session,event)=>{
    if(event.type==='turn/end'&&owner?.id===session.id&&owner.turn===event.data.turn){owner=undefined;publish();}
  },{global:true});
  ctx.effect(()=>{
    const timer=setInterval(()=>{if(owner&&!closed)try{publish();}catch(error){ctx.logger.error(error);}},1000);
    timer.unref();
    return ()=>{closed=true;clearInterval(timer);owner=undefined;publish();};
  });
}
