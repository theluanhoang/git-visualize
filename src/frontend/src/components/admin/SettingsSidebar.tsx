import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

export interface SettingsTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface SettingsSidebarProps {
  tabs: SettingsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SettingsSidebar({ tabs, activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <Card className="p-4">
      <nav className="space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </nav>
    </Card>
  );
}
