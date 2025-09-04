# WS2814f RGBW Protocol Implementatio  "swapWB": {
    "type": "boolean",
    "title": "edt_dev_spec_swapWB_title",
    "default": false,
    "dependencies": { "rgbw": true }
  },ary

## Overview
This implementation adds RGBW (Red-Green-Blue-White) protocol support to HyperHDR's WS2814f LED drivers, making them compatible with WLED's WS2814f implementation.

## Features Implemented

### 1. RGBW Protocol Support
- **PWM Driver**: `DriverPwmWs2814f` now supports RGBW mode
- **SPI Driver**: `DriverSpiWs2814fSPI` now supports RGBW mode
- **Color Order**: Uses BRG (Blue-Red-Green) + White channel when RGBW is enabled
- **Strip Type**: Automatically switches to `SK6812_STRIP_BRGW` for RGBW mode

### 2. White Channel Algorithms
All standard HyperHDR white algorithms are supported:
- `white_off` (default)
- `subtract_minimum`
- `sub_min_cool_adjust`
- `sub_min_warm_adjust`
- `white_from_blue`

### 3. "Swap W & B" Functionality
- Hardware compatibility feature for certain WS2814f variants
- Swaps White and Blue channel values after white algorithm processing
- Useful for WS2814f LEDs with different internal channel mapping

## Technical Implementation

### Schema Changes
Both PWM and SPI schemas now include:
```json
{
  "rgbw": {
    "type": "boolean",
    "title": "edt_dev_spec_useRgbwProtocol_title",
    "default": false
  },
  "swapWG": {
    "type": "boolean",
    "title": "edt_dev_spec_swapWG_title",
    "default": false,
    "dependencies": { "rgbw": true }
  },
  "whiteAlgorithm": {
    "enum": ["white_off", "subtract_minimum", "sub_min_cool_adjust", "sub_min_warm_adjust", "white_from_blue"]
  }
}
```

### Driver Implementation
- **Strip Type Selection**: Automatically chooses between `WS2811_STRIP_GRB` (RGB) and `SK6812_STRIP_BRGW` (RGBW)
- **Color Processing**: Applies white algorithms using `RGBW::Rgb_to_Rgbw()` function
- **Channel Swapping**: Implements W↔G swap when enabled
- **Buffer Management**: Correctly handles 3-channel vs 4-channel LED data

### Color Order Mapping
- **RGB Mode**: GRB (Green-Red-Blue) - Standard WS2814f
- **RGBW Mode**: BRGW (Blue-Red-Green-White) - WLED Compatible

## User Interface
- **"Use RGBW protocol"** checkbox enables 4-channel mode
- **"Swap W & B"** checkbox (visible only when RGBW enabled)
- **White Algorithm** dropdown (enhanced options when RGBW enabled)
- **Dependencies**: Swap and advanced white algorithms only show when RGBW is enabled

## Localization
Added translations for "Swap W & B" in multiple languages:
- English: "Swap W & B"
- German: "W & B tauschen"
- French: "Échanger W et B"
- Spanish: "Intercambiar W y B"
- Italian: "Scambia W e B"
- Dutch: "W en B omwisselen"
- Polish: "Zamień W i B"
- Russian: "Поменять местами W и B"
- Czech: "Prohodit W a B"
- Chinese: "交换 W 和 B"

## Compatibility
- **WLED**: Full compatibility with WLED's WS2814f implementation
- **Hardware**: Works with WS2814f LEDs that support 4-channel RGBW
- **Existing Configurations**: Backward compatible - existing RGB configurations continue to work

## Usage Notes
1. Enable "Use RGBW protocol" for 4-channel WS2814f LEDs
2. Use "Swap W & B" if your WS2814f LEDs have White and Blue channels swapped internally
3. Select appropriate white algorithm based on your lighting requirements
4. For standard RGB WS2814f, leave RGBW protocol disabled

## Files Modified
- `sources/led-drivers/schemas/schema-ws2814fpwm.json`
- `sources/led-drivers/schemas/schema-ws2814fspi.json`
- `sources/led-drivers/pwm/rpi_ws281x/DriverPwmWs2814f.cpp`
- `sources/led-drivers/spi/DriverSpiWs2814fSPI.cpp`
- `include/led-drivers/pwm/rpi_ws281x/DriverPwmWs2814f.h`
- `include/led-drivers/spi/DriverSpiWs2814fSPI.h`
- `www/i18n/*.json` (all language files)

## Implementation Date
May 30, 2025
