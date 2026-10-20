import {GlobalWorkerOptions,getDocument,OPS} from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
GlobalWorkerOptions.workerSrc=workerUrl;
export async function readStoryPdf(file,onprogress=()=>{},signal){
 if(!file||!(/\.pdf$/i.test(file.name)||file.type==='application/pdf'))throw Error('Choose a PDF document.');
 if(file.size>40*1024*1024)throw Error('Choose a PDF smaller than 40 MB.');
 const task=getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false});
 const cancel=()=>task.destroy();signal?.addEventListener('abort',cancel,{once:true});
 try{const pdf=await task.promise;if(pdf.numPages>500)throw Error('Import supports up to 500 pages. Split larger manuscripts into volumes.');const pages=[],images=[],imageWarnings=[],hashes=new Set();
  for(let n=1;n<=pdf.numPages;n++){if(signal?.aborted)throw Error('Import canceled');const page=await pdf.getPage(n),content=await page.getTextContent();let text='',lastY=null;
   for(const item of content.items){if(!('str'in item))continue;const y=item.transform[5];if(lastY!==null&&Math.abs(y-lastY)>3&&!text.endsWith('\n'))text+='\n';text+=item.str+(item.hasEOL?'\n':' ');lastY=y;}
   pages.push({number:n,text:text.trim(),textFound:!!text.trim()});
   try{const ops=await page.getOperatorList();for(let i=0;i<ops.fnArray.length;i++){
    const op=ops.fnArray[i];if(op!==OPS.paintImageXObject&&op!==OPS.paintInlineImageXObject)continue;
    if(images.length>=200){if(!imageWarnings.includes('More than 200 embedded images. Remaining images are preserved in the original PDF.'))imageWarnings.push('More than 200 embedded images. Remaining images are preserved in the original PDF.');break;}
    let decoded=ops.argsArray[i][0];if(typeof decoded==='string'){const objects=decoded.startsWith('g_')?page.commonObjs:page.objs;decoded=await new Promise(resolve=>{const timer=setTimeout(()=>resolve(null),4000);objects.get(decoded,value=>{clearTimeout(timer);resolve(value);});});}
    if(!decoded||decoded.width<32||decoded.height<32)continue;
    if(decoded.width*decoded.height>16000000){imageWarnings.push('Page '+n+': a large image is preserved in the original PDF; import it separately.');continue;}
    const canvas=document.createElement('canvas');canvas.width=decoded.width;canvas.height=decoded.height;const ctx=canvas.getContext('2d');
    if(decoded.bitmap)ctx.drawImage(decoded.bitmap,0,0);else if(decoded.data){const pixels=new Uint8ClampedArray(decoded.width*decoded.height*4),data=decoded.data;for(let k=0;k<decoded.width*decoded.height;k++){const j=k*4;if(decoded.kind===1){const stride=Math.ceil(decoded.width/8),bit=data[Math.floor(k/decoded.width)*stride+Math.floor(k%decoded.width/8)]>>(7-k%decoded.width%8)&1;pixels[j]=pixels[j+1]=pixels[j+2]=bit?255:0;}else if(decoded.kind===2){pixels[j]=data[k*3];pixels[j+1]=data[k*3+1];pixels[j+2]=data[k*3+2];}else{pixels[j]=data[j];pixels[j+1]=data[j+1];pixels[j+2]=data[j+2];}pixels[j+3]=decoded.kind===3?data[j+3]:255;}ctx.putImageData(new ImageData(pixels,decoded.width,decoded.height),0,0);}else continue;
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));canvas.width=canvas.height=1;if(!blob)continue;
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))).map(n=>n.toString(16).padStart(2,'0')).join('');if(hashes.has(hash))continue;hashes.add(hash);
    images.push({id:'pdf-image-'+n+'-'+i,page:n,width:decoded.width,height:decoded.height,file:new File([blob],'page-'+n+'-image-'+(images.length+1)+'.png',{type:'image/png'})});
   }}catch{imageWarnings.push('Page '+n+': some embedded images need manual import. The original PDF retains them.');}
   page.cleanup();onprogress({current:n,total:pdf.numPages});}
  return{pages,images,imageWarnings,text:pages.map(p=>p.text).join('\n\n'),name:file.name,scannedPages:pages.filter(p=>!p.textFound).map(p=>p.number),pageCount:pages.length};
 }catch(e){if(e.name==='PasswordException')throw Error('This PDF is password protected. Import an unlocked copy.');throw e;}finally{signal?.removeEventListener('abort',cancel);await task.destroy();}
}
