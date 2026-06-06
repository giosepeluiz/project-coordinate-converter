const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf8');
matches = c.match(/setTimeout\(\(\) => setToastMessage(\"'|\'\'|\"\")\), \d+\)+/g);
if(matches) {
  c=c.replace(matches[0], 'setTimeout(() => setToastMessage(""), 7500)');
}
matches2 = c.match(/(<div className=\"fixed.*?){.*?}(<\/div>)/);
if(matches2) {
  let div = matches2[1];
  div = div.replace(/animate-[\\w\\-\\.%_\\[\\]]+/g, 'animate-[tooltipSlide_7s_ease-in-out_forwards]');
  c = c.replace(matches2[0], div + '{toastMessage}' + matches2[2]);
}
fs.writeFileSync('src/app/page.tsx', c);