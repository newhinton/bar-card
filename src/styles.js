import { css } from 'lit';

export default css`
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