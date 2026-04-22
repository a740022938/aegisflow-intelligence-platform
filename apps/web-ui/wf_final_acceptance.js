const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const outDir = 'C:/Users/74002/Desktop';
  const out = { f1:false,f2:false,f3:false,f4:false,f5:false, files:{}, dryRun:null, run:null, issues:[] };
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  let createReq=null, createResp=null, startReq=null, startResp=null;
  page.on('request', req => {
    const u=req.url();
    if(u.includes('/api/workflow-jobs') && req.method()==='POST'){ try{createReq=req.postDataJSON()}catch{} }
    if(u.includes('/start') && req.method()==='POST'){ try{startReq=req.postDataJSON()}catch{} }
  });
  page.on('response', async resp => {
    const u=resp.url();
    if(u.includes('/api/workflow-jobs') && resp.request().method()==='POST'){ try{createResp=await resp.json()}catch{} }
    if(u.includes('/start') && resp.request().method()==='POST'){ try{startResp=await resp.json()}catch{} }
  });

  await page.goto('http://127.0.0.1:5173/workflow-composer',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(1500);

  const sel=page.locator('select.workflow-select').first();
  await sel.selectOption({value:'backend:tpl-smart-flywheel-canvas-v1'});
  await page.waitForTimeout(1800);

  const node=page.locator('.flow-node').first();
  if(await node.count()) { await node.click(); await page.waitForTimeout(500); }
  const f1=path.join(outDir,'01_F1_参数面板.png'); await page.screenshot({path:f1,fullPage:true}); out.files.f1=f1;
  out.f1=(await page.locator('.prop-grid').count())>0 || (await page.locator('.panel').count())>0;

  const f2=path.join(outDir,'02_F2_端口类型.png'); await page.screenshot({path:f2,fullPage:true}); out.files.f2=f2;
  out.f2=(await page.locator('.react-flow__handle').count())>0;

  let f3ok=false;
  const hs=page.locator('.react-flow__handle');
  if(await hs.count()>=2){
    const a=await hs.nth(0).boundingBox(); const b=await hs.nth(1).boundingBox();
    if(a&&b){
      await page.mouse.move(a.x+a.width/2,a.y+a.height/2); await page.mouse.down();
      await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:10}); await page.mouse.up();
      await page.waitForTimeout(900);
      const t=(await page.locator('body').innerText()).toLowerCase();
      if(t.includes('无法连接')||t.includes('invalid')||t.includes('不兼容')||t.includes('不能连接')) f3ok=true;
    }
  }
  const f3=path.join(outDir,'03_F3_无效连线.png'); await page.screenshot({path:f3,fullPage:true}); out.files.f3=f3; out.f3=f3ok;

  const dry=page.locator('button:has-text("Dry Run"), button:has-text("试跑"), button:has-text("校验")').first();
  if(await dry.count()){ await dry.click().catch(()=>{}); await page.waitForTimeout(1200); }
  const txt=await page.locator('body').innerText();
  const f4=path.join(outDir,'04_F4_缺参提示.png'); await page.screenshot({path:f4,fullPage:true}); out.files.f4=f4;
  out.f4=/缺参|必填|required|参数.*缺失|missing/i.test(txt);

  const run=page.locator('button:has-text("运行"), button:has-text("Run"), button:has-text("启动"), button:has-text("执行")').first();
  if(await run.count()){ await run.click().catch(()=>{}); await page.waitForTimeout(2500); }
  const txt2=await page.locator('body').innerText();
  const f5=path.join(outDir,'05_F5_运行态.png'); await page.screenshot({path:f5,fullPage:true}); out.files.f5=f5;

  out.dryRun={request:createReq,response:createResp};
  out.run={request:startReq,response:startResp,jobId:(startResp&&(startResp.job_id||startResp.id))||(createResp&&(createResp.job_id||createResp.id))||null};
  out.f5=!!out.run.jobId || /运行中|queued|running|执行中/i.test(txt2);

  if(!out.f3) out.issues.push('F3 未检测到明确文案，可能为静默阻止');
  if(!out.f4) out.issues.push('F4 未捕获缺参提示，可能参数已满足');
  if(!out.f5) out.issues.push('F5 未抓到 job id/运行态');

  fs.writeFileSync(path.join(outDir,'wf_final_acceptance_result.json'),JSON.stringify(out,null,2),'utf8');
  await browser.close();
  console.log(JSON.stringify(out,null,2));
})();
