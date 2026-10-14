const {app,BrowserWindow}=require('electron');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
app.commandLine.appendSwitch('disable-gpu');
app.setPath('userData',path.join(process.env.WCU_SETTINGS_TEST_ROOT,'user-data'));
app.whenReady().then(async()=>{
  // CI can lack a visible compositor surface. Software offscreen painting
  // still renders the real React card and supplies its actual pixels.
  const win=new BrowserWindow({show:false,width:900,height:500,webPreferences:{nodeIntegration:true,contextIsolation:false,sandbox:false,offscreen:true,backgroundThrottling:false}});
  let paintedImage;let paintCount=0;
  win.webContents.on('paint',(_event,_dirty,image)=>{paintedImage=image;paintCount++;});
  const evaluate=code=>win.webContents.executeJavaScript(code);
  const until=async code=>{const end=Date.now()+5000;while(!await evaluate(code)){if(Date.now()>end)throw Error('Settings card condition timed out: '+code);await new Promise(r=>setTimeout(r,20))}};
  await win.loadURL('data:text/html,<html><meta charset="utf-8"><body style="font-family:Arial;padding:24px;background:white"><ul id="app" style="padding:0"></ul></body></html>');
  await evaluate(`
    const nativeRequire=window.require;
    const React=nativeRequire(${JSON.stringify(process.env.WCU_REACT_ENTRY)});
    const ReactDOM=nativeRequire(${JSON.stringify(process.env.WCU_REACT_DOM_ENTRY)});
    window.require=name=>name==='react'?React:nativeRequire(name);
    window.__ModuleLoader__={load:entry=>{window.clientModule=entry.factory();window.clientId=entry.id;}};
    void 0;
  `);
  await evaluate(fs.readFileSync(path.join(__dirname,'../mcp/client.js'),'utf8'));
  await evaluate(`
    window.writes=[];window.listeners=new Set();window.snapshot={value:{mode:'lite'},writable:true};window.failSave=false;
    const scope={getSnapshot:()=>window.snapshot,subscribe:listener=>{window.listeners.add(listener);return ()=>window.listeners.delete(listener)},set:async(field,value)=>{
      if(window.failSave){window.failSave=false;throw Error('fixture rejected save')}
      if(field!=='mode'||!['lite','full'].includes(value))throw Error('invalid fixture write');
      window.writes.push(value);window.snapshot={...window.snapshot,value:{mode:value}};for(const notify of window.listeners)notify();
    }};
    const ctx={effect:fn=>fn(),locale:{register:(ns,dict)=>{window.dictionary=dict;return ()=>{}}},settingsScope:{bind:options=>{window.namespace=options.namespace;return scope}},slots:{inject:(name,fn)=>fn(),register:(entry,card)=>{window.slot=entry;window.Card=card;return ()=>{}}}};
    window.clientModule.apply(ctx);
    window.root=ReactDOM.createRoot(document.getElementById('app'));
    window.renderCard=lang=>window.root.render(React.createElement(window.Card,{...window.slot.inject(),t:key=>window.dictionary[lang][key]}));
    window.renderCard('zh');
    window.selectMode=value=>{const select=document.getElementById('wincu-tool-mode');select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}))};
    window.clickButton=text=>Array.from(document.querySelectorAll('button')).find(b=>b.textContent===text).click();
    void 0;
  `);
  await until(`!!document.getElementById('wincu-tool-mode')`);
  assert.equal(await evaluate('window.namespace'),'windows-computer-use');assert.equal(await evaluate('window.slot.name'),'settings.plugin.item');
  await evaluate(`window.selectMode('full')`);await until(`!Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='保存').disabled`);
  assert.deepEqual(await evaluate('window.writes'),[],'Selection must not persist before Save');
  await evaluate(`window.clickButton('取消修改')`);await until(`document.getElementById('wincu-tool-mode').value==='lite'`);
  await evaluate(`window.selectMode('full')`);await evaluate(`window.clickButton('保存')`);await until(`document.body.textContent.includes('已保存')`);
  assert.deepEqual(await evaluate('window.writes'),['full']);
  await evaluate(`window.selectMode('lite')`);await evaluate(`window.clickButton('保存')`);await until(`window.snapshot.value.mode==='lite'`);
  await evaluate(`window.failSave=true;window.selectMode('full')`);await evaluate(`window.clickButton('保存')`);await until(`document.body.textContent.includes('fixture rejected save')`);
  assert.equal(await evaluate('window.snapshot.value.mode'),'lite');
  const beforeDiscard=paintCount;
  await evaluate(`window.clickButton('取消修改')`);
  await until(`document.getElementById('wincu-tool-mode').value==='lite'&&!document.body.textContent.includes('fixture rejected save')`);
  const paintDeadline=Date.now()+5000;
  while(paintCount<=beforeDiscard){if(Date.now()>paintDeadline)throw Error('Settings card did not paint after discard');await new Promise(r=>setTimeout(r,20));}
  assert.ok(paintedImage&&!paintedImage.isEmpty(),'Settings card screenshot must contain rendered pixels');
  fs.writeFileSync(path.join(process.env.WCU_SETTINGS_TEST_ROOT,'settings-card.png'),paintedImage.toPNG());
  await evaluate(`window.renderCard('en')`);await until(`document.body.textContent.includes('Tool mode')`);
  await evaluate(`window.snapshot={...window.snapshot,writable:false};for(const notify of window.listeners)notify()`);await until(`document.getElementById('wincu-tool-mode').disabled`);
  const report={passed:true,slot:'settings.plugin.item',namespace:'windows-computer-use',writes:await evaluate('window.writes'),stagedSave:true,discard:true,errorPreservesValue:true,readOnly:true,languages:['zh','en'],fixture:'Actual shipped React card in hidden Chromium; settings scope is a deterministic fixture',screenshot:path.join(process.env.WCU_SETTINGS_TEST_ROOT,'settings-card.png')};
  fs.writeFileSync(path.join(process.env.WCU_SETTINGS_TEST_ROOT,'results.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));win.destroy();app.quit();
}).catch(error=>{console.error(error.stack);app.exit(1)});
