export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'utility' | 'news' | 'education' | 'finance';
  execute: (params?: any) => Promise<any>;
  enabled: boolean;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  registerPlugin(plugin: Plugin) {
    this.plugins.set(plugin.id, plugin);
    console.log(`Plugin registered: ${plugin.name}`);
  }

  async executePlugin(pluginId: string, params?: any) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }
    if (!plugin.enabled) {
      throw new Error(`Plugin disabled: ${pluginId}`);
    }
    return await plugin.execute(params);
  }

  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getEnabledPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).filter(p => p.enabled);
  }

  enablePlugin(pluginId: string) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.enabled = true;
    }
  }

  disablePlugin(pluginId: string) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.enabled = false;
    }
  }
}

// Create singleton instance
export const pluginManager = new PluginManager();
