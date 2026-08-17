import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=n=>fs.readFileSync(new URL(n,import.meta.url),'utf8');
const js=read('./app-v422.js'),css=read('./styles-v422.css'),html=read('./index.html'),sw=read('./sw.js');
const required=[
  'Delete transaction','Merge/Delete account','Delete recurring payment','Delete definition',
  'data-v422-entity-delete','+ Category','+ Account','+ Loan','+ Recurring','+ Goal',
  '+ Asset','+ Investment','+ Policy','+ Definition','+ Cash','+ Import','+ Record',
  'fullTransactionEditor','accountEditor422','recurringEditor422','definitionEditor422','entityEditor422',
  'requireDeleteCredential','safeAccountDelete','addCategoryDialog'
];
for(const marker of required)assert.ok(js.includes(marker),`missing app-v422 marker: ${marker}`);
assert.ok(js.includes("type=\"button\" id=\"v422DeleteTxInEditor\""),'transaction editor delete must be non-submit');
assert.ok(js.includes("type=\"button\" id=\"v422DeleteAccountInEditor\""),'account editor delete must be non-submit');
assert.ok(js.includes("type=\"button\" id=\"v422DeleteRecurringInEditor\""),'recurring editor delete must be non-submit');
assert.ok(js.includes("data-v42-cash-edit"),'cash edit must route through the full transaction editor');
assert.ok(js.includes("accountTypeId" )&&js.includes("scope")&&js.includes("creditLimit"),'account editor must expose type/scope/credit metadata');
assert.ok(js.includes("categoryId")&&js.includes("paymentMethodId")&&js.includes("autoDebit"),'recurring editor must expose relational fields');
assert.ok(css.includes('.v422-editor-actions')&&css.includes('.v422-context-add'),'v4.2.2 responsive CRUD styles missing');
assert.ok(html.includes('styles-v422.css?v=4.2.2')&&html.includes('app-v422.js?v=4.2.2'),'v4.2.2 assets not wired');
assert.ok(sw.includes("shini-v422-static-1")&&sw.includes("app-v422.js?v=4.2.2"),'v4.2.2 service-worker cache not rotated');
const contextLabels=[...js.matchAll(/'([^']+)'\:\['\+ ([^']+)'/g)].map(m=>`${m[1]}:${m[2]}`);
assert.ok(contextLabels.length>=13,`expected >=13 contextual create actions, got ${contextLabels.length}`);
console.log(`SHINI v4.2.2 contextual CRUD QA PASS (${required.length} required markers, ${contextLabels.length} contextual actions)`);
