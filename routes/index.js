//import express from 'express'
const express = require('express')
const homeController = require('../controllers/homeController')
const vacantesController = require('../controllers/vacantesController')
const usuariosController = require('../controllers/usuariosController')
const authController = require('../controllers/authController')

const router = express.Router()

module.exports = ()=>{
  router.get('/', homeController.mostrarTrabajos)

  router.get('/vacantes/nueva',
    authController.verificarUsuario,
    vacantesController.formularioNuevaVacante)
  router.post('/vacantes/nueva', 
    authController.verificarUsuario,
    vacantesController.validarVacante,
    vacantesController.agregarVacante)

  router.get('/vacantes/:url', 
    vacantesController.mostrarVacante)
  router.post('/vacantes/:url', 
    vacantesController.subirCV,
    vacantesController.contactar)

  router.get('/vacantes/editar/:url', 
    authController.verificarUsuario,
    vacantesController.formularioEditarVacante)
  router.post('/vacantes/editar/:url', 
    authController.verificarUsuario,
    vacantesController.validarVacante,
    vacantesController.guardarVacante)

  router.delete('/vacantes/eliminar/:id', 
    authController.verificarUsuario,
    vacantesController.eliminarVacante)

  router.get('/crear-cuenta', 
    usuariosController.formularioCrearCuenta)
  router.post('/crear-cuenta',
    usuariosController.validarRegistro,
    usuariosController.crearCuenta)

  router.get('/iniciar-sesion', 
    usuariosController.formularioIniciarSesion)
  router.post('/iniciar-sesion', 
    authController.autenticarUsuario)

  router.get('/cerrar-sesion', 
    authController.verificarUsuario,
    authController.cerrarSesion)

  router.get('/recuperar-cuenta',
    authController.formularioRecuperarCuenta)
  router.post('/recuperar-cuenta',
    authController.enviarToken)

  router.get('/recuperar-cuenta/:token',
    authController.recuperarCuenta)
  router.post('/recuperar-cuenta/:token',
    authController.guardarPassword)

  router.get('/admin', 
    authController.verificarUsuario,
    authController.mostrarPanel)

  router.get('/editar-perfil',
    authController.verificarUsuario,
    usuariosController.formularioEditarPerfil)
  router.post('/editar-perfil',
    authController.verificarUsuario,
    //usuariosController.validarPerfil,
    usuariosController.subirImagen,
    usuariosController.editarPerfil)

  router.get('/candidatos/:id',
    authController.verificarUsuario,
    vacantesController.mostrarCandidatos)

  router.post('/buscador', vacantesController.buscar)

  return router
}