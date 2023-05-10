const mongoose = require('mongoose')
const Vacante = mongoose.model('vacante')
const multer = require('multer')
const shortid = require('shortid')

exports.formularioNuevaVacante = (req, res)=>{
  res.render('nueva-vacante', {
    pagina: 'Nueva Vacante',
    tagline: 'Llena el formulario',
    salir: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen
  })
}//function

exports.agregarVacante = async (req, res)=>{
  const vacante = new Vacante(req.body);

  vacante.autor = req.user._id
  vacante.skills = req.body.skills.split(',')
  await vacante.save()
  res.redirect(`/vacantes/${vacante.url}`)
}//function

exports.mostrarVacante = async (req, res, next)=>{
  const {url} = req.params
  const vacante = await Vacante.findOne({url}).populate('autor').lean()

  console.log(vacante)

  if(!vacante) 
    return next()
  res.render('vacante', {
    pagina: vacante.titulo,
    vacante,
    barra: true
  })//res
}//function

exports.formularioEditarVacante = async (req, res, next)=>{
  const {url} = req.params
  const {nombre, imagen} = req.user
  const vacante = await Vacante.findOne({url}).lean()

  if(!vacante) 
    return next()

  res.render('editar-vacante', {
    pagina: `Editar ${vacante.titulo}`,
    vacante,
    salir: true,
    nombre, imagen
  })
}//function

exports.guardarVacante = async (req, res)=>{
  const nueva = req.body
  const {skills} = req.body
  const {url} = req.params

  nueva.skills = skills.split(",")

  const vacante = await Vacante.findOneAndUpdate({url}, nueva, {
    new: true,
    runValidators: true
  })

  res.redirect(`/vacantes/${url}`)
}//function

exports.validarVacante = (req, res, next)=>{
  // Sanitiza
  req.sanitizeBody('titulo').escape()
  req.sanitizeBody('empresa').escape()
  req.sanitizeBody('ubicacion').escape()
  req.sanitizeBody('salario').escape()
  req.sanitizeBody('contrato').escape()
  req.sanitizeBody('skills').escape()
  // Revisa campos
  req.checkBody('titulo', 'El título está vacío').notEmpty()
  req.checkBody('empresa', 'La empresa está vacía').notEmpty()
  req.checkBody('ubicacion', 'La ubicacion está vacía').notEmpty()
  req.checkBody('contrato', 'Selecciona un contrato').notEmpty()
  req.checkBody('skills', 'Escoge una habilidad').notEmpty()

  const errores = req.validationErrors()

  if(errores){
    req.flash('error', errores.map(error => error.msg))

    return res.render('nueva-vacante', {
      pagina: 'Nueva Vacante',
      tagline: 'Llena el formulario',
      salir: true,
      nombre: req.user.nombre,
      mensajes: req.flash()
    })}//if
  next()
}//function

exports.eliminarVacante = async (req, res)=>{
  const {id} = req.params
  const vacante = await Vacante.findById(id)

  if(verificarAutor(vacante, req.user)){
    vacante.remove()
    res.status(200).send('Vacante eliminada successfull')}
  else res.status(403).send('Error')
}//function

const verificarAutor = (vacante = {}, usuario = {})=>{
  return vacante.autor.equals(usuario._id)
}//function

// const verificarAutor2 = (vacante = {}, usuario = {})=>{
//   if(!vacante.autor.equals(usuario._id))
//     return false
//   return true
// }//function

exports.subirCV = (req, res, next)=>{
  upload(req, res, function(error){
    if(!error) return next()

    if(error instanceof multer.MulterError)
      if(error.code === 'LIMIT_FILE_SIZE'){
        req.flash('error', 'El archivo es grande: max 100kb') }
      else{
        req.flash('error', error.message) }
    else{
      req.flash('error', error.message) }
    res.redirect('back')
  })
}//function

const configuracionMulter = {
  limits: {fileSize: 300000},
  storage: fileStorage = multer.diskStorage({
    destination: (req, file, done)=>{
      done(null, __dirname+'../../public/uploads/cv')},
    filename: (req, file, done)=>{
      const extension = file.mimetype.split('/')[1]
      done(null, `${shortid.generate()}.${extension}`) }
  }),//storage
  fileFilter(req, file, done){
    if(file.mimetype === 'application/pdf')
      done(null, true)
    else done(new Error('Formato Invalido'), false)
  }//fileFilter
}

const upload = multer(configuracionMulter).single('cv') 

exports.contactar = async (req, res, next)=>{
  const vacante = await Vacante.findOne({url: req.params.url})
  const {nombre, email} = req.body

  if(!vacante) 
    return next()
  const candidato = {nombre, email, cv: req.file.filename}

  vacante.candidatos.push(candidato)
  await vacante.save()

  req.flash('correcto', 'Tu CV se envió')
  res.redirect('/')
}//function

exports.mostrarCandidatos = async (req, res, next)=>{
  const {id} = req.params
  const vacante = await Vacante.findById(id).lean()
  
  if(!verificarAutor(vacante, req.user._id))
    return next()
  if(!vacante)
    return next()
  res.render('candidatos', {
    pagina: `Candidatos de ${vacante.titulo}`,
    salir: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    candidatos: vacante.candidatos
  })
}//function

exports.buscar = async (req, res)=>{
  const vacantes = await Vacante.find({
    $text: {$search: req.body.q}}).lean()

  res.render('home', {
    pagina: `Resultados de ${req.body.q}`,
    barra: true,
    vacantes
  })
}//function