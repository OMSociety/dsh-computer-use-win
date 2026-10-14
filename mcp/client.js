// Browser entry, evaluated by DSH's module loader; no build or bundled React.
window.__ModuleLoader__.load({
  id: 'dsh-computer-use-win',
  factory: () => {
    const React = require('react');
    const h = React.createElement;
    const NS = 'windowsComputerUse.settings';
    const dictionaries = {
      zh: {title:'Windows 桌面操作',mode:'工具模式',lite:'精简模式',full:'全能模式',hint:'精简模式保留常用工具，其余按需加载。保存后重载 MCP worker，临时加载列表会复位。',save:'保存',discard:'取消修改',saved:'已保存',failed:'保存失败',unavailable:'当前宿主未提供此插件的可写设置。'},
      en: {title:'Windows computer use',mode:'Tool mode',lite:'Lite',full:'Full',hint:'Lite keeps common tools and loads others on demand. Saving reloads the MCP worker and resets temporary tool loads.',save:'Save',discard:'Discard changes',saved:'Saved',failed:'Save failed',unavailable:'This host does not expose writable settings for this plugin.'}
    };
    function Card({scope,t}) {
      const state = React.useSyncExternalStore(listener => scope.subscribe(listener), () => scope.getSnapshot());
      const saved = state.value?.mode ?? 'lite';
      const [draft,setDraft] = React.useState(saved);
      const [dirty,setDirty] = React.useState(false);
      const [saving,setSaving] = React.useState(false);
      const [message,setMessage] = React.useState('');
      React.useEffect(() => { if (!dirty) setDraft(saved); },[saved,dirty]);
      const save = async () => {
        setSaving(true); setMessage('');
        try { await scope.set('mode',draft); setDirty(false); setMessage(t('saved')); }
        catch (error) { setMessage(t('failed')+': '+String(error.message||error)); }
        finally { setSaving(false); }
      };
      return h('li',{ 'data-wincu-settings':'true',style:{listStyle:'none',padding:'16px',border:'1px solid var(--dsw-alias-border-l2,#ddd)',borderRadius:'12px'} },
        h('h3',null,t('title')),
        h('label',{htmlFor:'wincu-tool-mode'},t('mode')),
        h('select',{id:'wincu-tool-mode',value:draft,disabled:saving||!state.writable,onChange:event=>{setDraft(event.target.value);setDirty(event.target.value!==saved);setMessage('');},style:{margin:'0 12px',padding:'6px'}},
          h('option',{value:'lite'},t('lite')),h('option',{value:'full'},t('full'))),
        h('p',null,t('hint')),
        !state.writable&&h('p',{role:'status'},t('unavailable')),
        h('button',{type:'button',disabled:!dirty||saving||!state.writable,onClick:save},t('save')),
        h('button',{type:'button',disabled:!dirty||saving,onClick:()=>{setDraft(saved);setDirty(false);setMessage('');},style:{marginLeft:'8px'}},t('discard')),
        message&&h('p',{role:'status'},message));
    }
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS,dictionaries));
      const scope = ctx.settingsScope.bind({namespace:'windows-computer-use'});
      ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
        name:'settings.plugin.item',id:'windows-computer-use',order:30,locale:NS,inject:()=>({scope})
      },Card));
    }
    return {apply,inject:['slots','locale','settingsScope']};
  }
});
