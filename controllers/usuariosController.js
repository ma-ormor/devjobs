const mongoose = require('mongoose')
const multer = require('multer')
const shortid = require('shortid')
const Usuario = mongoose.model('usuario')

exports.formularioCrearCuenta = (req, res)=>{
  res.render('crear-cuenta', {
    pagina: 'Nueva Cuenta de DevJobs',
    tagline: 'Publica tus vacantes gratis'
  })
}//function

exports.validarRegistro = (req, res, next)=>{
  // Sanitiza
  req.sanitizeBody('nombre').escape()
  req.sanitizeBody('email').escape()
  req.sanitizeBody('password').escape()
  req.sanitizeBody('repetir').escape()
  // Valida
  req.checkBody('nombre', 'Revisa el nombre').notEmpty()
  req.checkBody('email', 'Revisa el email').isEmail()
  req.checkBody('password', 'Revisa la contraseña').notEmpty()
  req.checkBody('repetir', 'Revisa repetir contraseña').notEmpty()
  req.checkBody('password', 'Contraseñas diferentes').equals(req.body.repetir)

  const errores = req.validationErrors()
  
  if(errores){
    req.flash('error', errores.map(error => error.msg))
    return res.render('crear-cuenta', {
      pagina: 'Nueva Cuenta de DevJobs',
      tagline: 'Publica tus vacantes gratis',
      mensajes: req.flash()
    })}
  next()
}//function

exports.crearCuenta = async (req, res)=>{
  const usuario = new Usuario(req.body)

  try{
    await usuario.save()
    res.redirect('/iniciar-sesion')
  }catch(error){
    req.flash('error', error)
    res.redirect('/crear-cuenta')
  }//try
}//function

exports.formularioIniciarSesion = async (req, res)=>{
  res.render('iniciar-sesion', {
    pagina: 'Iniciar Sesión DevJobs'})
}//function

exports.formularioEditarPerfil = (req, res)=>{
  res.render('editar-perfil', {
    pagina: 'Edita tu Perfil',
    usuario: req.user.toObject(),
    salir: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen
  })//render
}//function

exports.editarPerfil = async (req, res)=>{
  const usuario = await Usuario.findById(req.user._id)
  const {nombre, email, password} = req.body

  usuario.nombre = nombre
  usuario.email = email
  usuario.password = password ? password : usuario.password

  if(req.file)
    usuario.imagen = req.file.filename
  
  await usuario.save()
  req.flash('correcto', 'Cambios Guardados')
  res.redirect('/admin')
}//function

exports.validarPerfil = (req, res, next)=>{
  // Sanitiza
  req.sanitizeBody('nombre').escape()
  req.sanitizeBody('email').escape()

  if(req.body.password)
    req.sanitizeBody('password').escape()
  // Valida
  req.checkBody('nombre', 'El nombre está vacío').notEmpty()
  req.checkBody('email', 'Revisa el correo').notEmpty()

  const errores = req.validationErrors()

  if(errores){
    req.flash('error', errores.map(error => error.msg))

    return res.render('editar-perfil', {
      pagina: 'Edita tu Perfil',
      usuario: req.user.toObject(),
      salir: true,
      nombre: req.user.nombre,
      imagen: req.user.imagen,
      mensajes: req.flash()
    })//render
  }//if

  next()
}//function

/* exports.subirImagen = (req, res, next)=>{
  upload(req, res, function(error){
    if(error)
      if(error instanceof multer.MulterError)
        if(error.code === 'LIMIT_FILE_SIZE'){
          req.flash('error', 'El archivo es grande: maximo 100kb')
          res.redirect('/admin') }
        else{
          req.flash('error', error.message)
          res.redirect('/admin') }
      else{
        req.flash('error', error.message)
        res.redirect('/admin') }
    else next()
  })
}//function */

exports.subirImagen = (req, res, next)=>{
  upload(req, res, function(error){
    if(!error) return next()

    if(error instanceof multer.MulterError)
      if(error.code === 'LIMIT_FILE_SIZE'){
        req.flash('error', 'El archivo es grande: max 100kb') }
      else{
        req.flash('error', error.message) }
    else{
      req.flash('error', error.message) }
    res.redirect('/admin')
  })
}//function

const configuracionMulter = {
  limits: {fileSize: 100000},
  storage: fileStorage = multer.diskStorage({
    destination: (req, file, done)=>{
      done(null, __dirname+'../../public/uploads/perfiles')},
    filename: (req, file, done)=>{
      const extension = file.mimetype.split('/')[1]
      done(null, `${shortid.generate()}.${extension}`) }
  }),//storage
  fileFilter(req, file, done){
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
      done(null, true)
    else done(new Error('Formato Invalido'), false)
  }//fileFilter
}

const upload = multer(configuracionMulter).single('imagen')