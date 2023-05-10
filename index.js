const mongoose = require('mongoose'); require('./config/database')
// import express from 'express'
const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const router = require('./routes')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const createError = require('http-errors')
const passport = require('./config/passport')

require('dotenv').config({path: '.env'})

const app = express()
const host = '0.0.0.0'
const puerto = process.env.PORT

// Enciende bodyParser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
// Valida campos
app.use(expressValidator())
// Plantillas
app.engine('handlebars', exphbs({
  defaultLayout: 'layout',
  helpers: require('./helpers/handlebars')
}))

app.set('view engine', 'handlebars')

app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
// Sesión
app.use(session({
  secret: process.env.SECRETO, 
  key: process.env.KEY, 
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}))
// Inicia Passport
app.use(passport.initialize())
app.use(passport.session())
// Alertas
app.use(flash())
// Middleware
app.use((req, res, next) => {
  res.locals.mensajes = req.flash(); next()})
// Rutas
app.use('/', router())
// No encontrado
app.use((req, res, next)=>{next(createError(404, 'No encontrado'))})
// Errores
app.use((error, req, res, next)=>{
  const status = error.status || 500 
  res.locals.mensaje = error.message
  res.locals.estado = status
  res.status(status)
  res.render('error')})
// Enciende servidor
app.listen(puerto, ()=>{
  console.log(`${host}:${puerto}`)})