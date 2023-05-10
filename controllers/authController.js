const passport = require('passport')
const mongoose = require('mongoose')
const crypto = require('crypto')
const {enviar} = require('../handlers/email')

const Vacante = mongoose.model('vacante')
const Usuario = mongoose.model('usuario')

exports.autenticarUsuario = passport.authenticate('local', {
  successRedirect: '/admin', 
  failureRedirect: '/iniciar-sesion',
  failureFlash: true,
  badRequestMessage: 'Campos Vacíos'
})//function

exports.verificarUsuario = (req, res, next)=>{
  if(req.isAuthenticated())
    return next()
  res.redirect('/iniciar-sesion')
}//function

exports.mostrarPanel = async (req, res)=>{
  const {nombre, imagen} = req.user
  const vacantes = await Vacante.find({autor:req.user._id}).lean()

  res.render('administracion', {
    pagina: 'Adminstración',
    tagline: 'Revisa tus vacantes en DevJobs',
    salir: true,
    nombre, imagen, vacantes
  })//render
}//function

exports.cerrarSesion = (req, res)=>{
  req.logout(function(e){
    if(e)
      return console.log(e)
    req.flash('correcto', 'Saliste de tu sesión')
    return res.redirect('/iniciar-sesion')
  })//logout
}//function

exports.formularioRecuperarCuenta = (req, res)=>{
  res.render('recuperar-cuenta', {
    pagina: 'Recupera tu cuenta',
    tagline: 'Escribe tu email para seguir'
  })
}//function

exports.enviarToken = async (req, res)=>{
  const {email} = req.body
  const usuario = await Usuario.findOne({email})

  if(!usuario){
    req.flash('error', 'No existe la cuenta')
    return res.redirect('back')}

  usuario.token = crypto.randomBytes(20).toString('hex')
  usuario.expira = Date.now() + 3600000
  await usuario.save()

  const url = `http://${req.headers.host}/recuperar-cuenta/${usuario.token}`

  await enviar({
    usuario,
    subject: 'Recuperar Cuenta',
    url,
    archivo: 'reset'
  })

  req.flash('correcto', 'Revisa tu email, envíamos un correo')
  res.redirect('/iniciar-sesion')
}//function

exports.recuperarCuenta = async (req, res)=>{
  const usuario = await Usuario.findOne({
    token: req.params.token,
    expira: {$gt: Date.now()}
  })

  if(!usuario){
    req.flash('error', 'No encontramos tu token')
    return res.redirect('/recuperar-cuenta')
  }//if

  res.render('nuevo-password', {pagina: 'Cambia tu contraseña'})
}//function

exports.guardarPassword = async (req, res)=>{
  const usuario = await Usuario.findOne({
    token: req.params.token,
    expira: {$gt: Date.now()} })

  if(!usuario){
    req.flash('error', 'Tu token no es válido')
    return res.redirect('/recuperar-cuenta')
  }//if

  usuario.password = req.body.password
  usuario.token = undefined
  usuario.expira = undefined
  await usuario.save()

  req.flash('correcto', 'Contraseña Cambiada')
  res.redirect('/iniciar-sesion')
}//function