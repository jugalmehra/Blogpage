import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';
import path from 'path';


const app = express();

app.use(express.static(path.join(__dirname,'/build')));
app.use(bodyParser.json());

app.get('/api/articles/:name', async(req, res) => {
    try{
        const Articlename = req.params.name;

        const client = await MongoClient.connect('mongodb://localhost:27018', {useNewUrlParser : true});
        const db = client.db('my-blog');

        const Articlesinfo = await db.collection('articles').findOne({ name: Articlename });
        res.status(200).json(Articlesinfo);
        client.close();
    }catch(error){
        res.status(500).json({message: 'error connecting to db',error});
    }

});

app.post('/api/articles/:name/upvotes', async (req, res) => {
    try{
        const Articlename = req.params.name;

        const client = await MongoClient.connect('mongodb://localhost:27018', {useNewUrlParser : true});
        const db = client.db('my-blog');

        const Articlesinfo = await db.collection('articles').findOne({name: Articlename});
        await db.collection('articles').updateOne({name: Articlename}, {
            '$set': {
                upvotes: Articlesinfo.upvotes + 1,
            },
        });

        const updatedArticleinfo = await db.collection('articles').findOne({name: Articlename});

        res.status(200).json(updatedArticleinfo);

        client.close();

    }catch(error){
        res.status(500).json({message: 'error connecting to db',error});
    }
    


});

app.post("/api/articles/:name/add-comments", async (req, res) => {
    try{
        const {username,text} = req.body;
        const Articlename = req.params.name;

        const client = await MongoClient.connect('mongodb://localhost:27018', {useNewUrlParser : true});
        const db = client.db('my-blog');

        const Articlesinfo = await db.collection('articles').findOne({name: Articlename});
        await db.collection('articles').updateOne({name: Articlename}, {
            '$set': {
                comments: Articlesinfo.comments.concat({username,text}),
            },
        });

        const updatedArticleinfo = await db.collection('articles').findOne({name: Articlename});

        res.status(200).json(updatedArticleinfo);

        client.close();


    }catch(error){
        res.status(500).json({message: 'error connecting to db',error});
    }
   
app.get('*', (req,res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
})
   

    

});

app.listen(7500, () => console.log('listening at port 7500'));