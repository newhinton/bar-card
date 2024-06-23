import { BarCard } from "./bar-card";
import { BarCardEditor } from "./bar-card-editor";


customElements.define('bar-card', BarCard);
customElements.define('bar-card-editor', BarCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "bar-card",
  name: "My Bar Card",
  description: "A custom bar card",
});


// https://github.com/home-assistant-tutorials/09.toggle-card-lit/tree/master/src
// https://community.home-assistant.io/t/custom-cards-with-gui-editor-as-of-2023/542254/8
