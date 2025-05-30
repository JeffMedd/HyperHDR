# WS2814f RGBW Protocol Implementation Summary

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

### 3. "Swap W & G" Functionality
- WLED compatibility feature available since WLED 0.14.0-b1
- Swaps White and Green channel values after white algorithm processing
- Useful for certain WS2814f variants or specific wiring configurations

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
- **"Swap W & G"** checkbox (visible only when RGBW enabled)
- **White Algorithm** dropdown (enhanced options when RGBW enabled)
- **Dependencies**: Swap and advanced white algorithms only show when RGBW is enabled

## Localization
Added translations for "Swap W & G" in multiple languages:
- English: "Swap W & G"
- German: "W & G tauschen"
- French: "Échanger W et G"
- Spanish: "Intercambiar W y G"
- Italian: "Scambia W e G"
- Dutch: "W en G omwisselen"
- Polish: "Zamień W i G"
- Russian: "Поменять местами W и G"
- Czech: "Prohodit W a G"
- Chinese: "交换 W 和 G"

## Compatibility
- **WLED**: Full compatibility with WLED's WS2814f implementation
- **Hardware**: Works with WS2814f LEDs that support 4-channel RGBW
- **Existing Configurations**: Backward compatible - existing RGB configurations continue to work

## Usage Notes
1. Enable "Use RGBW protocol" for 4-channel WS2814f LEDs
2. Use "Swap W & G" if your LEDs require this WLED compatibility feature
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
