import mysql from "mysql"
import * as dotenv from "dotenv"

dotenv.config()

const connection = mysql.createConnection({
    host:process.env.HOST,
    user:process.env.USER,
    password:process.env.PASS,
    database:process.env.DB
})

connection.connect((error)=>{
    if(error){
        console.log(error)
     throw error
    }
})

export default connection