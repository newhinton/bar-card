import { css, html, LitElement } from 'lit';

export class BarCardEditor extends LitElement {

  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }

  // setConfig works the same way as for the card itself
  setConfig(config) {
    this._config = config;
  }

  // This function is called when the input element of the editor loses focus
  entityChanged(ev) {
    const _config = Object.assign({}, this._config);
    _config.entity = ev.detail.value.entity;
    _config.entity_secondary = ev.detail.value.entity_secondary;
    _config.icon = ev.detail.value.icon;
    _config.name = ev.detail.value.name;
    _config.severity_green = ev.detail.value.severity_green;
    _config.severity_yellow = ev.detail.value.severity_yellow;
    _config.severity_red = ev.detail.value.severity_red;


    this._config = _config;

    const event = new CustomEvent("config-changed", {
      detail: { config: _config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    // @focusout below will call entityChanged when the input field loses focus (e.g. the user tabs away or clicks outside of it)
    return html`
	<ha-form
	      .hass=${this._hass}
	      .data=${this._config}
	      .schema=${[
        { name: "entity", selector: { entity: {} } },
        { name: "entity_secondary", selector: { entity: { domain: "sensor" } } },
        { name: "icon", selector: { icon: {} } },
        { name: "name", selector: { text: {} } },
        { name: "severity_green", selector: { number: { min: 0, max: 100 } } },
        { name: "severity_yellow", selector: { number: { min: 0, max: 100 } } },
        { name: "severity_red", selector: { number: { min: 0, max: 100, value: 50 } } }
      ]}
        }}
      ]}
      .computeLabel=${this._computeLabel}
      @value-changed=${this.entityChanged} 
      ></ha-form>


    `;
  }
}
