(async()=>{
  const mount=async(id,file)=>{const r=await fetch(file);if(!r.ok)throw new Error(file);document.getElementById(id).innerHTML=await r.text()};
  try{
    await Promise.all([mount('faceMount','./face.html'),mount('contentMount','./content.html')]);
    const s=document.createElement('script');s.src='./app.js';document.body.appendChild(s);
  }catch(e){console.error(e);document.getElementById('faceMount').innerHTML='<p style="color:#fff;padding:24px">Не удалось загрузить интерактив. Обновите страницу.</p>'}
})();
