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

// router.get('/biuTable/1', (req, res) => {
//   const data = res.data;
//   console.log(data);
//   let befDay = 0;
//   let befYield = 0;
//   for (let i = 0; i < data.length; i++) {
//     console.log('data[i]', data[i]);
//     if (data[i].day === 5) {
//       const oneDayYield = data[0].yield / 5;
//       for (let j = 1; j < 5; j++) {
//         const yield = oneDayYield * j;
//         insertData(i, yield);
//       }
//       befYield = data[0].yield;
//       befDay = data[0].day;
//     } else {
//       const oneDayYield = (data[0].yield - befYield) / 10;
//       for (let j = 1; j < data[0].day - befDay; j++) {
//         const todayYield = oneDayYield + befYield;
//         insertData(befDay + j, todayYield);
//         befYield = todayYield;
//       }
//       befDay = data[0].day;
//     }
//   }
// });
// const getBiuData = () => {
// //   let day = 5;
// //   console.log(day);
// //   router.get('/biuTable/1', (req, res) => {
// //     const data = res.data;
// //     console.log(data);
// //     let befDay = 0;
// //     let befYield = 0;
// //     for (let i = 0; i < data.length; i++) {
// //       console.log('data[i]', data[i]);
// //       if (data[i].day === 5) {
// //         let oneDayYield = data[0].yield / 5;
// //         for (let j = 1; j < 5; j++) {
// //           //sql post onedayyield 를 넣고 i를 곱해주면 됨 만큼 곱해서 넣어줌
// //           //day = i , yield = onedayyield * i
// //           router.post('/biuTableInsert/', {
// //             data: data[i],
// //             day: i,
// //             yield: oneDayYield * i,
// //           });
// //         }
// //         befYield = data[0].yield;
// //         befDay = data[0].day;
// //       } else {
// //         let oneDayYield = (data[0].yield - befYield) / 10;
// //         // for (let j = 1; j < data[0].day - befDay; j++) {
// //         //   let todayYield = oneDayYield + befYield;
// //         //   //sql post ondayyield를 befYield에 더해서 insert 끝날때마다 befYield는 post해준 yield여야함
// //         //   //day는 befDay+i , yield = todayYield
// //         //   router
// //         //     .post('/biuTableInsert/', {
// //         //       data: data[i],
// //         //       day: befDay + 1,
// //         //       yield: todayYield,
// //         //     })
// //         //     .then((res) => {
// //         //       console.log('res', res);
// //         //     })
// //         //     .catch((error) => {
// //         //       console.log('error', error);
// //         //     });
// //         //   befYield = todayYield;
// //         // }
// //         befDay = data[0].day;
// //       }
// //     }
// //   });
// };

// db.query(
//       `INSERT INTO dw_biu (title,subTitle,sancha,totalMinYield,totalMaxYield,issueDate,day,dataCount,yield,milkCell,fat,Protein,MSNF,MUN) VALUES ('${vdata.title}','${vdata.subTitle}',${vdata.sancha},${vdata.totalMinYield},${vdata.totalMaxYield},NOW(),${day},${vdata.dataCount},${yield},${vdata.milkCell},${vdata.fat},${vdata.protein},${vdata.MSNF},${vdata.MUN})`,
//       [vdata, day, yield],
//       (err, result) => {
//         if (err) {
//           log('err', err);
//         } else {
//           res.send(result);
//         }
//       }
//     );
//비유테이블 1산차 day랑 yield 가져옴
// router.get('/biuTable/1', (req, res) => {
//   db.query(
//     `
//     SELECT *  FROM dw_biu WHERE sancha = 1
//     `,
//     (err, result) => {
//       if (err) {
//         log(err);
//       } else {
//         res.send(result);
//       }
//     }
//   );
// });

// router.post('/biuTableInsert/', (req, res) => {
//   const vdata = req.body.data;
//   const day = req.body.day;
//   const yield = req.body.yield;

//   db.query(
//     `INSERT INTO dw_biu (title,subTitle,sancha,totalMinYield,totalMaxYield,issueDate,day,dataCount,yield,milkCell,fat,Protein,MSNF,MUN) VALUES ('${vdata.title}','${vdata.subTitle}',${vdata.sancha},${vdata.totalMinYield},${vdata.totalMaxYield},NOW(),${day},${vdata.dataCount},${yield},${vdata.milkCell},${vdata.fat},${vdata.protein},${vdata.MSNF},${vdata.MUN})`,
//     [vdata, day, yield],
//     (err, result) => {
//       if (err) {
//         log('err', err);
//       } else {
//         res.send(result);
//       }
//     }
//   );
// });
// // 비유테이블 1회

// getBiuData();
