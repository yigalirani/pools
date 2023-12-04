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

function page({res,title='',content='',loggedin='',ex=''}){
  count++
  if (ex)
    ex='<pre>'+JSON.stringify(ex,null,2)+'</pre>'
  if (loggedin)
    loggedin='<div class=loggedin>'+loggedin+' (<a href=/logout>logout)</a></div>'
  const html=`
<html>
<meta content="width=device-width, initial-scale=1" name="viewport" />
  <link rel="stylesheet" href="/style.css"> 
  <body>
    <div class='titlebar'><h1>Pools Operations Management</h1>${loggedin}</div>
    <h2>${title}</h2>
    ${content}  (click counter:${count})
  </body>
</html>
  `
  res.write(html)
  res.end()
}
async function query_one(conn,query,params){
  const [ans,_fields]=await conn.query(query,params)
  return ans[0]
}
async function write_user_main_page({userid,res,conn}){
  const {id,name,role}=await query_one(conn,'select * from user where id=?',[userid])
  if (role=='owner'){
    const qres=await conn.query(`select 
    asset.name as asset_name,
    count(pool.id) as pools
  from asset,pool 
  where 
    pool.asset_id=asset.id and
    asset.owner_user_id=4
  group by asset.id`,[userid])
    const defs=[
      {name:'asset_name'},
      {name:'pools'}
      
    ]
    const [assets,_]=qres
    const content=make_table(defs,assets) 
    return page({res,loggedin:`${name} (${role})`,content,title:'your assets'})   
  }
}
app.get('/', async  function(req, res){
  try{
    const conn=await mysql.createConnection(connp)
    const {userid}=req.session
    if (userid!=null)
      return write_user_main_page({res,userid,conn})
    const [users,_]=await conn.query('select * from user')
    const defs=[
      {name:'name',f:({name,id})=>`<a href="login/${id}">${name}</a>`},
      {name:'role'}
    ]
    const table=make_table(defs,users)
    page({res,title:'select user',content:table})
  }catch(ex){
    page({res,content:'error',ex})
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
