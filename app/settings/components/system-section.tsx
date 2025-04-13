'use client'

import { useState } from 'react'
import { Info, GitBranch, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'

export default function SystemSection() {
  const [expanded, setExpanded] = useState(false);
  
  // Get client-side browser information
  const browserInfo = typeof window !== 'undefined' ? getBrowserInfo() : {
    browser: 'Unknown',
    version: 'Unknown',
    os: 'Unknown',
    screenSize: 'Unknown',
    language: 'Unknown'
  };
  
  // System version information
  const systemInfo = {
    version: '1.2.0',
    releaseDate: 'March 10, 2025',
    environment: process.env.NODE_ENV,
    buildId: 'trakyz-20250310-1',
    apiVersion: 'v1.2',
    dataProvider: 'Yahoo Finance + CoinGecko API',
    supportedAssets: 'Crypto, Stocks, Precious Metals, Currencies, Bonds, REIT, Commodities',
    lastUpdate: new Date().toLocaleDateString()
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">System Info</h2>
        </div>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      <div className="text-[var(--text-secondary)] text-sm space-y-1">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-[var(--accent-primary)]" />
          <p>Version: <span className="text-[var(--text-primary)]">{systemInfo.version}</span></p>
        </div>
        <p>Released: {systemInfo.releaseDate}</p>
        
        {expanded && (
          <>
            <div className="pt-2 space-y-1">
              <div className="flex justify-between py-1 border-b border-[var(--bg-hover)]">
                <span>Build ID</span>
                <span className="text-[var(--text-primary)]">{systemInfo.buildId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--bg-hover)]">
                <span>API Version</span>
                <span className="text-[var(--text-primary)]">{systemInfo.apiVersion}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--bg-hover)]">
                <span>Environment</span>
                <span className="text-[var(--text-primary)]">{systemInfo.environment}</span>
              </div>
            </div>
            
            <div className="pt-2">
              <h3 className="font-medium text-[var(--text-primary)]">Your Device</h3>
              <div className="space-y-1 mt-1">
                <div className="flex justify-between py-1 border-b border-[var(--bg-hover)]">
                  <span>Browser</span>
                  <span className="text-[var(--text-primary)]">{browserInfo.browser} {browserInfo.version}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--bg-hover)]">
                  <span>Operating System</span>
                  <span className="text-[var(--text-primary)]">{browserInfo.os}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--bg-hover)]">
                  <span>Screen Resolution</span>
                  <span className="text-[var(--text-primary)]">{browserInfo.screenSize}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--bg-hover)]">
                  <span>Language</span>
                  <span className="text-[var(--text-primary)]">{browserInfo.language}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <h3 className="font-medium text-[var(--text-primary)]">System Status</h3>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>All systems operational</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Helper function to get browser information
function getBrowserInfo() {
  if (typeof window === 'undefined') {
    return {
      browser: 'Unknown',
      version: 'Unknown',
      os: 'Unknown',
      screenSize: 'Unknown',
      language: 'Unknown'
    };
  }

  const userAgent = window.navigator.userAgent;
  let browser = 'Unknown';
  let version = 'Unknown';
  let os = 'Unknown';
  
  // Detect browser and version
  if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
    version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || '';
  } else if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
    browser = 'Chrome';
    version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || '';
  } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    browser = 'Safari';
    version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || '';
  } else if (userAgent.indexOf('Edg') > -1) {
    browser = 'Edge';
    version = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || '';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    browser = 'Opera';
    version = userAgent.match(/(?:Opera|OPR)\/([0-9.]+)/)?.[1] || '';
  }

  // Detect OS
  if (userAgent.indexOf('Win') > -1) {
    os = 'Windows';
  } else if (userAgent.indexOf('Mac') > -1) {
    os = 'MacOS';
  } else if (userAgent.indexOf('Linux') > -1) {
    os = 'Linux';
  } else if (userAgent.indexOf('Android') > -1) {
    os = 'Android';
  } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
    os = 'iOS';
  }

  return {
    browser,
    version,
    os,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    language: window.navigator.language
  };
}