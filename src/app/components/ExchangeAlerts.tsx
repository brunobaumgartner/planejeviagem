/**
 * EXCHANGE ALERTS - FEATURE 2
 * 
 * Sistema de alertas de variação cambial
 * Notifica quando a moeda atinge valor desejado
 */

import { useState } from 'react';
import { Bell, BellOff, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { currencyService } from '@/services/currencyService';

interface Alert {
  id: string;
  from: string;
  to: string;
  targetRate: number;
  direction: 'above' | 'below';
  active: boolean;
  createdAt: string;
}

interface ExchangeAlertsProps {
  from: string;
  to: string;
  currentRate: number;
  className?: string;
}

export function ExchangeAlerts({
  from,
  to,
  currentRate,
  className = '',
}: ExchangeAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [targetRate, setTargetRate] = useState<string>(currentRate.toFixed(4));
  const [direction, setDirection] = useState<'above' | 'below'>('below');

  function createAlert() {
    const newAlert: Alert = {
      id: Date.now().toString(),
      from,
      to,
      targetRate: parseFloat(targetRate),
      direction,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setAlerts([...alerts, newAlert]);
    setShowForm(false);
    console.log('[ExchangeAlerts] Alerta criado:', newAlert);
  }

  function toggleAlert(id: string) {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, active: !alert.active } : alert
    ));
  }

  function deleteAlert(id: string) {
    setAlerts(alerts.filter(alert => alert.id !== id));
  }

  function checkAlerts() {
    const triggered = alerts.filter(alert => {
      if (!alert.active) return false;
      
      if (alert.direction === 'above' && currentRate >= alert.targetRate) return true;
      if (alert.direction === 'below' && currentRate <= alert.targetRate) return true;
      
      return false;
    });

    return triggered;
  }

  const triggeredAlerts = checkAlerts();

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Alertas de Câmbio</h3>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Criar Alerta'}
        </button>
      </div>

      {/* Current Rate */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
        <div className="text-sm text-gray-600 mb-1">Taxa Atual</div>
        <div className="text-2xl font-bold text-blue-900">
          1 {from} = {currentRate.toFixed(4)} {to}
        </div>
      </div>

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {triggeredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-green-900 mb-1">
                    🎯 Alerta Atingido!
                  </div>
                  <div className="text-sm text-green-700">
                    A taxa {alert.direction === 'below' ? 'caiu abaixo' : 'subiu acima'} de{' '}
                    {alert.targetRate.toFixed(4)} {to}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Alert Form */}
      {showForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alertar quando a taxa:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDirection('below')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                    direction === 'below'
                      ? 'bg-green-50 border-green-400 text-green-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <TrendingDown className="w-4 h-4 inline mr-2" />
                  Cair abaixo de
                </button>
                <button
                  onClick={() => setDirection('above')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                    direction === 'above'
                      ? 'bg-red-50 border-red-400 text-red-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Subir acima de
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taxa desejada ({to})
              </label>
              <input
                type="number"
                value={targetRate}
                onChange={(e) => setTargetRate(e.target.value)}
                step="0.0001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.0000"
              />
            </div>

            <button
              onClick={createAlert}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Criar Alerta
            </button>
          </div>
        </div>
      )}

      {/* Alerts List */}
      {alerts.length > 0 ? (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Seus Alertas ({alerts.filter(a => a.active).length} ativos)
          </div>
          
          {alerts.map((alert) => {
            const isTriggered = checkAlerts().some(a => a.id === alert.id);
            
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isTriggered
                    ? 'bg-green-50 border-green-400'
                    : alert.active
                    ? 'bg-white border-blue-200'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isTriggered ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : alert.active ? (
                      <Bell className="w-5 h-5 text-blue-600" />
                    ) : (
                      <BellOff className="w-5 h-5 text-gray-400" />
                    )}
                    
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {alert.direction === 'below' ? '↓' : '↑'} {alert.targetRate.toFixed(4)} {to}
                      </div>
                      <div className="text-xs text-gray-600">
                        {alert.direction === 'below' ? 'Cair abaixo' : 'Subir acima'} desta taxa
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                        alert.active
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {alert.active ? 'Ativo' : 'Pausado'}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {isTriggered && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <div className="text-xs text-green-700 font-medium">
                      ✓ Meta atingida! Taxa atual: {currentRate.toFixed(4)} {to}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <div className="text-sm text-gray-600 mb-2">Nenhum alerta configurado</div>
          <div className="text-xs text-gray-500">
            Crie alertas para ser notificado quando a taxa atingir um valor desejado
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-start gap-2 text-xs text-gray-600">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p>
            Os alertas são verificados em tempo real enquanto você estiver com o app aberto.
            Ative notificações do navegador para receber avisos mesmo quando estiver em outra aba.
          </p>
        </div>
      </div>
    </div>
  );
}
