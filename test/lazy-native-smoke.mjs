// Observe the native Windows desktop after lazy loading; never send input.
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
import {McpTestClient} from './mcp-test-client.mjs';
const prefix='windows_computer_use_';
const env={...process.env,WCU_TOOL_MODE:'lazy',WCU_TEST_NO_TAKEOVER:'1',WCU_INDICATOR:'0'};
delete env.WCU_ENABLED_TOOLS;
const client=new McpTestClient(process.execPath,[fileURLToPath(new URL('../mcp/server.mjs',import.meta.url))],{env});
try{
 const info=await client.init();
 assert.equal(info.serverInfo.version,JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8')).version);
 assert.equal((await client.request('tools/list')).tools.length,1);
 const enable=await client.call(prefix+'tools',{operation:'enable',names:['health','screenshot','wait']});
 assert.ok(!enable.isError);
 assert.equal((await client.request('tools/list')).tools.length,4);
 const health=await client.call(prefix+'health',{});assert.ok(!health.isError,JSON.stringify(health));
 const wait=await client.call(prefix+'wait',{milliseconds:1});assert.ok(!wait.isError,JSON.stringify(wait));
 const screenshot=await client.call(prefix+'screenshot',{});assert.ok(!screenshot.isError);
 const image=screenshot.content.find(x=>x.type==='image');
 assert.ok(image&&Buffer.from(image.data,'base64').length>1000,'Native screenshot must contain pixels');
 await client.call(prefix+'tools',{operation:'reset'});
 assert.equal((await client.request('tools/list')).tools.length,1);
 const observed=JSON.parse(health.content[0].text);
 console.log(JSON.stringify({passed:true,serverVersion:info.serverInfo.version,node:process.version,nativeHealth:{ok:observed.ok,powershell:observed.powershell,uiAutomation:observed.uiAutomation,screenshot:observed.screenshot,targetResponsive:observed.targetResponsive},screenshotBytes:Buffer.from(image.data,'base64').length,toolCounts:[1,4,1],physicalInputSent:false}));
}finally{client.close()}
