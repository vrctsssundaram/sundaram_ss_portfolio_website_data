// SHINI v4.2.3 post-merge interaction audit fix.
(()=>{'use strict';
const VERSION='4.2.3',base=globalThis.SHINIV422,context=base?.CONTEXT;
if(context){
  const action=context['Data Management']||['+ Import',()=>document.querySelector('#nav [data-page="bulk"]')?.click()];
  context['Data & Sync']=action;
  delete context['Data Management'];
}
globalThis.SHINIV423={VERSION,dataSyncContext:Boolean(context?.['Data & Sync'])};
})();
