const tplMapricotMapButton = document.createElement('template')
tplMapricotMapButton.innerHTML =  `
<style>
  .parent {
    position: absolute;
  }  
  .btn {
    display:block;
    padding:10px;
    background: #FFF;
    border-radius: 6px;
    font-weight: 500; 
    border: none;
    margin: 7px;
    color: #69bffe;       
    font-size: 14px;
    letter-spacing: 0.3px;
    line-height: 17px;
    width:180px;
    text-align: left;
    pointer-events: auto !important;
  }
  .btn:hover{
    cursor:pointer;
  }
  .btn .btn-text {
    display:inline-block;
    vertical-align:middle;        
  }
  .btn .btn-icon {
    width: 15px;
    height: 15px;
    display:inline-block;
    vertical-align:middle;
    margin-right: 5px;
  }
  .btn span svg {
    height:100%;
    width:100%;
    display:block;
    fill: #69bffe;        
  }
</style>
<button class="btn">{{type-icon}}{{button-text}}</button>`

class MapricotMapButton extends HTMLElement {
  
  static get observedAttributes() { return ['visible']; }

  constructor(){
    super()
    this.attachShadow({ mode: 'open'})
    this.shadowRoot.appendChild(tplMapricotMapButton.content.cloneNode(true))                 
  }

  connectedCallback(){  
    this.classList.add(this.getAttribute("type"))    
    this.shadowRoot.innerHTML = this.shadowRoot.innerHTML.replace("{{button-text}}", `<span class="btn-text">${this.getAttribute("text")}</span>`)
    if( this.getAttribute("type") !== null ) {
      switch(this.getAttribute("type")) {
        case "draw-polygon":
          this.shadowRoot.innerHTML = this.shadowRoot.innerHTML.replace("{{type-icon}}", '<span class="btn-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M96 151.4V360.6c9.7 5.6 17.8 13.7 23.4 23.4H328.6c0-.1 .1-.2 .1-.3l-4.5-7.9-32-56 0 0c-1.4 .1-2.8 .1-4.2 .1c-35.3 0-64-28.7-64-64s28.7-64 64-64c1.4 0 2.8 0 4.2 .1l0 0 32-56 4.5-7.9-.1-.3H119.4c-5.6 9.7-13.7 17.8-23.4 23.4zM384.3 352c35.2 .2 63.7 28.7 63.7 64c0 35.3-28.7 64-64 64c-23.7 0-44.4-12.9-55.4-32H119.4c-11.1 19.1-31.7 32-55.4 32c-35.3 0-64-28.7-64-64c0-23.7 12.9-44.4 32-55.4V151.4C12.9 140.4 0 119.7 0 96C0 60.7 28.7 32 64 32c23.7 0 44.4 12.9 55.4 32H328.6c11.1-19.1 31.7-32 55.4-32c35.3 0 64 28.7 64 64c0 35.3-28.5 63.8-63.7 64l-4.5 7.9-32 56-2.3 4c4.2 8.5 6.5 18 6.5 28.1s-2.3 19.6-6.5 28.1l2.3 4 32 56 4.5 7.9z"/></svg></span>')
        break
        case "draw-trash":
          this.shadowRoot.innerHTML = this.shadowRoot.innerHTML.replace("{{type-icon}}", '<span class="btn-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg></span>')
        break
      }
    }
    this.shadowRoot.querySelector('.btn').addEventListener('click', (e)=>{
      e.preventDefault()
      switch(this.getAttribute("type")) {
        case "draw-polygon":
          window.appEventBus.dispatchEvent(
            new CustomEvent('polygon-mode-selected', {"detail": {}})
          )              
        break
        case "draw-trash":
          window.appEventBus.dispatchEvent(
            new CustomEvent('trash-selected', {"detail": {}})
          )              
        break
      }          
    })
    this.checkVisibility(this.getAttribute("visible"))
  }

  attributeChangedCallback(attributeName, oldValue, newValue) {
    if(attributeName == 'visible') {
      this.checkVisibility(newValue)
    }
  }

  render(){
  }

  checkVisibility(isVisible) {
    switch(true) {
        case (isVisible === 'true'):
          this.shadowRoot.querySelector('.btn').style.display = 'block'
        break
        case (isVisible === 'false'):
          this.shadowRoot.querySelector('.btn').style.display = 'none'
        break            
      }
  }
  addEventListeners() {
    /*window.appEventBus.addEventListener('polygon-mode-hide', (data) => {          
      
    })
    window.appEventBus.addEventListener('trash-mode-hide', (data) => {          
      
    })*/                
  }    
}

window.customElements.define('mapricot-map-button', MapricotMapButton);