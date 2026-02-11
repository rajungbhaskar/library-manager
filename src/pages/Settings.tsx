import React, { useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Settings as SettingsIcon, DollarSign, Euro, PoundSterling, IndianRupee, Download, Upload, AlertTriangle } from 'lucide-react';
import AuthorsManager from '../components/AuthorsManager';
import { storageService, StorageData } from '../services/storageService';

const Settings: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currencies = [
        { symbol: '$', name: 'US Dollar', icon: DollarSign },
        { symbol: '€', name: 'Euro', icon: Euro },
        { symbol: '£', name: 'British Pound', icon: PoundSterling },
        { symbol: '₹', name: 'Indian Rupee', icon: IndianRupee },
        { symbol: '¥', name: 'Japanese Yen', icon: null },
    ];

    const handleExport = async () => {
        try {
            const data = await storageService.load();
            const date = new Date().toISOString().split('T')[0];
            const fileName = `my-shelf-backup-${date}.json`;
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const href = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = href;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(href);
        } catch (error) {
            console.error('Failed to export backup:', error);
            alert('Failed to export backup. Please try again.');
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (confirm('WARNING: Importing a backup will OVERWRITE all current data. This cannot be undone. Are you sure?')) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const json = event.target?.result as string;
                    const data = JSON.parse(json);

                    // Basic validation
                    if (!data || !Array.isArray(data.books)) {
                        throw new Error('Invalid backup file format. Missing "books" array.');
                    }

                    await storageService.replace(data as StorageData);
                    alert('Backup imported successfully! The app will now reload.');
                    window.location.reload();
                } catch (error) {
                    console.error('Failed to import backup:', error);
                    alert('Failed to import backup: ' + (error instanceof Error ? error.message : 'Unknown error'));
                }
            };
            reader.readAsText(file);
        }

        // Reset input so same file can be selected again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="container">
            <header className="page-header">
                <h1>Settings</h1>
            </header>

            <div className="card settings-card">
                <div className="setting-item">
                    <div className="setting-label">
                        <div className="icon-wrapper">
                            <SettingsIcon size={20} />
                        </div>
                        <div>
                            <h3>Currency Symbol</h3>
                            <p>Select the currency symbol to display throughout the app.</p>
                        </div>
                    </div>
                    <div className="setting-control">
                        <select
                            value={settings.currency}
                            onChange={(e) => updateSettings({ currency: e.target.value })}
                            className="currency-select"
                        >
                            {currencies.map((curr) => (
                                <option key={curr.symbol} value={curr.symbol}>
                                    {curr.symbol} - {curr.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="setting-item" style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)' }}>
                    <div className="setting-label">
                        <div className="icon-wrapper">
                            <Download size={20} />
                        </div>
                        <div>
                            <h3>Data Backup</h3>
                            <p>Export your library to a JSON file or restore from a backup.</p>
                        </div>
                    </div>
                    <div className="setting-control" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" onClick={handleExport}>
                            <Download size={16} style={{ marginRight: '0.5rem' }} /> Export
                        </button>
                        <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload size={16} style={{ marginRight: '0.5rem' }} /> Import
                        </button>
                        <input
                            type="file"
                            accept=".json"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleImport}
                        />
                    </div>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={14} />
                    <span>Importing will verify structure but overwrite existing data.</span>
                </div>
            </div>

            <AuthorsManager />

            <style>{`
                .page-header {
                    margin-bottom: var(--spacing-xl);
                }
                .settings-card {
                    max-width: 600px;
                }
                .setting-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--spacing-md) 0;
                }
                .setting-label {
                    display: flex;
                    gap: var(--spacing-md);
                    align-items: center;
                }
                .icon-wrapper {
                    padding: var(--spacing-md);
                    background-color: var(--color-background);
                    border-radius: 50%;
                    color: var(--color-primary);
                }
                .setting-label h3 {
                    margin-bottom: var(--spacing-xs);
                    font-size: var(--font-size-base);
                }
                .setting-label p {
                    color: var(--color-text-muted);
                    font-size: var(--font-size-sm);
                }
                .currency-select {
                    padding: var(--spacing-md);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--color-border);
                    background-color: var(--color-background);
                    cursor: pointer;
                    font-size: var(--font-size-base);
                    min-width: 150px;
                }
                .currency-select:focus {
                    outline: none;
                    border-color: var(--color-primary);
                }
            `}</style>
        </div>
    );
};

export default Settings;
