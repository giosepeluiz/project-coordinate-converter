const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf8');

// Update timeout to 7s
matches = c.match(/setTimeout\(\(\) => setToastMessage\(\"\"\), \d+\);/g);
if(matches) {
  c=c.replace(matches[0], 'setTimeout(() => setToastMessage(""), 7000);');
}

// Update animation class
matches2 = c.match(/(<div className=\"fixed.*?){toastMessage}(<\/div>)/);
if(matches2) {
  let div = matches2[1];
  div = div.replace(/animate-[slide-bounce]+\ b?/, 'animate-[tooltipSlide_7s_ease-in-out_forwards]');
  div = div.replace(/animate-[fadeInUp_0.5s_ease-out_forwards]?/, 'animate-[tooltipSlide_7s_ease-in-out_forwards]');
  c = c.replace(matches2[0], div + '{toastMessage}' + matches2[2]);
}

fs.writeFileSync('src/app/page.tsx', c);
