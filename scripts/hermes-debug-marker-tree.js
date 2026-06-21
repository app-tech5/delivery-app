#!/usr/bin/env node
const WebSocket = require('ws');
const { buildOpenCalloutExpression } = require('./hermes-react-inspect');

async function evaluateHermes(ws, expression) {
  return new Promise((resolve, reject) => {
    const id = Date.now();
    const timer = setTimeout(() => reject(new Error('timeout')), 15000);
    const onMessage = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id !== id) return;
      clearTimeout(timer);
      ws.removeListener('message', onMessage);
      const val = msg.result?.result?.value;
      if (typeof val === 'string' && val.startsWith('{')) {
        resolve(JSON.parse(val));
        return;
      }
      resolve(msg.result?.result ?? msg.result);
    };
    ws.on('message', onMessage);
    ws.send(
      JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: { expression, returnByValue: true },
      })
    );
  });
}

async function main() {
  const markerId = process.argv[2] || 'restaurant-695d17d9ed0284bc20edc5c9';
  const openFirst = process.argv.includes('--open');
  const targets = await (await fetch('http://127.0.0.1:8081/json/list')).json();
  const t = targets.find((x) => x.description?.includes('Bridgeless')) || targets[0];
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => ws.once('open', r));

  if (openFirst) {
    console.log('open:', JSON.stringify(await evaluateHermes(ws, buildOpenCalloutExpression(markerId))));
    await new Promise((r) => setTimeout(r, 1500));
  }

  const expr = `(function(){
    var markerId = ${JSON.stringify(markerId)};
    var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    var markerFiber = null;
    var valueRef = null;
    function walk(f,d){ if(!f||d>250)return; var p=f.memoizedProps; if(p&&p.id===markerId&&p.latitude!=null) markerFiber=f; var v=f.memoizedProps&&f.memoizedProps.value; if(v&&typeof v.toggleMarkerId==='function') valueRef=v; walk(f.child,d+1); walk(f.sibling,d); }
    hook.renderers.forEach(function(_,rid){ hook.getFiberRoots(rid).forEach(function(r){ walk(r.current||r,0); }); });
    if(!markerFiber) return JSON.stringify({error:'no marker'});
    var nodes=[];
    function collect(f,d){
      if(!f||d>40)return;
      var n=''; var t=f.type; if(typeof t==='string')n=t; else n=t&&(t.displayName||t.name)||'';
      var sn=f.stateNode;
      nodes.push({
        depth:d,
        name:n,
        hasState:!!sn,
        measure:!!(sn&&typeof sn.measureInWindow==='function'),
        nodeMeasure:!!(sn&&sn.node&&typeof sn.node.measureInWindow==='function'),
        nodeKeys: sn && sn.node ? Object.keys(sn.node).slice(0,12) : [],
        keys: sn ? Object.keys(sn).slice(0,8) : [],
      });
      collect(f.child,d+1);
    }
    var hasCalloutFiber = nodes.some(function(n){ return n.name.indexOf('Callout') !== -1 || n.name.indexOf('MLRN') !== -1; });
    collect(markerFiber,0);

    var iconRct = nodes.find(function(n){ return n.name==='RCTView' && n.depth===6; });
    var testResults = {};
    function findRct(f,d){
      if(!f||d>15)return null;
      var t=f.type; var name=typeof t==='string'?t:(t&&(t.displayName||t.name)||'');
      if(name==='RCTView'&&f.stateNode) return f.stateNode;
      return findRct(f.child,d+1)||findRct(f.sibling,d);
    }
    var sn = findRct(markerFiber,0);
    if(sn){
      testResults.snKeys = Object.keys(sn);
      if(sn.node) testResults.nodeKeys = Object.keys(sn.node);
      if(sn.canonical){
        testResults.canonicalKeys = Object.keys(sn.canonical);
        var pi = sn.canonical.publicInstance;
        testResults.publicInstanceKeys = pi ? Object.keys(pi) : null;
        testResults.publicMeasure = !!(pi && typeof pi.measureInWindow === 'function');
        testResults.nativeTag = sn.canonical.nativeTag;
      }
    }
    var RN = globalThis.__turboModuleProxy && globalThis.__turboModuleProxy('UIManager');
    testResults.hasUIManager = !!RN;

    globalThis.__HERMES_DBG__ = { status: 'pending' };
    function measureHost(sn, label) {
      return new Promise(function(resolve) {
        if (!sn || !sn.canonical) { resolve({ label: label, error: 'no canonical' }); return; }
        var pi = sn.canonical.publicInstance;
        var tag = sn.canonical.nativeTag;
        if (pi && typeof pi.measureInWindow === 'function') {
          pi.measureInWindow(function(x,y,w,h){ resolve({ label: label, via: 'publicInstance', x:x,y:y,w:w,h:h }); });
          return;
        }
        resolve({ label: label, error: 'no measure', tag: tag, piKeys: pi ? Object.keys(pi) : null });
      });
    }
    var rcts = [];
    function collectRct(f,d){
      if(!f||d>20)return;
      var t=f.type; var name=typeof t==='string'?t:(t&&(t.displayName||t.name)||'');
      if(name==='RCTView'&&f.stateNode) rcts.push({depth:d, sn:f.stateNode});
      collectRct(f.child,d+1); collectRct(f.sibling,d);
    }
    collectRct(markerFiber,0);
    Promise.all(rcts.map(function(r,i){ return measureHost(r.sn, 'RCTView#'+i+'@'+r.depth); })).then(function(rects){
      globalThis.__HERMES_DBG__ = { status:'done', rects: rects };
    });

    var mt = markerFiber.type;
    return JSON.stringify({
      markerComponent: typeof mt==='string' ? mt : (mt.displayName||mt.name),
      activeId: valueRef ? valueRef.activeId : null,
      hasCalloutFiber: hasCalloutFiber,
      childCount: nodes.length,
      testResults: testResults,
      nodes: nodes,
      rctCount: rcts.length,
    }, null, 2);
  })()`;

  console.log(JSON.stringify(await evaluateHermes(ws, expr), null, 2));
  await new Promise((r) => setTimeout(r, 400));
  for (let i = 0; i < 15; i += 1) {
    const polled = await evaluateHermes(ws, `JSON.stringify(globalThis.__HERMES_DBG__ || {status:'pending'})`);
    if (polled.status === 'done') {
      console.log('measure:', JSON.stringify(polled, null, 2));
      break;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  ws.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
