import { pluginManager } from "@/utils/pluginSystem";
import { nigerianNewsPlugin } from "./nigerianNews";
import { currencyConverterPlugin } from "./currencyConverter";
import { jambCalculatorPlugin } from "./jambCalculator";
import { nepaTrackerPlugin } from "./nepaTracker";

// Register all plugins
export const initializePlugins = () => {
  pluginManager.registerPlugin(nigerianNewsPlugin);
  pluginManager.registerPlugin(currencyConverterPlugin);
  pluginManager.registerPlugin(jambCalculatorPlugin);
  pluginManager.registerPlugin(nepaTrackerPlugin);
  
  console.log('All plugins initialized');
};

export { pluginManager };
