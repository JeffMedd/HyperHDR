# WS2814f SPI Driver

## Overview
This driver adds support for the WS2814f LED strip controller chip to HyperHDR via SPI interface.

## WS2814f Specifications
Based on the official datasheet:

- **T0H** (0 code, high level time): 220ns ~ 380ns
- **T0L** (0 code, low level time): 580ns ~ 1µs  
- **T1H** (1 code, high level time): 580ns ~ 1µs
- **T1L** (1 code, low level time): 220ns ~ 380ns
- **RES** (Reset code, low level time): 280µs or more
- **Data Transfer Rate**: 600Kbps ~ 800Kbps
- **Color Order**: GRB (Green, Red, Blue)

## Implementation Details

### Timing Configuration
- **SPI Bit Rate**: 3.33 MHz (optimal for 800Kbps data rate)
- **Valid Range**: 2.8 MHz - 4.0 MHz
- **Reset Time**: 280µs = 140 bytes at maximum SPI rate
- **Encoding**: 4 SPI bits per LED color bit using bitpair encoding

### Bitpair Encoding
- **T0** (0 bit): `1000` - 300ns high, 900ns low
- **T1** (1 bit): `1110` - 900ns high, 300ns low

### Files Created
1. **Header**: `include/led-drivers/spi/DriverSpiWs2814fSPI.h`
2. **Implementation**: `sources/led-drivers/spi/DriverSpiWs2814fSPI.cpp`
3. **Schema**: `sources/led-drivers/schemas/schema-ws2814fspi.json`

### Device Registration
- **Device ID**: `ws2814fspi`
- **Group**: `leds_group_0_SPI`
- **Default SPI Path**: `/dev/spidev0.0`

## Usage
The driver will be available in HyperHDR's LED device configuration as "WS2814f SPI" and supports standard SPI configuration options including:
- SPI device path
- Baud rate (with recommended range validation)
- Signal inversion

## Integration Status
✅ Driver implementation complete
✅ Timing specifications from datasheet applied
✅ Schema file created and registered
✅ Added to build system (CMake + QRC)
✅ Device registration implemented

## Testing
To test the driver:
1. Build HyperHDR with `ENABLE_SPIDEV=ON`
2. Configure LED device type as "ws2814fspi"
3. Set appropriate SPI device path (e.g., `/dev/spidev0.0`)
4. Verify signal timing with oscilloscope if needed

## Notes
- Compatible with standard WS28xx LED strips using WS2814f controller
- Uses GRB color order as per WS2814f specification
- Optimized for 800Kbps data rate but supports full specified range
- Reset time increased to 280µs for reliable operation
