const tplMapricotAddressInput = document.createElement('template')
tplMapricotAddressInput.innerHTML = `
<style>
    .mapricot-address-input-container {
      width:100%;
      display:block;
      box-sizing:border-box;
      border: 1px solid rgba(0,0,0,0.2);
      border-radius: 6px !important;  
      z-index: 999;
      position: relative;                  
    }
    .mapricot-address-input-container input:focus {
        outline:none;
    }
    .mapboxgl-ctrl-geocoder {
      width: 100% !important;
      max-width: 100% !important;
      height:55px;          
      font-size:18px;
      font-weight: 300;
      box-sizing:border-box;
      border:none;
      border-radius: 6px !important;           
    } 
    .mapboxgl-ctrl-geocoder--input {
      line-height: 22px !important;
      height: 55px !important;
    }
    .mapboxgl-ctrl-geocoder--icon {
      top:18px !important;
    }
    .mapboxgl-ctrl-geocoder--icon-close {
      margin-top: 13px !important;
    }    
</style>
<link href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css" rel="stylesheet">
<div class="mapricot-address-input-container"></div>`

class MapricotAddressInput extends HTMLElement{      
  assets = {}

  constructor(){
    super()
    mapboxgl.accessToken = this.getAttribute('token')
    this.assets.geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      countries: 'us',
      mapboxgl: mapboxgl, 
      marker: false,
      types: 'address', 
      flyTo: {duration: 0}
    })
    this.attachShadow({ mode: 'open'})
    this.shadowRoot.appendChild(tplMapricotAddressInput.content.cloneNode(true))   
  }
  connectedCallback(){  
    this.render()      
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
  }
  render(){   
    console.log("Rendering geocoder...")    
    this.assets.geocoder.addTo(this.shadowRoot.querySelector('.mapricot-address-input-container'), this.shadowRoot)
    this.assets.geocoder.on('result', (result)=>{
      if(typeof result.result.geometry != 'undefined' && result.result.geometry.type == "Point") {            
        window.appEventBus.dispatchEvent(
          new CustomEvent('geocode-location-selected', {"detail": result.result})
        )
      }            
    })
  }    
}

window.customElements.define('mapricot-address-input', MapricotAddressInput)