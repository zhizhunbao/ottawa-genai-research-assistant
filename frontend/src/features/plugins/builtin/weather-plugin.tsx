/**
 * WeatherWidget - Example plugin providing a weather dashboard widget
 *
 * @module features/plugins/builtin
 */

import type { PluginInstance, PluginWidgetProps } from '../types';
import { Cloud, Sun, CloudRain, Snowflake, Thermometer, Droplets, Wind } from 'lucide-react';

function WeatherWidgetComponent({ compact }: PluginWidgetProps) {
  const weather = {
    city: 'Ottawa',
    temp: -8,
    condition: 'Snowy',
    humidity: 72,
    wind: 15,
    forecast: [
      { day: 'Mon', temp: -6, icon: 'snow' },
      { day: 'Tue', temp: -3, icon: 'cloud' },
      { day: 'Wed', temp: 1, icon: 'sun' },
      { day: 'Thu', temp: -1, icon: 'rain' },
      { day: 'Fri', temp: 2, icon: 'sun' },
    ],
  };

  const getWeatherIcon = (condition: string, size = 'h-4 w-4') => {
    switch (condition) {
      case 'snow': return <Snowflake className={size} />;
      case 'rain': return <CloudRain className={size} />;
      case 'cloud': return <Cloud className={size} />;
      case 'sun': return <Sun className={size} />;
      default: return <Cloud className={size} />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Snowflake className="h-4 w-4" />
        <span>{weather.temp}°C</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-semibold">{weather.city}</h4>
          <p className="text-2xl font-bold">{weather.temp}°C</p>
          <p className="text-xs text-muted-foreground">{weather.condition}</p>
        </div>
        <Snowflake className="h-10 w-10 text-muted-foreground/40" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <Thermometer className="h-3 w-3 text-muted-foreground" />
          <span>{weather.temp}°C</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets className="h-3 w-3 text-muted-foreground" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="h-3 w-3 text-muted-foreground" />
          <span>{weather.wind}km/h</span>
        </div>
      </div>

      <div className="flex-1 flex items-end">
        <div className="w-full grid grid-cols-5 gap-1">
          {weather.forecast.map((day) => (
            <div key={day.day} className="flex flex-col items-center gap-0.5 py-1 text-xs">
              <span className="text-[10px] text-muted-foreground">{day.day}</span>
              {getWeatherIcon(day.icon)}
              <span className="font-medium">{day.temp}°</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const weatherPlugin: PluginInstance = {
  manifest: {
    id: 'weather-widget',
    name: 'Weather Widget',
    description: 'Weather information for Ottawa with a 5-day forecast.',
    version: '1.0.0',
    author: 'Built-in',
    icon: 'Cloud',
    category: 'utilities',
    tags: ['weather', 'forecast', 'ottawa'],
  },
  widgets: [
    {
      slot: 'dashboard-widget',
      component: WeatherWidgetComponent,
      defaultWidth: 2,
      defaultHeight: 2,
      priority: 10,
    },
  ],
};
