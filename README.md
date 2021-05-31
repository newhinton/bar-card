# Rounded Gauge card

A simple gauge implemented as animated svg based on https://github.com/custom-cards/gauge-card.

![Example Image](https://github.com/newhinton/gauge-card/blob/master/example.png?raw=true)

**Options**

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| type | string | **Required** | `custom:gauge-card`
| name | string | optional | Name to display on card
| measurement | string | optional | If not set, uses the unit_of_measurement on the entity
| entity | string | **Required** | `sensor.my_temperature`
| attribute | string | optional | If set, this attribute of the entity is used, instead of its state
| min | number | 0 | Minimum value for graph
| max | number | 100 | Maximum value for graph
| severity | object | optional | Severity object. See below

Severity object

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| green | number | optional | Value from which to start green color
| yellow | number | optional | Value from which to start amber color
| red | number | optional | Value from which to start red color

**Example**

Using two with stack
```yaml
- type: horizontal-stack
  cards:
    - type: custom:gauge-card
      title: Temperature
      entity: sensor.random_temperature
      min: -20
      max: 35
    - type: custom:gauge-card
      title: Oil
      entity: sensor.my_oil_sensor
      severity:
        green: 0
        yellow: 40
        red: 50
```

Simple one
```yaml
- type: custom:gauge-card
  entity: sensor.my_oil_sensor
```

Using an attribute
```yaml
- type: custom:gauge-card
  entity: climate.living_room
  attribute: current_temperature
```

Using an attribute with dot notation
```yaml
- type: custom:gauge-card
  entity: climate.living_room.current_temperature
```

## Credits
- [@ciotlosm](https://github.com/ciotlosm)
- [@isabellaalstrom](https://github.com/isabellaalstrom)
