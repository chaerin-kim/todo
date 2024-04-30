const { resolveInclude } = require('ejs');
const express = require('express');
const app = express();
const port = 4000;

// 몽고디비 연결
const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://chery5809:coflsdl5809@cluster0.e74lvkp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);
// mongodb+srv://chery5809:<password>@cluster0.e74lvkp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

// ejs 설치
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//methodOverride 설치
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

const getDB = async () => {
  await client.connect();
  return client.db('todo');
};


app.get('/', (req, res) => {
  res.render('index')
})

app.get('/list', async (req, res) => {
  try {
    const db = await getDB(); //함수 호출
    const posts = await db
      .collection('posts')
      .find()
      .sort({ _id: -1 })
      .toArray();
    // console.log(posts);
    res.render('list', { posts }); //{posts : posts}
  } catch (error) {
    console.error(error);
  }
});

app.get('/detail/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  console.log(id);
  try {
    const db = await getDB(); 
    const post = await db.collection('posts').findOne({_id: id})
    res.render('detail', { post }); 
  } catch (error) {
    console.error(error);
  }
});



app.post('/add', async (req, res) => {
  console.log(req.body);
  const { title, dateOfGoals,today } = req.body;
  try {
    const db = await getDB(); 
    const result = await db.collection('counter').findOne({ name: 'counter' });

    await db
      .collection('posts')
      .insertOne({ _id: result.totalPost+1, title, dateOfGoals, today }); //today 정보 추가
    await db
      .collection('counter')
      .updateOne({ name: 'counter' }, { $inc: { totalPost: 1 } });
  } catch (error) {
    console.error(error);
  }

  res.redirect('/list'); 
});


// 1. delete
app.post('/delete', async (req, res)=>{
  const id = parseInt(req.body.postNum)
  console.log(id);

  try {
    const db = await getDB()
    await db.collection('posts').deleteOne({_id:id})
    res.redirect('/list');
  } catch (error) {
    console.error(error);
  }

})

// 2-1. 수정 페이지
app.get('/edit/:id', async (req, res)=>{
  const id = parseInt(req.params.id)
  console.log('id 확인',id);
  try {
    const db = await getDB()
    const post = await db.collection('posts').findOne({_id: id})
    res.render('edit', {post});
  } catch (error) {
    console.error(error);
  }
})

//2-2. 수정기능
app.post('/update',async (req, res)=>{
  console.log('update---',req.body);
  const {id, title, dateOfGoals, today} = req.body;
  try {
    const db = await getDB();
    await db.collection('posts').updateOne({_id: parseInt(id)},{$set: {id, title, dateOfGoals, today}}); //수정사항 변경 및 업뎃
    res.redirect('/list');
  } catch (error) {
    console.error(error);
  }
} )


app.listen(port, () => {
  console.log(`서버 실행중 ... ${port}`)
})























