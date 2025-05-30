#pragma once

#include <led-drivers/LedDevice.h>

struct ws2811_t;

///
/// Implementation of the LedDevice interface for writing to WS2814f LED strips via PWM.
/// This driver extends the rpi_ws281x library to support WS2814f timing characteristics.
///
/// WS2814f timing requirements:
/// - T0H: 220-380ns (0 code high time)
/// - T0L: 580ns-1µs (0 code low time)
/// - T1H: 580ns-1µs (1 code high time)
/// - T1L: 220-380ns (1 code low time)
/// - RES: 280µs+ (reset low time)
/// - Data rate: 600-800Kbps
/// - Color order: GRB
///
class DriverPwmWs2814f : public LedDevice
{
public:
	explicit DriverPwmWs2814f(const QJsonObject& deviceConfig);
	~DriverPwmWs2814f() override;
	static LedDevice* construct(const QJsonObject& deviceConfig);

protected:
	bool init(const QJsonObject& deviceConfig) override;
	int open() override;
	int close() override;
	int write(const std::vector<ColorRgb>& ledValues) override;

private:
	std::unique_ptr<ws2811_t> _ledString;
	int _channel;
	RGBW::WhiteAlgorithm _whiteAlgorithm;
	ColorRgbw _temp_rgbw;
	bool _useRgbw;
	bool _swapWG;

	static bool isRegistered;
};
