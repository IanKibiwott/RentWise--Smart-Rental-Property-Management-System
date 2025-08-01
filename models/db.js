// models/db.js
const mysql=require('mysql2');
const dotenv = require ('dotenv');
dotenv.config();

const db = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
db.connect((err)=>{
    if (err){
        console.error('Database connection failed:',err);
        } else {
            console.log('✅ Connected to MySQL');
        }
    
});
module.exports=db;
