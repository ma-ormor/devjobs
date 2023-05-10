const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const Usuario = mongoose.model('usuario')

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, 
async(email, password, done)=>{
  const usuario = await Usuario.findOne({email})

  if(!usuario)
    return done(null, false, {message: 'No se encontró el usuario'})
  const contraseñaValida = usuario.compararContraseña(password)

  if(!contraseñaValida)
    return done(null, false, {message: 'Contraseña no valida'})
  done(null, usuario)
}))//use

passport
  .serializeUser((usuario, done) => done(null, usuario._id))
passport
  .deserializeUser(async (id, done) => {
    const usuario = await Usuario.findById(id)
    return done(null, usuario)
})//deserializeUser

module.exports = passport