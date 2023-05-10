module.exports = {
  seleccionarSkills: (seleccionadas = [], opciones) => {
    console.log(seleccionadas)

    const skills = [
      'HTML5', 
      'CSS', 
      'CSSGrid',
      'Flexbox', 
      'JavaScript', 
      'JQuery',
      'Node',
      'Angular',
      'VueJS',
      'ReactJS',
      'ReactHooks',
      'Redux',
      'Apollo',
      'GraphQL',
      'TypeScript',
      'PHP',
      'Laravel',
      'Synfony',
      'Python',
      'DJango',
    ]
    let html = ''

    skills.forEach(skill => {
      html += `<li ${seleccionadas.includes(skill)?'class="activo"':''}>${skill}</li>`
    })//forEach

    return opciones.fn().html = html
  },//function

  contratoActual: (seleccionado, opciones)=>{
    return opciones.fn(this).replace(
      new RegExp(`value="${seleccionado}"`), '$& selected="selected"')
  },//function

  mostrarAlertas: (errores = {}, alertas) => {
    let html = ''
    const categoria = Object.keys(errores)
    
    if(categoria.length)
      errores[categoria].forEach(error => {
        html += `<div class="${categoria} alerta">${error}</div>`})
    return alertas.fn().html = html
  }//function
}