const mongoose = require('mongoose')
const Vacante = mongoose.model('vacante')

exports.mostrarTrabajos = async(req, res, next)=>{
  const vacantes = await Vacante.find().lean()

  if(!vacantes)
    return next()

  res.render('home', {
    pagina: 'DevJobs',
    tagline: 'Pública vacantes de desarrollo web',
    barra: true,
    boton: true,
    vacantes
  })
}