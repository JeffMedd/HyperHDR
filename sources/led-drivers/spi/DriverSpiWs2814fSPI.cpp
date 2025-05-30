#include <led-drivers/spi/DriverSpiWs2814fSPI.h>

/*
WS2814f timing characteristics (from datasheet):

T0H,	 0 code, high level time,	 220ns ~ 380ns
T0L,	 0 code, low level time,	 580ns ~ 1µs
T1H,	 1 code, high level time,	 580ns ~ 1µs
T1L,	 1 code, low level time,	 220ns ~ 380ns
RES,	 Reset code, low level time, 280µs or more
TDATA,	 Data period,			 ≥1.25µs
FMAX,	 Data Transfer Rate,		 600Kbps ~ 800Kbps

Using typical values:
T0H = 300ns, T0L = 900ns, T1H = 800ns, T1L = 300ns
Total period = 1.2µs (833Kbps)

To normalise the pulse times so they fit in 4 SPI bits:
A SPI bit time of 0.30uS = 3.33 Mbit/sec
T0 is sent as 1000 (300ns high, 900ns low)
T1 is sent as 1110 (900ns high, 300ns low)

With timing optimization:
2800000 MIN
3333333 AVG
4000000 MAX

Reset time:
using the max of 4000000, the bit time is 0.25µs
Reset time is 280µs = 1120 bits = 140 bytes

*/

DriverSpiWs2814fSPI::DriverSpiWs2814fSPI(const QJsonObject& deviceConfig)
	: ProviderSpi(deviceConfig)
	, SPI_BYTES_PER_COLOUR(4)
	, SPI_FRAME_END_LATCH_BYTES(140)
	, bitpair_to_byte{
		0b10001000,
		0b10001110,
		0b11101000,
		0b11101110,
}
{
}


LedDevice* DriverSpiWs2814fSPI::construct(const QJsonObject& deviceConfig)
{
	return new DriverSpiWs2814fSPI(deviceConfig);
}

bool DriverSpiWs2814fSPI::init(const QJsonObject& deviceConfig)
{
	_baudRate_Hz = 3333333;

	bool isInitOK = false;

	// Initialise sub-class
	if (ProviderSpi::init(deviceConfig))
	{
		WarningIf((_baudRate_Hz < 2800000 || _baudRate_Hz > 4000000), _log, "SPI rate %d outside recommended range (2800000 -> 4000000)", _baudRate_Hz);

		_ledBuffer.resize(_ledRGBCount * SPI_BYTES_PER_COLOUR + SPI_FRAME_END_LATCH_BYTES, 0x00);

		isInitOK = true;
	}

	return isInitOK;
}

int DriverSpiWs2814fSPI::write(const std::vector<ColorRgb>& ledValues)
{
	unsigned spi_ptr = 0;
	const int SPI_BYTES_PER_LED = sizeof(ColorRgb) * SPI_BYTES_PER_COLOUR;

	if (_ledCount != ledValues.size())
	{
		Warning(_log, "Ws2814fSPI led's number has changed (old: %d, new: %d). Rebuilding buffer.", _ledCount, ledValues.size());
		_ledCount = ledValues.size();

		_ledBuffer.resize(0, 0x00);
		_ledBuffer.resize(_ledRGBCount * SPI_BYTES_PER_COLOUR + SPI_FRAME_END_LATCH_BYTES, 0x00);
	}

	for (const ColorRgb& color : ledValues)
	{
		// WS2814f uses GRB color order
		uint32_t colorBits = ((unsigned int)color.green << 16)
			| ((unsigned int)color.red << 8)
			| color.blue;

		for (int j = SPI_BYTES_PER_LED - 1; j >= 0; j--)
		{
			_ledBuffer[spi_ptr + j] = bitpair_to_byte[colorBits & 0x3];
			colorBits >>= 2;
		}
		spi_ptr += SPI_BYTES_PER_LED;
	}

	for (int j = 0; j < SPI_FRAME_END_LATCH_BYTES; j++)
	{
		_ledBuffer[spi_ptr++] = 0;
	}

	return writeBytes(_ledBuffer.size(), _ledBuffer.data());
}



bool DriverSpiWs2814fSPI::isRegistered = hyperhdr::leds::REGISTER_LED_DEVICE("ws2814fspi", "leds_group_0_SPI", DriverSpiWs2814fSPI::construct);
