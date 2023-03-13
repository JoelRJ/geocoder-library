const tplFooterControl = document.createElement('template')
tplFooterControl.innerHTML = `
<style>
  #footer-controls {
    position: absolute;
    top:70%;
    left:25%;
    right:25%;
    bottom:19%;
    padding:15px;
    text-align:center;
  }
  #footer-controls div {
    position: absolute;
    top: 15px;
    text-align: center;
    display: block;
    box-sizing: border-box;
    width: 100%;
    left: 0px;
  }
  #footer-controls .onedit, #footer-controls .onfinish {
    display:none;
  }
  .footer-btn {
    margin: 0px 5px;    
  }
  .footer-btn.proceed {
    height:56px;
    border-radius: 6px;
    font-size: 18px;
    line-height: 21px;
    letter-spacing: 0.37px;
    font-weight: 400;
    text-transform: uppercase;
    text-shadow: unset;
    border: 1px solid rgba(36, 75, 90, 0.58); 
    padding:4px 15px; 
    background:rgba(32, 151, 253, 1);
    border: 1px solid rgba(0,0,0,0.2);
    color: #FFF;
  }
  .footer-btn.proceed:hover {
    cursor:pointer;
    background:rgba(32, 151, 253, 1);
  }
  .footer-btn.save {
    height:56px;
    border-radius: 6px;
    font-size: 18px;
    line-height: 21px;
    letter-spacing: 0.37px;
    font-weight: 400;
    text-transform: uppercase;
    text-shadow: unset;
    border: 1px solid rgba(36, 75, 90, 0.58); 
    padding:4px 15px; 
    background:rgba(32, 151, 253, 1);
    border: 1px solid rgba(0,0,0,0.2);
    color: #FFF;
  }
  .footer-btn.save:hover {
      cursor:pointer;
      background:rgba(32, 151, 253, 1);
  }    
  .footer-btn.edit {
    height:56px;
    border-radius: 6px;
    font-size: 18px;
    line-height: 21px;
    letter-spacing: 0.37px;
    font-weight: 400;
    text-transform: uppercase;
    text-shadow: unset;
    border: 1px solid rgba(36, 75, 90, 0.58); 
    padding:4px 15px; 
    background:rgba(255, 255, 255, 1);
    border: 1px solid rgba(0,0,0,0.2);
    color: rgba(0,0,0,0.7);
  }
  .footer-btn.edit:hover {
      cursor:pointer;
  }    
  .footer-btn.cancel {
    height:56px;
    border-radius: 6px;
    font-size: 18px;
    line-height: 21px;
    letter-spacing: 0.37px;
    font-weight: 400;
    text-transform: uppercase;
    text-shadow: unset;
    border: 1px solid rgba(36, 75, 90, 0.58); 
    padding:4px 15px; 
    background:rgba(255, 255, 255, 1);
    border: 1px solid rgba(0,0,0,0.2);
    color: rgba(0,0,0,0.7);
  }
  .footer-btn.cancel:hover {
      cursor:pointer;
  }    
</style>

<div id="footer-controls" class="footer-controls">
  <div class="onedit">
    <button class="footer-btn cancel">Cancel</button>    
    <button class="footer-btn save">Save Changes</button>
  </div>
  <div class="onfinish">
    <button class="footer-btn edit">Edit Roofs</button>
    <button class="footer-btn proceed">Continue</button>
  </div>  
</div>`

class FooterControl extends HTMLElement{  

  assets = {}

  static get observedAttributes() { return ['status']; }

  constructor(){
    super()
    this.attachShadow({ mode: 'open'})
    this.shadowRoot.appendChild(tplFooterControl.content.cloneNode(true))   
  }
  connectedCallback(){  
    this.render()
    this.addEventListeners()    
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
    switch(true) {
        case (attributeName == "status"): 
          this.setVisiblePart(newValue)
        break
    }
  }
  render(){   
    console.log("Rendering footer controls...")
    this.setVisiblePart(this.getAttribute("status"))    
  }
  setVisiblePart(status) {
    switch(true) {
      case(status == "onfinish"): 
        this.shadowRoot.querySelectorAll(".footer-controls>div").forEach((elem)=>{
          if(elem.className == "onfinish") {
            elem.style.display = 'block'
          }
          else
          {
            elem.style.display = 'none'
          }
        })
      break
      case(status == "onedit"):
        this.shadowRoot.querySelectorAll(".footer-controls>div").forEach((elem)=>{
            if(elem.className == "onedit") {
            elem.style.display = 'block'
            }
            else
            {
            elem.style.display = 'none'
            }
        })      
      break      
    }
  }
  addEventListeners() {

    this.shadowRoot.querySelector(".edit").addEventListener("click", (e)=>{
      document.querySelectorAll('mapricot-map-button').forEach((elem, index)=>{
        if(elem.getAttribute("visible") === 'true') {            
          elem.setAttribute("visible", "false")
        }
        else
        {
          elem.setAttribute("visible", "true")
        }
      })
      
      this.setVisiblePart("onedit")

      window.appEventBus.dispatchEvent(
        new CustomEvent('edit-roof-selected', {"detail": {}})
      )      
    })

    this.shadowRoot.querySelector(".cancel").addEventListener("click", (e)=>{
      document.querySelectorAll('mapricot-map-button').forEach((elem, index)=>{
        if(elem.getAttribute("visible") === 'true') {            
          elem.setAttribute("visible", "false")
        }
        else
        {
          elem.setAttribute("visible", "true")
        }
      })
      
      this.setVisiblePart("onfinish")

      window.appEventBus.dispatchEvent(
        new CustomEvent('edit-roof-deselected', {"detail": {}})
      )
    })
    
    this.shadowRoot.querySelector(".save").addEventListener("click", (e)=>{
        document.querySelectorAll('mapricot-map-button').forEach((elem, index)=>{
          if(elem.getAttribute("visible") === 'true') {            
            elem.setAttribute("visible", "false")
          }
          else
          {
            elem.setAttribute("visible", "true")
          }
        })
        
        this.setVisiblePart("onfinish")
  
        window.appEventBus.dispatchEvent(
          new CustomEvent('user-map-changes-save', {"detail": {}})
        )
    })
    
    this.shadowRoot.querySelector(".proceed").addEventListener("click", (e)=>{
      const maps = document.getElementsByTagName('mapricot-map')
      alert(`*** RESULTS *** - This is an alert box containing the below list of areas. Feel free to replace this with the desired action in footer-control-js L220-224. ${JSON.stringify(maps[0].getAreasList())}`)
    })    
  }   
}

window.customElements.define('footer-control', FooterControl)