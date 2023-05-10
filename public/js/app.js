import axios from 'axios'
import Swal from 'sweetalert2'

document.addEventListener('DOMContentLoaded', ()=>{
  let alertas = document.querySelector('.alertas')
  const skills = document.querySelector('.lista-conocimientos')

  // Limpia las alertas
  if(alertas) 
    limpiarAlertas(alertas)

  if(skills){
    skills.addEventListener('click', agregarSkills)
    skillsSeleccionados()}

  const vacantesListado = document.querySelector('.panel-administracion')

  vacantesListado?.addEventListener('click', accionesListado)
})//addEventListener

const skills = new Set()

const agregarSkills = e=>{
  if(e.target.tagName === 'LI')
    if(e.target.classList.contains('activo')){
      skills.delete(e.target.textContent)
      e.target.classList.remove('activo')}
    else{
      skills.add(e.target.textContent)
      e.target.classList.add('activo')}
  document.querySelector('#skills').value = [...skills]
}//function

const skillsSeleccionados = ()=>{
  const seleccionadas = Array.from(
    document.querySelectorAll('.lista-conocimientos .activo'))
  seleccionadas.forEach(skill => {
    skills.add(skill.textContent)
  })//forEach
  document.querySelector('#skills').value = [...skills]
}//function

const limpiarAlertas = alertas=>{
  //let alertas = document.querySelector('.alertas')

  const interval = setInterval(()=>{
    if(alertas.children.length)
      alertas.removeChild(alertas.children[0])
    else {
      alertas.parentElement.removeChild(alertas)
      clearInterval(interval)}
  }, 2000)
}//function

const accionesListado = e=>{
  e.preventDefault()

  console.log(e.target.dataset)

  if(e.target.dataset.eliminar){
    Swal.fire({
      title: '¿Eliminar vacante?',
      text: "",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const id = e.target.dataset.eliminar
        const url = `${location.origin}/vacantes/eliminar/${id}`
        
        return axios.delete( url, {params: {url}} )
          .then(function(respuesta){
            if(respuesta.status === 200){
              const vacante = e.target.parentElement.parentElement
              Swal.fire(
                '¡Eliminada!', respuesta.data, 'success')
              vacante.parentElement.removeChild(vacante)}
          }).catch(()=>{
            Swal.fire({
              type: 'error', 
              title: 'Hay un error', 
              text: 'No se eliminó la vacante'
            })
          })
      }//if
    })//then
  }else if(e.target.tagName === 'A')
    window.location.href = e.target.href
}//function