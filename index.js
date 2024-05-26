const admin = require('firebase-admin')
const express=require('express');
const cors=require('cors');


const port = 4000;

const app=express();

app.use(cors({origin:true}));

app.use(express.json())

var serviceAccount = require('./permissions.json');

//initalize firebase app from admin credential
admin.initializeApp({
    credential:admin.credential.cert(serviceAccount),
    databaseURL:"https://urlsaver-8b1ed-default-rtdb.firebaseio.com"
});


// create database reference
const db = admin.database();


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});

//create item in a collection
app.post('/create/:collection_name', (req, res) => {
    (async () => {
      try {

        const collectionName = req.params.collection_name;
        
        const data = req.body;
  
        // Reference to the specific collection
        const ref = db.ref(collectionName);


        ref.push(data, function (err) {
            if (err) {
              res
                .status(500)
                .send({ status: 500, message: 'Internal server error!' });
            } else {
              res
                .status(201)
                .send({ status: 201, message: 'New user created successfully!' });
            }
          });

      } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send({ error: 'Error saving data' });
      }
    })();
  });
  

// get items from collection
app.get('/read/:collection_name',(req,res)=>{
    (
        async()=>{
            try {
                let x = req.params.collection_name;
                const ref = db.ref(x);
                let response = [];
            
                // Use 'once' instead of 'on' to fetch data once and avoid persistent listening
                ref.once('value', (snapshot) => {
                  let data = Object.values(snapshot.val());
                  for (let obj of data) {
                    response.push(obj.role);
                  }
            
                  return res.status(200).send(response);
                }, (errorObject) => {
                  console.log('The read failed: ' + errorObject.name);
                  return res.status(500).send(errorObject);
                });
            
              } catch (error) {
                console.log(error);
                return res.status(500).send(error);
              }
        }
    )();
});
