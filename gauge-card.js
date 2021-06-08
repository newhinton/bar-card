class GaugeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity');
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

    const card = document.createElement('ha-card');
    const content = document.createElement('div');
    const style = document.createElement('style');
    style.textContent = `
    .name {
	text-align: center;
        transform: translate(0, -20px);
    }
    .value-text {
        font-size: 45px;
        fill: var(--primary-text-color);
        transform: translate(0, -40px);
        text-align: center;
    }
    .gauge {
        display: block;
    }
    .dial {
        fill: none;
        stroke: var(--primary-background-color);
        stroke-width: 8;
	stroke-linecap: round;
    }
    .value {
        fill: none;
        stroke-width: 8;
        stroke: var(--gauge-color);
	stroke-linecap: round;
        transition: all 1s ease 0s;
	/*https://stackoverflow.com/a/41488264*/
        stroke-dasharray: 300;
        stroke-dashoffset: -150;
        animation: dash 2s linear forwards;
    }
    ha-gauge-custom{
        width: 100%;
        max-width: 250px;
        display: block;
        margin-left: auto;
        margin-right: auto;
        padding-top: 10px;
    }
    @keyframes dash {
      to {
        stroke-dashoffset: 100;
      }
    }

    `;
    content.innerHTML = `
      <ha-gauge-custom id="wrapper" style="--gauge-color:var(--label-badge-blue);">
        <svg viewBox="0 0 100 60" class="gauge">
          <path id="dial" class="dial" d="M 10 50 A 40 40 0 0 1 90 50"></path>
          <path id="gauge" class="value"></path>
        </svg>
        <div id="value-text" class="value-text">0 %</div>
        <div id="title" class="name">name</div>
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

  _translateTurn(value, config) {
    return 180 * (value - config.min) / (config.max - config.min)
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

    const root = this.shadowRoot;
    if (entityState !== this._entityState) {
      root.getElementById("value-text").textContent = `${entityState} ${measurement}`;
      var title = config.entity;
      if (typeof config.name !== 'undefined'){
        title = config.name;
      }
      root.getElementById("title").innerHTML = title;
      root.getElementById("dial").setAttribute("d", this.describeArc(50, 50, 40, 0, 180));
      const turn = this._translateTurn(entityState, config);
      if(turn > 0){
          root.getElementById("gauge").setAttribute("d", this.describeArc(50, 50, 40, 0, turn));
      }
      root.getElementById("wrapper").style = "--gauge-color:"+this._computeSeverity(entityState, config.severity);

      this._entityState = entityState;
    }
    root.lastChild.hass = hass;
  }

  getCardSize() {
    return 1;
  }

  /*https://stackoverflow.com/a/18473154*/
  describeArc(x, y, radius, startAngle, endAngle){
    var test = function (centerX, centerY, radius, angleInDegrees) {
      var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    }
    startAngle = startAngle-90
    endAngle = endAngle-90
    var start = test(x, y, radius, endAngle);
    var end = test(x, y, radius, startAngle);
    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    var d = [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    return d;
  }
}

customElements.define('gauge-card', GaugeCard);
