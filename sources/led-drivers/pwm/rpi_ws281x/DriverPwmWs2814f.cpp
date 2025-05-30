#include <led-drivers/pwm/rpi_ws281x/DriverPwmWs2814f.h>
#include <ws2811.h>

DriverPwmWs2814f::DriverPwmWs2814f(const QJsonObject& deviceConfig)
	: LedDevice(deviceConfig)
{
	_ledString = nullptr;
	_channel = 0;
	_whiteAlgorithm = RGBW::stringToWhiteAlgorithm("white_off");
	_useRgbw = false;
	_swapWG = false;
}

DriverPwmWs2814f::~DriverPwmWs2814f()
{
}

LedDevice* DriverPwmWs2814f::construct(const QJsonObject& deviceConfig)
{
	return new DriverPwmWs2814f(deviceConfig);
}

bool DriverPwmWs2814f::init(const QJsonObject& deviceConfig)
{
	QString errortext;
	bool isInitOK = false;

	if (_ledString == nullptr)
		_ledString = std::unique_ptr<ws2811_t>(new ws2811_t());

	// Initialise sub-class
	if (LedDevice::init(deviceConfig))
	{
		// Get RGBW configuration
		_useRgbw = deviceConfig["rgbw"].toBool(false);
		_swapWG = deviceConfig["swapWG"].toBool(false);

		QString whiteAlgorithm = deviceConfig["whiteAlgorithm"].toString("white_off");

		_whiteAlgorithm = RGBW::stringToWhiteAlgorithm(whiteAlgorithm);
		if (_whiteAlgorithm == RGBW::WhiteAlgorithm::INVALID)
		{
			errortext = QString("unknown whiteAlgorithm: %1").arg(whiteAlgorithm);
			isInitOK = false;
		}
		else
		{
			_channel = deviceConfig["pwmchannel"].toInt(0);
			if (_channel < 0 || _channel >= RPI_PWM_CHANNELS)
			{
				errortext = QString("WS2814f: invalid PWM channel. Must be greater than 0 and less than %1").arg(RPI_PWM_CHANNELS);
				isInitOK = false;
			}
			else
			{
				// Clear the ws2811_t structure
				memset(_ledString.get(), 0, sizeof(ws2811_t));

				// WS2814f configuration
				_ledString->freq = deviceConfig["freq"].toInt(800000UL);  // 800kHz default for WS2814f
				_ledString->dmanum = deviceConfig["dma"].toInt(5);
				_ledString->channel[_channel].gpionum = deviceConfig["gpio"].toInt(18);
				_ledString->channel[_channel].count = deviceConfig["leds"].toInt(256);
				_ledString->channel[_channel].invert = deviceConfig["invert"].toInt(0);

				// WS2814f configuration based on RGBW mode
				// For WS2814f: use BRG color order with White channel when RGBW is enabled
				if (_useRgbw)
				{
					_ledString->channel[_channel].strip_type = SK6812_STRIP_BRGW;  // BRG + White for WS2814f RGBW
				}
				else
				{
					_ledString->channel[_channel].strip_type = WS2811_STRIP_GRB;   // Standard GRB for RGB mode
				}
				_ledString->channel[_channel].brightness = 255;

				// Configure unused channel
				_ledString->channel[!_channel].gpionum = 0;
				_ledString->channel[!_channel].invert = _ledString->channel[_channel].invert;
				_ledString->channel[!_channel].count = 0;
				_ledString->channel[!_channel].brightness = 0;
				_ledString->channel[!_channel].strip_type = _ledString->channel[_channel].strip_type;

				// Validate frequency for WS2814f timing requirements
				// WS2814f supports 600-800Kbps data rate, optimally 700-800Kbps
				const uint32_t freq = _ledString->freq;
				if (freq < 600000 || freq > 1000000)
				{
					Warning(_log, "WS2814f: frequency %d Hz is outside recommended range (600000-800000 Hz)", freq);
				}

				Debug(_log, "WS2814f selected dma       : %d", _ledString->dmanum);
				Debug(_log, "WS2814f selected channel   : %d", _channel);
				Debug(_log, "WS2814f selected frequency : %d Hz", _ledString->freq);
				Debug(_log, "WS2814f selected gpio      : %d", _ledString->channel[_channel].gpionum);
				Debug(_log, "WS2814f total channels     : %d", RPI_PWM_CHANNELS);
				Debug(_log, "WS2814f RGBW mode          : %s", _useRgbw ? "enabled" : "disabled");
				Debug(_log, "WS2814f swap W & G         : %s", _swapWG ? "enabled" : "disabled");
				Debug(_log, "WS2814f strip type         : 0x%08X", _ledString->channel[_channel].strip_type);

				if (_defaultInterval > 0)
					Warning(_log, "The refresh timer is enabled ('Refresh time' > 0) and may limit the performance of the LED driver. Ignore this error if you set it on purpose for some reason (but you almost never need it).");

				isInitOK = true;
			}
		}
	}

	if (!isInitOK)
	{
		this->setInError(errortext);
	}
	return isInitOK;
}

int DriverPwmWs2814f::open()
{
	int retval = -1;
	_isDeviceReady = false;

	if (_ledString == nullptr)
	{
		Error(_log, "Unexpected uninitialized case");
		return retval;
	}

	ws2811_return_t rc = ws2811_init(_ledString.get());
	if (rc != WS2811_SUCCESS)
	{
		QString errortext = QString("Failed to open WS2814f. Error message: %1").arg(ws2811_get_return_t_str(rc));
		if (errortext.contains("mmap()", Qt::CaseInsensitive))
			errortext += ". YOU NEED TO RUN HYPERHDR AS A ROOT USER FOR MMAP TO WORK. SUCH CONFIGURATION IS NOT OFFICIALLY SUPPORTED.";
		this->setInError(errortext);
	}
	else
	{
		Info(_log, "WS2814f PWM driver initialized successfully");
		_isDeviceReady = true;
		retval = 0;
	}
	return retval;
}

int DriverPwmWs2814f::close()
{
	int retval = 0;
	_isDeviceReady = false;

	// LedDevice specific closing activities
	if (isInitialised())
	{
		Debug(_log, "Closing WS2814f PWM driver");
		ws2811_fini(_ledString.get());
	}

	return retval;
}

int DriverPwmWs2814f::write(const std::vector<ColorRgb>& ledValues)
{
	int idx = 0;

	// Write LED values with RGBW support
	for (const ColorRgb& color : ledValues)
	{
		if (idx >= _ledString->channel[_channel].count)
		{
			break;
		}

		_temp_rgbw.red = color.red;
		_temp_rgbw.green = color.green;
		_temp_rgbw.blue = color.blue;
		_temp_rgbw.white = 0;

		uint32_t ledValue;

		if (_useRgbw)
		{
			// Apply white algorithm for RGBW processing
			RGBW::Rgb_to_Rgbw(color, &_temp_rgbw, _whiteAlgorithm);

			// Apply W & G swap if enabled (WLED compatibility feature)
			if (_swapWG)
			{
				std::swap(_temp_rgbw.white, _temp_rgbw.green);
			}

			// Pack as BRGW (Blue-Red-Green-White) for WS2814f RGBW mode
			// Using SK6812_STRIP_BRGW format: 0xWWRRGGBB
			ledValue = ((uint32_t)_temp_rgbw.white << 24) +
					   ((uint32_t)_temp_rgbw.red << 16) +
					   ((uint32_t)_temp_rgbw.green << 8) +
					   _temp_rgbw.blue;
		}
		else
		{
			// Standard RGB mode using GRB color order
			// Format: 0x00RRGGBB but arranged for GRB strip type
			ledValue = ((uint32_t)_temp_rgbw.red << 16) +
					   ((uint32_t)_temp_rgbw.green << 8) +
					   _temp_rgbw.blue;
		}

		_ledString->channel[_channel].leds[idx++] = ledValue;
	}

	// Clear remaining LEDs
	while (idx < _ledString->channel[_channel].count)
	{
		_ledString->channel[_channel].leds[idx++] = 0;
	}

	// Render the data to the LED strip
	ws2811_return_t result = ws2811_render(_ledString.get());
	if (result != WS2811_SUCCESS)
	{
		Error(_log, "WS2814f render failed: %s", ws2811_get_return_t_str(result));
		return -1;
	}

	return 0;
}

bool DriverPwmWs2814f::isRegistered = hyperhdr::leds::REGISTER_LED_DEVICE("ws2814fpwm", "leds_group_1_PWM", DriverPwmWs2814f::construct);
