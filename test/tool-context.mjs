// Public MCP discovery, schema parity and load/reset behavior; no desktop input.
import assert from 'node:assert/strict';
import {cp,mkdir,mkdtemp,writeFile,readFile,access} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {McpTestClient} from './mcp-test-client.mjs';
const root=await mkdtemp(path.join(os.tmpdir(),'wcu-tool-context-'));
await cp(new URL('../mcp',import.meta.url),path.join(root,'mcp'),{recursive:true});
await mkdir(path.join(root,'scripts'));
const marker=path.join(root,'started.txt').replaceAll("'","''");
await writeFile(path.join(root,'scripts/windows-uia.ps1'),`param([switch]$Persistent)
Import-Module "$PSHOME/Modules/Microsoft.PowerShell.Utility/Microsoft.PowerShell.Utility.psd1" -ErrorAction Stop
[IO.File]::AppendAllText('${marker}','started')
while($null -ne ($line=[Console]::In.ReadLine())) {
  $r=$line | ConvertFrom-Json
  [Console]::WriteLine((@{id=$r.id;ok=$true;action=$r.action;args=$r.args} | ConvertTo-Json -Depth 20 -Compress))
}
`);
const prefix='windows_computer_use_', reports=[];
const data=r=>JSON.parse(r.content[0].text);
const stripDescriptions=value=>Array.isArray(value)?value.map(stripDescriptions):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([key])=>key!=='description').map(([key,child])=>[key,stripDescriptions(child)])):value;
for(const mode of ['lite','full']) {
  const client=new McpTestClient(process.execPath,[path.join(root,'mcp/server.mjs')],{env:{...process.env,WCU_TOOL_MODE:mode}});
  const manage=args=>client.call(prefix+'tools',args);
  try {
    assert.equal((await client.init()).capabilities.tools.listChanged,true);
    const initial=(await client.request('tools/list')).tools;
    assert.equal(initial.length,mode==='lite'?10:24);
    const catalogue=data(await manage({}));assert.equal(catalogue.tools.length,23);
    for(const advertised of initial.filter(t=>t.name!==prefix+'tools')) {
      const described=data(await manage({operation:'describe',names:[advertised.name]}));
      assert.deepEqual(stripDescriptions(advertised.inputSchema),stripDescriptions(described.inputSchema));
    }
    if(mode==='lite') assert.equal(await access(path.join(root,'started.txt')).then(()=>true,()=>false),false,'Discovery must not start PowerShell');
    const notificationCount=client.notifications.length;
    assert.equal((await manage({operation:'enable',names:['drag','unknown']})).isError,true);
    assert.equal(client.notifications.length,notificationCount);
    assert.deepEqual((await client.request('tools/list')).tools,initial,'Invalid names cannot partially enable tools');
    assert.equal((await manage({operation:'describe',names:[]})).isError,true);
    assert.equal((await manage({operation:'enable'})).isError,true);
    assert.equal((await manage({operation:'reset',names:['drag']})).isError,true);
    await manage({operation:'disable',names:['wait']});
    let count=client.notifications.length;
    await manage({operation:'enable',names:['wait','drag']});
    assert.equal(client.notifications.length,count+1);
    assert.ok((await client.request('tools/list')).tools.some(t=>t.name===prefix+'wait'));
    count=client.notifications.length;
    await manage({operation:'enable',names:['wait','drag']});
    assert.equal(client.notifications.length,count,'Idempotent load must not notify');
    const invalid=await client.call(prefix+'drag',{path:[{x:1,y:2},{x:2,y:'3'}]});assert.equal(invalid.isError,true);
    const result=data(await client.call(prefix+'wait',{milliseconds:1}));assert.equal(result.args.milliseconds,1);
    await manage({operation:'disable',names:['drag']});
    assert.ok(!(await client.request('tools/list')).tools.some(t=>t.name===prefix+'drag'));
    await manage({operation:'reset'});assert.deepEqual((await client.request('tools/list')).tools,initial);
    reports.push({mode,toolCount:initial.length,characters:JSON.stringify({tools:initial}).length,transcript:client.transcript});
  } finally {client.close()}
}
await writeFile(path.join(root,'results.json'),JSON.stringify(reports,null,2)+'\n');
console.log(JSON.stringify({passed:true,artifacts:root,modes:reports.map(({mode,toolCount,characters})=>({mode,toolCount,characters}))}));
