class BarCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity');
    }
    
    if (!config.entity_secondary) {
      throw new Error('Please define a secondary entity');
    }
    
    const root = this.shadowRoot;
    if (root.lastChild) root.removeChild(root.lastChild);
    
    const cardConfig = Object.assign({}, config);
    if (!cardConfig.scale) cardConfig.scale = "50px";
    if (!cardConfig.min) cardConfig.min = 0;
    if (!cardConfig.max) cardConfig.max = 100;
    
    const entityParts = this._splitEntityAndAttribute(cardConfig.entity);
    cardConfig.entity = entityParts.entity;
    if (entityParts.attribute) cardConfig.attribute = entityParts.attribute;
    
    
    const entityParts2 = this._splitEntityAndAttribute(cardConfig.entity_secondary);
    cardConfig.entity_secondary = entityParts2.entity;
    if (entityParts2.attribute) cardConfig.attribute_secondary = entityParts2.attribute;
    
    const card = document.createElement('ha-card');
    const content = document.createElement('div');
    const style = document.createElement('style');
    style.textContent = `
    .header-box {
      display: flex;
      padding-bottom: 10px;
    }
    .header-text {
      flex: 1;
    }
    .header-icon {
      padding: 0.5em;
    }
    .name {
      font-size: 2vh;
    }
    .gauge {
      display: block;
    }
    .dial {
      fill: var(--primary-background-color);
    }
    .value {
      fill: var(--gauge-color);
      transition: all 1s ease 0s;
      /*https://stackoverflow.com/a/41488264*/
      animation: dash 2s linear forwards;
    }
    ha-gauge-custom{
      width: 90%;
      display: block;
      margin-left: auto;
      margin-right: auto;
      padding: 10px;
    }
    @keyframes dash {
      to {
        stroke-dashoffset: 100;
      }
    }
    
    `;
    content.innerHTML = `
    <ha-gauge-custom id="wrapper" style="--gauge-color:var(--label-badge-blue);">
    <div class="header-box">
    <div id="header-icon" class="header-icon"></div>
    <div class="header-text">
    <div id="title" class="name">name</div>
    <div>
    <span id="value-alt">⚠️</span>
    <span> - </span>
    <span id="value-text">⚠️</span>
    </div>
    </div>
    </div>
    <svg viewBox="0 0 100 10" class="gauge">
    <rect width="100%" height="100%" rx="3" id="dial" class="dial"/>
    <rect width="100%" height="100%" rx="3" id="gauge" class="value"/>
    </svg>
    </ha-gauge-custom>
    `;
    card.appendChild(content);
    card.appendChild(style);
    card.addEventListener('click', event => {
      this._fire('hass-more-info', { entityId: cardConfig.entity });
    });
    root.appendChild(card);
    this._config = cardConfig;
  }
  
  _splitEntityAndAttribute(entity) {
    let parts = entity.split('.');
    if (parts.length < 3) {
      return { entity: entity };
    }
    
    return { attribute: parts.pop(), entity: parts.join('.') };
  }
  
  _fire(type, detail, options) {
    const node = this.shadowRoot;
    options = options || {};
    detail = (detail === null || detail === undefined) ? {} : detail;
    const event = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
                            composed: options.composed === undefined ? true : options.composed
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
  }
  
  _computeSeverity(stateValue, sections) {
    let numberValue = Number(stateValue);
    const severityMap = {
      red: "var(--label-badge-red)",
      yellow: "var(--label-badge-yellow)",
      green: "var(--label-badge-green)",
      normal: "var(--label-badge-blue)",
    }
    if (!sections) return severityMap["normal"];
    let sortable = [];
    for (let severity in sections) {
      sortable.push([severity, sections[severity]]);
    }
    sortable.sort((a, b) => { return a[1] - b[1] });
    
    if (numberValue >= sortable[0][1] && numberValue < sortable[1][1]) {
      return severityMap[sortable[0][0]]
    }
    if (numberValue >= sortable[1][1] && numberValue < sortable[2][1]) {
      return severityMap[sortable[1][0]]
    }
    if (numberValue >= sortable[2][1]) {
      return severityMap[sortable[2][0]]
    }
    return severityMap["normal"];
  }
  
  _getEntityStateValue(entity, attribute) {
    if (!attribute) {
      return entity.state;
    }
    
    return entity.attributes[attribute];
  }
  
  set hass(hass) {
    const config = this._config;
    const entityState = this._getEntityStateValue(hass.states[config.entity], config.attribute);
    let measurement = "";
    if (config.measurement == null)
      measurement = hass.states[config.entity].attributes.unit_of_measurement;
    else
      measurement = config.measurement;
    
    
    const entityStateSecondary = this._getEntityStateValue(hass.states[config.entity_secondary], config.attribute_secondary);
    let measurement_secondary = "";
    if (config.measurement_secondary == null)
      measurement_secondary = hass.states[config.entity_secondary].attributes.unit_of_measurement;
    else
      measurement_secondary = config.measurement_secondary;
    
    const root = this.shadowRoot;
    if (entityState !== this._entityState) {
      let text = entityState +" "+measurement
      if (entityState==="unknown"){
        text="⚠️"
      }
      
      let text_alt = entityStateSecondary +" "+measurement_secondary
      if (entityState==="unknown"){
        text_alt="⚠️"
      }
      
      root.getElementById("value-text").textContent = `${text}`;
      root.getElementById("value-alt").textContent = `${text_alt}`;
      
      var title = config.entity;
      if (typeof config.name !== 'undefined'){
        title = config.name;
      }
      root.getElementById("title").innerHTML = title;
      
      var percent = (entityState - config.min) / (config.max - config.min);
      root.getElementById("gauge").setAttribute("width", (percent*100)+"%");
      root.getElementById("wrapper").style = "--gauge-color:"+this._computeSeverity(entityState, config.severity);
      
      this._entityState = entityState;
      
      if (config.icon) {
        let icon = document.createElement("ha-icon");
        icon.setAttribute("icon", config.icon)
        icon.setAttribute("class", "icon")
        root.getElementById("header-icon").append(icon);
      }
    }
    root.lastChild.hass = hass;
  }
  
  getCardSize() {
    return 1;
  }
}

customElements.define('bar-card', BarCard);
