const express = require("express")
const secureEnv = require("secure-env")
const bodyParser = require("body-parser")
const cors = require("cors")
const mysql = require("mysql2/promise")

const app = express();

app.use(cors())
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyParser.json({limit: '50mb'}))

global.env = secureEnv({secret: 'mySecret'})

const PORT = global.env.APP_PORT;

const pool = mysql.createPool({
    host: global.env.MYSQL_SERVER,
    port: global.env.MYSQL_SVR_PORT,
    user: global.env.MYSQL_USERNAME,
    password: global.env.MYSQL_PASSWORD,
    database: global.env.MYSQL_SCHEMA,
    connectionLimit: global.env.MYSQL_CON_LIMIT,
});

const queryComputeOrdersView = `SELECT * from compute_orders WHERE id=?`;

const makeQuery = (sql, pool)=>{
    console.log(sql);
    return(async (args) => {
        const conn = await pool.getConnection();
        try{
            let results = await conn.query(sql,args||[])
            return results[0]
        }catch{
            console.log(err);
        }finally{
            conn.release();
        }
    })
}

const startApp = async(app,pool) => {
    const conn = await pool.getConnection(); 
    try{
        console.log("test database connection...");
        await conn.ping();
        conn.release();
        app.listen(PORT, ()=>{
            console.log("App is on port",PORT);
        })
    }catch(e){
        console.log(e);
    }
}

const executeComputeOrdersView = makeQuery(queryComputeOrdersView, pool);


app.get(`/order/total/:orderId`, (req,res)=>{
    const orderId = req.params.orderId;
    executeComputeOrdersView([orderId])
    .then((results)=>{
        console.log(results);
        if(results.length<=0){
            console.log("Results not found!");
        }
        res.format({
            html: ()=>{
                console.log('html');
                res.send(results)
            },
            json:()=>{
                console.log('json');
                res.status(200).json({results});

            }
        })
    }).catch((err)=>{
        console.log(err);
        res.status(500).json(err)
    })
})

app.use((req,res)=>{
    res.redirect('/');
})

startApp(app, pool);
