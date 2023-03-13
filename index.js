const mysql = require('mysql');
const express = require('express');
const router = require('express').Router();
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let db = null;
try {
  db = mysql.createConnection({
    connectionLimit: 10,
    acquireTimeout: 10000,
    host: '127.0.0.1',
    user: 'root',
    password: 'ekdnsel',
    database: 'dawoon',
  });
} catch (error) {
  console.log(error);
}
const insertData = (vdata, day, yield) => {
  const data = {
    day: day,
    yield: yield,
  };
  if (yield !== undefined) {
    db.query(
      `INSERT INTO dw_biu (title,subTitle,sancha,totalMinYield,totalMaxYield,issueDate,day,dataCount,yield,milkCell,fat,Protein,MSNF,MUN) VALUES ('${vdata.title}','${vdata.subTitle}',${vdata.sancha},${vdata.totalMinYield},${vdata.totalMaxYield},NOW(),${day},${vdata.dataCount},${yield},${vdata.milkCell},${vdata.fat},${vdata.Protein},${vdata.MSNF},${vdata.MUN})`,
      (err, result) => {
        if (err) throw err;
        console.log('Data added to database');
      }
    );
  } else {
    console.log('Error: yield is undefined');
  }
};

const getBiuData = () => {
  db.query(
    `
        SELECT *  FROM dw_biu WHERE sancha = 3
        `,
    (err, result) => {
      if (err) throw err;
      let data = result;
      let befDay = 0;
      let befYield = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i].day === 5) {
          const oneDayYield = data[i].yield / 5;
          for (let j = 1; j < 5; j++) {
            const yield = oneDayYield * j;
            insertData(data[i], j, yield);
          }
        } else {
          befYield = data[i - 1].yield;
          befDay = data[i].day - 10;
          let oneDayYield = (data[i].yield - data[i - 1].yield) / 10;
          for (let j = 1; j < 10; j++) {
            const todayYield = oneDayYield + befYield;
            insertData(data[i], befDay + j, todayYield);
            befYield = todayYield;
          }
        }
      }
    }
  );
};
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database  ');
  getBiuData();
});
