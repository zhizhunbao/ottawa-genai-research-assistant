/**
 * SystemSettings - Page for system-level configuration
 *
 * Shows application settings, integrations, and storage configuration.
 *
 * @module features/admin/modules/settings
 */

import { useEffect, useState } from 'react'
import {
  Settings,
  Cloud,
  Server,
  Database,
  Globe,
  Shield,
  HardDrive,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

interface HealthStatus {
  provider: string
  available: boolean
  message?: string
  model_count?: number
}

export default function SystemSettings() {
  const [health, setHealth] = useState<HealthStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load health status from the models API
    fetch('/api/v1/admin/llm-models/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHealth(data.data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Application configuration and integrations
        </p>
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Integrations
          </CardTitle>
          <CardDescription>
            Connected services and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {health.map((status) => (
                <div
                  key={status.provider}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {status.provider === 'azure' ? (
                      <Cloud className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Server className="h-5 w-5 text-purple-500" />
                    )}
                    <div>
                      <div className="font-medium capitalize">{status.provider}</div>
                      <div className="text-xs text-muted-foreground">
                        {status.message}
                        {status.model_count !== undefined && ` (${status.model_count} models)`}
                      </div>
                    </div>
                  </div>
                  {status.available ? (
                    <Badge variant="default" className="bg-emerald-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Unavailable
                    </Badge>
                  )}
                </div>
              ))}

              {/* Additional integrations */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-amber-500" />
                  <div>
                    <div className="font-medium">SQLite Database</div>
                    <div className="text-xs text-muted-foreground">Local data storage</div>
                  </div>
                </div>
                <Badge variant="default" className="bg-emerald-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingItem
              label="Application Name"
              value="Ottawa GenAI Research Assistant"
            />
            <SettingItem
              label="Version"
              value="0.1.0"
            />
            <SettingItem
              label="Default Language"
              value="English / French (Bilingual)"
            />
            <SettingItem
              label="Theme"
              value="System (Light/Dark)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingItem
              label="Authentication"
              value="Azure Entra ID (MSAL)"
            />
            <SettingItem
              label="CORS Origins"
              value="Configured via environment"
            />
            <SettingItem
              label="Session Timeout"
              value="24 hours"
            />
            <SettingItem
              label="API Rate Limiting"
              value="Disabled"
            />
          </div>
        </CardContent>
      </Card>

      {/* Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingItem
              label="Document Storage"
              value="Azure Blob Storage"
            />
            <SettingItem
              label="Max Upload Size"
              value="50 MB"
            />
            <SettingItem
              label="Vector Index"
              value="Azure AI Search + SQLite"
            />
            <SettingItem
              label="Model Storage"
              value="Local (Ollama)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Environment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Environment
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Most settings are configured via environment variables. See the
            <code className="mx-1 bg-muted px-1.5 py-0.5 rounded">.env</code>
            file or deployment configuration for:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Azure OpenAI endpoint and API keys</li>
            <li>Azure AI Search configuration</li>
            <li>Ollama server URL</li>
            <li>Database connection strings</li>
            <li>CORS and security settings</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

/** Setting item display component */
function SettingItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 border rounded-lg">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  )
}
