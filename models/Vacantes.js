const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const slug = require('slug')
const shortid = require('shortid')

const vacantesSchema = new mongoose.Schema({
  titulo: {
    type: String, required: 'Revisa el nombre', trim: true},
  empresa: {
    type: String, trim: true},
  ubicacion: {
    type: String, trim: true, required: 'Revisa la ubicación'},
  salario: {
    type: String, trim: true, default: 0},
  contrato: {
    type: String, trim: true},
  descripcion: {
    type: String, trim: true},
  url: {
    type: String, lowercase: true},
  skills: [String],
  candidatos: [{nombre: String, email: String, cv: String}],
  autor: {
    type: mongoose.Schema.ObjectId, 
    ref: 'usuario', 
    required: 'Revisa el autor'}
})

vacantesSchema.pre('save', function(next){
  const url = slug(this.titulo)
  this.url = `${url}-${shortid.generate()}`
  next()
})

vacantesSchema.index({titulo: 'text'})

module.exports = mongoose.model('vacante', vacantesSchema)