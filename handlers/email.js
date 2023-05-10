const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const util = require('util')
const config = require('../config/email')

const {host, port, user, pass} = config

let transport = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  auth: {
    user: config.user,
    pass: config.pass
  }
})

transport.use('compile', hbs({
  viewEngine: {
    extName: '.handlebars',
    partialsDir: __dirname+'/../views/emails'
  },
  viewPath: __dirname+'/../views/emails',
}))

exports.enviar = async (opciones)=>{
  const {subject, url, archivo} = opciones
  console.log(archivo) //marco@correo.com
  
  const email = {
    from: 'devjobs <noreply@devjobs.com>',
    to: opciones.usuario.email,
    subject,
    template: archivo,
    context: {
      url
    }
  } 

  const enviar = util.promisify(transport.sendMail, transport)
  return enviar.call(transport, email)
}//function