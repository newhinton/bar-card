# Rounded Bar card

A simple bar-graph. Based on https://github.com/newhinton/gauge-card.

![Example Image](example.png?raw=true)

**Options**

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| type | string | **Required** | `custom:gauge-card`
| name | string | optional | Name to display on card
| measurement | string | optional | If not set, uses the unit_of_measurement on the entity
| entity | string | **Required** | `sensor.disk_usage_percent`
| entity_secondary | string | **Required** | `sensor.disk_usage`
| attribute | string | optional | If set, this attribute of the entity is used, instead of its state
| min | number | 0 | Minimum value for graph
| max | number | 100 | Maximum value for graph
| severity | object | optional | Severity object. See below
| icon | string | optional | Icon next to title

Severity object

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| green | number | optional | Value from which to start green color
| yellow | number | optional | Value from which to start amber color
| red | number | optional | Value from which to start red color

**Example**
```yaml
- type: horizontal-stack
  cards:
    - type: custom:bar-card
      title: Temperature
      entity: sensor.disk_usage
      entity_secondary: sensor.disk_usage_percent
      min: 0
      max: 100
      icon: mdi:harddisk
```


## Credits
- [@ciotlosm](https://github.com/ciotlosm)
- [@isabellaalstrom](https://github.com/isabellaalstrom)
