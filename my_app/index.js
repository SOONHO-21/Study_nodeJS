import express from 'express';
import nunjucks from 'nunjucks';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

const __dirname = path.resolve();   //현재 디렉토리 my_app

const app = express();

//file path
// my_app/data/writing.json
const filepath = path.join(__dirname, 'data', 'writing.json');

// body parser set
app.use(bodyParser.urlencoded({ extended: false })); // express 기본 모듈 사용
app.use(bodyParser.json());

// view engine set
app.set('view engine', 'html'); // main.html -> main(.html)

// nunjucks
nunjucks.configure('views', {
    watch: true, // html 파일이 수정될 경우, 다시 반영 후 렌더링
    express: app
})

mongoose    //DB 연결 패키지
  .connect('mongodb://127.0.0.1:27017')
  .then(() => console.log('DB 연결 성공'))
  .catch(e => console.error(e));

//Schema 정의하기
//각각의 Schema들은 MongoDB collection과 매칭되고 collection의 전체적인 구조를 정의
//mongoose set
const { Schema } = mongoose;

const writingSchema = new Schema({
  title: String,
  contents: String,
  date: {
    type: Date,
    default: Date.now,
  }
})

const Writing = mongoose.model('Writing', writingSchema); //쓰기 스키마

// middleware
// main page GET
app.get('/', async (req, res) => {
  // const fileData = fs.readFileSync(filepath);
  // const writings = JSON.parse(fileData);

  let writings = await Writing.find({})

  res.render('main', { list: writings });
});

app.get('/write', (req, res) => {
    res.render('write');
});
app.post('/write', async (req, res) => {
    const title = req.body.title;
    const contents = req.body.contents;

    //mongodb에 저장
    const writing = new Writing({
      title: title,
      contents: contents
    })
    const result = await writing.save().then(() => {
      console.log('Success')
      res.render('detail', { 'detail': { title: title, contents: contents } });
    }).catch((err) => {
      console.error(err)
      res.render('write')
    })
});

app.get('/edit/:id', async (req, res) => {  //글 수정 get
  const id = req.params.id;

  const edit = await Writing.findOne({ _id: id }).then((result) => {
      res.render('detail', { 'edit': result })
  }).catch((err) => {
      console.error(err)
  })
})

app.post('/edit/:id', async (req, res) => {   //글 수정 post
  const id = req.params.id;
  const title = req.body.title;
  const contents = req.body.contents;
  
  //replaceOne : 문서 수정
  const edit = await Writing.replaceOne({ _id: id }, { title: title, contents: contents }).then((result) => {
      console.log('update success')
      res.render('detail', { 'detail': { 'id': id, 'title': title, 'contents': contents } });
  }).catch((err) => {
      console.error(err)
  })
})

app.post('/delete/:id', async (req, res) => {   //상세페이지 post
  const id = req.params.id;

  const delete_content = await Writing.deleteOne({ _id: id }).then(() => {
    console.log('delete success')
    res.redirect('/')
  }).catch((err) => {
    console.error(err)
  })
})
app.get('/detail/:id', async (req, res) => {    //상세페이지 get
  try {
    const id = req.params.id;
    const detail = await Writing.findOne({ _id: id });
    res.render('detail', { detail: detail });
  } catch (err) {
    console.error(err);
    // 에러를 적절하게 처리합니다. 예를 들어, 서버 에러 응답을 보낼 수 있습니다.
    res.status(500).send('오류가 발생했습니다');
  }
})

app.listen(3000, () => {
    console.log('Server is running');
});