const fs = require('fs');
const readline = require('readline');

let isHeader = true;
let year, primaryType, description, header, arrest;

let jsonAssaultData = {};
let jsonData = {};

const stream = readline.createInterface({
  input: fs.createReadStream('./csvData/chicagocrimes.csv'),
});

stream.on('line', (line) => {
  if (isHeader) {
    header = line.split(',');
    year = header.indexOf('Year');
    primaryType = header.indexOf('Primary Type');
    description = header.indexOf('Description');
    arrest = header.indexOf('Arrest');
    isHeader = false;
  } else {
    const row = line.split(',');
    if (row[primaryType] === 'THEFT' &&
       (row[year] >= 2001 && row[year] <= 2018)) {
      filterationTheft(row[primaryType], row[description], row[year]);
    }

    if (row[primaryType] === 'ASSAULT' &&
       (row[year] >= 2001 && row[year] <= 2018)) {
      filterationAssault(row[primaryType], row[arrest], row[year]);
    }
  }
});

stream.on('close', () => {
  saveJson('theft',jsonData);
  saveJson('assault',jsonAssaultData);
});  

function filterationTheft(primaryType, row, year) {
  let obj = {};
    if (row === 'OVER $500') {
      if (jsonData[year]) {
        jsonData[year].theftOver500++;
      } else {
        obj.theftOver500 = 1;
        obj.theftUnder500 = 0;
        jsonData[year] = obj;
      }
    } else if (row === '$500 AND UNDER') {
      if (jsonData[year]) {
        jsonData[year].theftUnder500++;
      } else {
        obj.theftOver500 = 0;
        obj.theftUnder500 = 1;
        jsonData[year] = obj;
      }
    }
}

function filterationAssault(primaryType, row, year) {
  let objArrest = {};
  if (row === 'true') {
    if (jsonAssaultData[year]) {
      jsonAssaultData[year].arrested++;
    } else {
      objArrest.arrested = 1;
      objArrest.escaped = 0;
      jsonAssaultData[year] = objArrest;
    }
  } else {
    if (jsonAssaultData[year]) {
      jsonAssaultData[year].escaped++;
    } else {
      objArrest.arrested = 0;
      objArrest.escaped = 1;
      jsonAssaultData[year] = objArrest;
    }
  }
}

function saveJson(filename, data) {
  fs.writeFile('./jsonData/' + filename+'.json', JSON.stringify(data), (err) => {
    if (err) throw err;
    console.log('File ' + filename + ' Saved!');
  });
  fs.writeFile('./jsonData/' + 'assault.json', JSON.stringify(jsonAssaultData), (err) => {
    if (err) throw err;
    console.log('File Saved!');
  });
}
