"use strict";
const express = require('express')
const session = require('express-session')
const http = require('http')
const app = express()
const varlog = require('varlog')
const https = require('https')
const fs = require('fs');
const mysql = require('mysql2/promise');
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
app.get('/logout/',function(req, res){
  req.session.userid=null
  res.redirect('/')
})
app.get('/login/:userid', async  function(req, res){
  //title('logged in',res)
  const {userid}=req.params
  req.session.userid=userid
  //res.write(userid)
  res.redirect('/')
  //res.write(dump(req))
  //res.end()
})

function title(page,res){
  count++
  
  res.write(`<html>${count}<h1>pool management</h1><h2>${page}</h2>`)
}
function write_user_main_page(userid,res){
  title(`user ${userid} is logged in`,res)
  res.write('<a href=/logout>logout</a>')
  res.end()
}
app.get('/', async  function(req, res){
  console.log('get')
  try{
    const {userid}=req.session
    if (userid!=null)
      return write_user_main_page(userid,res)
    title('select user',res)
    const conn=await mysql.createConnection(connp)
    const [users,_]=await conn.query('select * from user')
    const defs=[
      {name:'name',f:({name,id})=>`<a href="login/${id}">${name}</a>`},
      {name:'role'}
    ]
    const table=make_table(defs,users)
    res.write(table)
    res.write(dump(users))
    res.end()
  }catch(ex){
    res.end(ex+'')
  }
})

function dump(req){
  return  ''
  const ans=varlog.css+varlog.dump('debug info',req)
  return ans
}
const port = 80
const host =process.env.HOST||'0.0.0.0'
async function run_app(app) {
  await app.listen(port,host)
  console.log(`started server at port=${port},host=${host}`)
}
async function run_app_https(app,port=443) {
  const server = https.createServer({
        key: fs.readFileSync('certs/privkey.pem'),
        cert: fs.readFileSync('certs/cert.pem'),
  }, app);
  await server.listen(port,host)
  console.log(`started https server at port=${port},host=${host}`)
}
run_app(app)
run_app_https(app)
