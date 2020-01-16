const express = require('express');
const app = express();

const vision = require('@google-cloud/vision');
const {Storage} = require('@google-cloud/storage');
 
const client = new vision.ImageAnnotatorClient();
const storage = new Storage();
const bucketName = 'ocr_pdf_fidi';
const fileName = 'Alberto-Boleto.PDF';
const localFileName = `./images/${fileName}`;
const outputPrefix = 'results'
 

async function lerArquivoPDF(){
  await subirArquivo();
  await converterArquivo();
  await lerblob();
}
 
async function subirArquivo(){
  
  console.log('Fazendo o upload do arquivo');

  await storage.bucket(bucketName).upload(localFileName, {
    gzip: true,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });
  console.log(`${fileName} uploaded to ${bucketName}.`);  
}

async function converterArquivo(){

  console.log('Convertendo o  arquivo');
  const gcsSourceUri = `gs://${bucketName}/${fileName}`;
  const gcsDestinationUri = `gs://${bucketName}/${outputPrefix}/`;

  const inputConfig = {
    mimeType: 'application/pdf',
    gcsSource: {
      uri: gcsSourceUri,
    },
  };
  const outputConfig = {
    gcsDestination: {
      uri: gcsDestinationUri,
    },
  };
  const features = [{type: 'DOCUMENT_TEXT_DETECTION'}];

  const request = {
    requests: [
      {
        inputConfig: inputConfig,
        features: features,
        outputConfig: outputConfig,
      },
    ],
  };

  const [operation] = await client.asyncBatchAnnotateFiles(request);
  const [filesResponse] = await operation.promise();
  const destinationUri = filesResponse.responses[0].outputConfig.gcsDestination.uri;
  console.log('Json saved to: ' + destinationUri); 
}

async function lerblob(){
  console.log('lendo  arquivo convertido.');
  const prefix = `${outputPrefix}/`;
  const delimiter = '/';
  const options = {
    prefix: prefix,
  };

  if (delimiter) {
    options.delimiter = delimiter;
  }

  // Lists files in the bucket, filtered by a prefix
  const [files] = await storage.bucket(bucketName).getFiles(options);

  console.log('Files:');
  files.forEach(file => {
    console.log('         ');
    console.log(file.name);
    console.log('-------------------------------------');
    
    let fileContents = Buffer.from('');
    file.createReadStream()
      .on('data', function(chunk) {
        fileContents = Buffer.concat([fileContents, chunk]);
        console.log(fileContents.toString());
      })
      .on('complete', function() {
      });
  
  });

  
}

lerArquivoPDF();
app.listen(3333) 