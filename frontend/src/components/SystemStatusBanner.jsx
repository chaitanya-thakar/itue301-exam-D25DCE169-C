import React, { useState, useEffect } from 'react';
import { Server, Database, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import './SystemStatusBanner.css';

const SystemStatusBanner = () => {
  const [health, setHealth] = useState({
    backend: 'checking',
    database: 'checking',
    databaseType: 'Checking...',
    port: 5000,
    timestamp: null
  });
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/v1/health');
      if (!res.ok) throw new Error('Backend HTTP error');
      const data = await res.json();
      setHealth({
        backend: 'online',
        database: data.database === 'connected' ? 'connected' : 'in-memory',
        databaseType: data.databaseType || (data.databaseConnected ? 'MongoDB (Mongoose)' : 'In-Memory Mock Store'),
        port: data.port || 5000,
        timestamp: data.timestamp
      });
    } catch (err) {
      setHealth({
        backend: 'offline',
        database: 'offline',
        databaseType: 'Unavailable (Backend Offline)',
        port: 5000,
        timestamp: new Date().toISOString()
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Poll health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`system-status-banner ${health.backend === 'offline' ? 'banner-alert' : ''}`}>
      <div className="container status-container">
        <div className="status-items">
          {/* Backend Status */}
          <div className="status-item">
            <Server size={15} className="status-icon" />
            <span className="status-label">Backend Server:</span>
            {health.backend === 'checking' && (
              <span className="status-badge-inline checking">Checking...</span>
            )}
            {health.backend === 'online' && (
              <span className="status-badge-inline online">
                <CheckCircle2 size={13} />
                <span>Online (Port {health.port})</span>
              </span>
            )}
            {health.backend === 'offline' && (
              <span className="status-badge-inline offline">
                <XCircle size={13} />
                <span>Offline (Run run.bat)</span>
              </span>
            )}
          </div>

          <span className="status-separator">•</span>

          {/* Database Status */}
          <div className="status-item">
            <Database size={15} className="status-icon" />
            <span className="status-label">Database:</span>
            {health.backend === 'offline' ? (
              <span className="status-badge-inline offline">Disconnected</span>
            ) : health.database === 'connected' ? (
              <span className="status-badge-inline online">
                <CheckCircle2 size={13} />
                <span>MongoDB Connected</span>
              </span>
            ) : (
              <span className="status-badge-inline warning" title="Using in-memory data store">
                <AlertTriangle size={13} />
                <span>In-Memory Store (Active)</span>
              </span>
            )}
          </div>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={checkHealth}
          className="btn-status-refresh"
          title="Check Backend & Database Health"
          disabled={checking}
        >
          <RefreshCw size={13} className={checking ? 'spin-icon' : ''} />
          <span>{checking ? 'Checking...' : 'Check Status'}</span>
        </button>
      </div>
    </div>
  );
};

export default SystemStatusBanner;
