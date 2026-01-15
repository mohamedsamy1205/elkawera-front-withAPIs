import React, { useState } from 'react';
import { AlertCircle, Database, RefreshCw, CheckCircle } from 'lucide-react';

export const DatabaseReset: React.FC = () => {
    const [resetting, setResetting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetDatabase = async () => {
        setResetting(true);
        setError(null);
        setSuccess(false);

        try {
            console.log('🗑️ Deleting ElkaweraDB...');

            // Delete the database
            const deleteRequest = indexedDB.deleteDatabase('ElkaweraDB');

            deleteRequest.onsuccess = () => {
                console.log('✅ Database deleted successfully');
                setSuccess(true);
                setResetting(false);

                // Reload the page after 2 seconds to recreate the database
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            };

            deleteRequest.onerror = (event) => {
                console.error('❌ Failed to delete database:', event);
                setError('Failed to delete database. Please try manually.');
                setResetting(false);
            };

            deleteRequest.onblocked = () => {
                console.warn('⚠️ Database deletion blocked');
                setError('Database is blocked. Please close all other tabs with this app open and try again.');
                setResetting(false);
            };
        } catch (err: any) {
            console.error('Error resetting database:', err);
            setError(err.message || 'Unknown error occurred');
            setResetting(false);
        }
    };

    return (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={24} />
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-300 mb-2">Database Connection Error</h3>
                    <p className="text-gray-300 mb-4">
                        If you're experiencing issues creating player cards, you may need to reset the database.
                        This will clear all local data and recreate the database with the correct schema.
                    </p>

                    <div className="bg-black/30 rounded p-4 mb-4">
                        <h4 className="text-sm font-bold text-yellow-400 mb-2">⚠️ Warning</h4>
                        <p className="text-sm text-gray-400">
                            This will delete all locally stored data including:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-400 mt-2 space-y-1">
                            <li>Player cards</li>
                            <li>Teams</li>
                            <li>Matches</li>
                            <li>User accounts (you'll need to sign up again)</li>
                        </ul>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/40 rounded p-3 mb-4 flex items-start gap-2">
                            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-300">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/20 border border-green-500/40 rounded p-3 mb-4 flex items-start gap-2">
                            <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-300">
                                Database reset successfully! Reloading page...
                            </p>
                        </div>
                    )}

                    <button
                        onClick={resetDatabase}
                        disabled={resetting || success}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded transition-colors"
                    >
                        {resetting ? (
                            <>
                                <RefreshCw size={20} className="animate-spin" />
                                Resetting Database...
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle size={20} />
                                Reset Complete!
                            </>
                        ) : (
                            <>
                                <Database size={20} />
                                Reset Database
                            </>
                        )}
                    </button>

                    <div className="mt-4 text-xs text-gray-500">
                        <p className="font-bold mb-1">Alternative method:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Press F12 to open Developer Tools</li>
                            <li>Go to Application tab → IndexedDB</li>
                            <li>Right-click "ElkaweraDB" → Delete database</li>
                            <li>Refresh the page</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};
