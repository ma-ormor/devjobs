const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

mongoose.Promise = global.Promise

const usuariosSchema = new mongoose.Schema({
  email: {
    type: String, unique: true, lowercase: true, trim: true},
  nombre: {
    type: String, required: 'Revisa tu nombre', trim: true},
  password: {
    type: String, required: true, trim: true},
  token: String, expira: Date, imagen: String
})//usuariosSchema

usuariosSchema.pre('save', async function(next){
  if(!this.isModified('password'))
    return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})//function

usuariosSchema.post('save', async function(error, doc, next){
  if(error.name === 'MongoServerError' && error.code === 11000)
    return next('La cuenta ya existe')
  next(error)
})//function

usuariosSchema.methods = {
  compararContraseña: function(password){
    return bcrypt.compareSync(password, this.password)
  }//function
}//functions

module.exports = mongoose.model('usuario', usuariosSchema)