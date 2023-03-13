const tplMapricotMap = document.createElement('template')
tplMapricotMap.innerHTML = `
<style>
    .map {
      width:100%;
      height:100%;
      display:block;         
    }
</style>
<link href="https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.css" rel="stylesheet">
<link href='https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.0/mapbox-gl-draw.css' rel='stylesheet'/>
<div class="map"></div>`

class MapricotMap extends HTMLElement{      
  config = {}
  assets = {
    temporary_storage: {}
  }

  constructor(){
    super()
    mapboxgl.accessToken = this.getAttribute('token')
    this.attachShadow({ mode: 'open'})
    this.shadowRoot.appendChild(tplMapricotMap.content.cloneNode(true)) 
  }
  connectedCallback(){
    this.render()      
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
  }
  render(){   
    console.log("Rendering map...")

    const urlParams = new URLSearchParams(window.location.search)
    const latitude = urlParams.get('lat')
    const longitude = urlParams.get('lng')

    this.assets.map = new mapboxgl.Map({
      container: this.shadowRoot.querySelector('.map'),
      style: 'mapbox://styles/mapbox/satellite-streets-v11',
      center: [-100, 39],
      zoom: 2
    })
    
    let modes = MapboxDraw.modes;
    modes.static = StaticMode;

    this.assets.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: false,
        trash: false
      },
      modes: modes,
      defaultMode: 'static',
      styles: [
        {
          "id": "gl-draw-line",
          "type": "line",
          "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
          "layout": {
            "line-cap": "round",
            "line-join": "round"
          },
          "paint": {
            "line-color": "#69bffe",
            "line-dasharray": [0.2, 2],
            "line-width": 2
          }
        },        
        {
          "id": "gl-draw-polygon-fill-static",
          "type": "fill",
          "filter": ["all", ["==", "$type", "Polygon"]],
          "paint": {
            "fill-color": "#0094ff",
            "fill-outline-color": "#0094ff",
            "fill-opacity": 0.5
          }
        },
        {
          "id": "gl-draw-polygon-stroke-static",
            "type": "line",
            "filter": ["all", ["==", "$type", "Polygon"],["==", "mode", "static"]],
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "paint": {
                "line-color": "#000",
                "line-width": 0
            }
        },
        {
          "id": "gl-draw-polygon-stroke-active",
          "type": "line",
          "filter": ["all", ["==", "$type", "Polygon"], ["==", "active", "true"], ["!=", "mode", "static"]],
          "layout": {
            "line-cap": "round",
            "line-join": "round"
          },
          "paint": {
            "line-color": "#69bffe",
            "line-dasharray": [0.2, 2],
            "line-width": 2
          }
        },       
        {
          "id": "gl-draw-polygon-and-line-vertex-halo-active",
          "type": "circle",
          "filter": ["all", ["==", "meta", "vertex"], ['==', 'active', 'true'], ["==", "$type", "Point"], ["!=", "mode", "static"]],
          "paint": {
            "circle-radius": 7,
            "circle-color": "#FFF"
          }
        },
        {
          "id": "gl-draw-polygon-and-line-vertex-active",
          "type": "circle",
          "filter": ["all", ["==", "meta", "vertex"], ['!=', 'active', 'true'], ["==", "$type", "Point"], ["!=", "mode", "static"]],
          "paint": {
            "circle-radius": 3,
            "circle-color": "#69bffe",
          }
        },
        {
          'id': 'highlight-active-points',
          'type': 'circle',
          'filter': ['all',
            ['==', '$type', 'Point'],
            ['==', 'active', 'true']
          ],
          'paint': {
            'circle-radius': 5,
            'circle-color': '#69bffe'
          }
        },
        {
          'id': 'points-are-blue',
          'type': 'circle',
          'filter': ['all',
            ['==', '$type', 'Point']
          ],
          'paint': {
            'circle-radius': 5,
            'circle-color': '#FFF'
          }
        },
        {
          'id': 'gl-draw-polygon-midpoint',
          'type': 'circle',
          'filter': ['all',
            ['==', '$type', 'Point']
          ],
          'paint': {
            'circle-radius': 3,
            'circle-color': '#69bffe'
          }
        }        
      ]
    })

    this.assets.map.addControl(this.assets.draw, 'top-left')
    this.assets.map.addControl(new mapboxgl.NavigationControl({
      showCompass: false,
      showZoom: true
    }), 'top-right')            

    if(typeof this.getAttribute('footprint-api-endpoint') == 'undefined' || this.getAttribute('footprint-api-endpoint') == '' || this.getAttribute('footprint-api-endpoint') === null) {
      alert("No footprint API endpoint is provided")
      return
    }
    else
    {
      this.config.footprintApiURL = this.getAttribute('footprint-api-endpoint')
    }


    this.assets.map.on('load', () => {
      // Place of code which is to be triggered when the Mapbox map finishes loading
      window.appEventBus.addEventListener('geocode-location-selected', (data) => {
        let location = data.detail.center
        this.matchRoof(location[0], location[1]).then((response)=>{
          this.processMatch(response)
        })  
      })
    })

    if( typeof latitude != 'undefined' && latitude != null && typeof longitude != 'undefined' && longitude != null) {
      this.matchRoof(longitude, latitude).then((data)=>{
        this.processMatch(data)
      })
    }
    this.addEventListeners()
  }
  matchRoof(lat, lng) {
    return fetch(`${this.config.footprintApiURL}${lng}/${lat}`).then((response)=>{
      return response.json()
    })
  }
  processMatch(matchRoofResult) {
    if(typeof matchRoofResult.status != "undefined" && matchRoofResult.status == "success"){
      let focus_bounds = new mapboxgl.LngLatBounds()
      matchRoofResult.geom.coordinates[0].forEach((coordinate) => {
        focus_bounds.extend(coordinate)
      })
      if(!focus_bounds.isEmpty()){
        //this.assets.map.setCenter(focus_bounds.getCenter())
        //this.assets.map.setZoom(19)
        this.assets.map.fitBounds(focus_bounds, {duration: 0, padding: 70})
      }
      let newFeature = JSON.parse(JSON.stringify(this.assets.draw.add({"type": "Feature", "properties": {}, "geometry": matchRoofResult.geom})))
                
      this.assets.draw.set({"type": "FeatureCollection", "features": [this.assets.draw.get(newFeature[0])]})
    }
    else
    {
      alert(matchRoofResult.message)
    }
  }
  updateMeasure(self) {
    let labelFeatures = []
    let totalArea = 0
    let roofArea = {total: 0, roofs: []}
    let all = this.assets.draw.getAll()
    if (all && all.features) {
      if(all.features.length > 0){
        all.features.forEach(function (feature) {
            switch (turf.getType(feature)) {
            case 'Polygon':
            if (feature.geometry.coordinates.length > 0 && feature.geometry.coordinates[0].length > 3) {
                let label = (turf.area(turf.polygon(feature.geometry.coordinates)) * 10.7639104).toFixed(1) + ' sqft'
                totalArea += (turf.area(turf.polygon(feature.geometry.coordinates)) * 10.7639104).toFixed(1) * 1
                
                roofArea.roofs.push({
                "id": feature.id,
                "centroid": turf.centroid(feature).geometry.coordinates,
                "area": (turf.area(turf.polygon(feature.geometry.coordinates)) * 10.7639104).toFixed(1) * 1
                })
                roofArea.total = totalArea

                self.config.areaList = JSON.parse(JSON.stringify(roofArea))

                let centroid = turf.centroid(feature)
                centroid.properties.label = label
                centroid.properties.type = 'area'
                labelFeatures.push(centroid)
            }
            break
            }
        })
            //roofObj.total_area = totalArea
            /*map.getSource('_measurements').setData({
            type: 'FeatureCollection',
            features: labelFeatures
            })*/            
            //console.log(roofObj)
      }
      else
      {
        self.config.areaList = JSON.parse(JSON.stringify(roofArea))
      }        
    }
  }
  getAreasList() {
    return this.config.areaList
  }                
  addEventListeners() {

    //Perform when the edit button is hit under the map
    window.appEventBus.addEventListener('edit-roof-selected', (data) => {          
      //Make the very first item within Mapbox draw selected
      let availableIDs = this.assets.draw.getAll().features.map((feature)=>{
        return feature.id
      })
      this.assets.draw.changeMode('simple_select')
      this.assets.draw.changeMode('simple_select', { 
        "featureIds": (availableIDs.length > 0) ? availableIDs[0] : [] 
      })      

      //Create a copy of the shape collection upon the user pressing the Edit Roofs button
      this.assets.temporary_storage.drawFeatures = JSON.parse(JSON.stringify(this.assets.draw.getAll()))
    })
    
    //Perform when the cancel button is hit under the map
    window.appEventBus.addEventListener('edit-roof-deselected', (data) => {          
      //Make all items within Mapbox draw selected
      this.assets.draw.changeMode('static')
      this.assets.draw.set(this.assets.temporary_storage.drawFeatures)
    })
    
    //Perform when the user clicks on the SAVE CHANGES button
    window.appEventBus.addEventListener('user-map-changes-save', (data) => {          
        //Make all items within Mapbox draw selected
        this.assets.draw.changeMode('static')
        console.log(this.getAreasList())
    })    

    //Perform when the polygon mode button is clicked over the map
    window.appEventBus.addEventListener('polygon-mode-selected', (data) => {          
      this.assets.draw.changeMode('draw_polygon')
    })

    //Peform when the trash button is clicked over the map
    window.appEventBus.addEventListener('trash-selected', (data) => {
      if(this.assets.draw.getSelectedIds().length > 0) {
        this.assets.draw.delete(this.assets.draw.getSelectedIds())
      }            
    })

    this.assets.map.on('draw.create', () => {
      this.updateMeasure(this)
    })
    this.assets.map.on('draw.update', () => {
      this.updateMeasure(this)
    })
    this.assets.map.on('draw.delete', () => {
      this.updateMeasure(this)
    })
    this.assets.map.on('draw.render', () => {
      this.updateMeasure(this)
    })            
  }
}

window.customElements.define('mapricot-map', MapricotMap);