#pragma once

// hyperion includes
#include <led-drivers/spi/ProviderSpi.h>

///
/// Implementation of the LedDevice interface for writing to WS2814f led device via SPI.
///
class DriverSpiWs2814fSPI : public ProviderSpi
{
public:
	///
	/// @brief Constructs a WS2814f SPI LED-device
	///
	/// @param deviceConfig Device's configuration as JSON-Object
	///
	explicit DriverSpiWs2814fSPI(const QJsonObject& deviceConfig);

	///
	/// @brief Constructs the LED-device
	///
	/// @param[in] deviceConfig Device's configuration as JSON-Object
	/// @return LedDevice constructed
	static LedDevice* construct(const QJsonObject& deviceConfig);

	///
	/// @brief Initialise the device's configuration
	///
	/// @param[in] deviceConfig the JSON device configuration
	/// @return True, if success
	bool init(const QJsonObject& deviceConfig) override;

	///
	/// @brief Writes the RGB-Color values to the LEDs.
	///
	/// @param[in] ledValues The RGB-color per LED
	/// @return Zero on success, else negative
	///
	int write(const std::vector<ColorRgb>& ledValues) override;

	///
	/// @brief Get the SPI device's resource properties
	///
	/// @param[in] params Parameters used to overwrite discovery default settings
	/// @return JSON-Object holding the device's properties
	static QJsonObject discover(const QJsonObject& params);

	static bool isRegistered;

private:

	const int			SPI_BYTES_PER_COLOUR;
	const int			SPI_FRAME_END_LATCH_BYTES;
	const unsigned int	bitpair_to_byte[4];
};
