const express = require('express');
const app = express();
const vision = require('@google-cloud/vision');
 
const client = new vision.ImageAnnotatorClient();
let Texto = '';

const documentos = ['BIRD - NFE 25190-1.jpg','CLARO  NF 28606751-1.jpg','KONIMAGEM - NFE 12650-1.jpg','PHILIPS - NFS 110393-1.jpg', 'PUNTO - NFA 14967-1.jpg','BoletoFoto.jpeg']

async function OCR(){
  const [result] = await client.textDetection(`./Documentos/${documentos[5]}`);
  Texto = result.fullTextAnnotation.text;
  console.log(`Conteudo do arquivo:`);
  console.log(Texto);
}
OCR();
 

app.listen(3333) 