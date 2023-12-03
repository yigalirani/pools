"use strict";
const express = require('express')
const session = require('express-session')
const http = require('http')
const app = express()
const varlog = require('varlog')
const https = require('https')
const fs = require('fs');
var mysql = require('mysql2/promise');
app.use(express.static('static'))
app.use(session({ secret: 'grant' })) //, cookie: { maxAge: 60000 }}))
let count=0
const connp={
  host:'localhost',
  user:'pools',
  password:'cosbypools',//todo: move this to env var lol
  database:'pools'
}
function make_table(defs,rows){
  const th=defs.map(def=>`<th>${def.name}</th>`).join('')
  const title_row=`<tr>${th}</tr>`
  const ans=[title_row]
  for (const row of rows){
    const html_row=[]
    for (const {name,f} of defs){
      const effective_f=f||(row=>row[name])
      const value=effective_f(row)
      html_row.push(`<td>${value}</td>`)
    }
    ans.push(`<tr>${html_row.join('')}</tr>\n`)
  }
  return`<table>${ans.join('')}</table>`
}
var pool=mysql.createPool(connp);
app.get('/', async  function(req, res){
  try{
    const conn=await pool.getConnection()
    res.write('<h1>pool management</h1>')
    const [users,_]=await conn.query('select * from user')
    const defs=[
      {name:'name',f:row=>row.name+'link'},
      {name:'role'}
    ]
    const table=make_table(defs,users)
    res.write(table)
    res.write(dump(users))
    res.end()
  }catch(ex){
    res.end(ex)
  }
})

function dump(req){
  const ans=varlog.css+varlog.dump('debug info',req)
  return ans
}
const port = 80
async function run_app(app) {
  await http.createServer(app).listen(port)
  console.log('started server at port ' + port)
}
run_app(app)