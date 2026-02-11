import React, { createContext, useContext, ReactNode } from 'react';
import { storageService } from '../services/storageService';

interface Settings {
    currency: string;
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
    currency: '$',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettingsState] = React.useState<Settings>(defaultSettings);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await storageService.load();
                if (data.settings) {
                    setSettingsState(data.settings);
                }
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const updateSettings = async (newSettings: Partial<Settings>) => {
        setSettingsState((prev) => {
            const updated = { ...prev, ...newSettings };
            // optimization: update state immediately, then save async
            storageService.save({ settings: updated });
            return updated;
        });
    };

    if (loading) {
        return null; // Or a loading spinner, but null is fine for settings to avoid flash
    }

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
