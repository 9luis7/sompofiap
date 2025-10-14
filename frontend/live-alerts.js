// Live Alerts Module for Sompo System
class LiveAlertsModule {
  constructor(app) {
    this.app = app;
    this.activeAlerts = [];
    this.pollingInterval = null;
    this.notifiedAlerts = new Set();
    this.updateFrequency = 30000; // 30 seconds
  }

  /**
   * Initialize live alerts
   */
  async initialize() {
    console.log('Initializing Live Alerts Module...');
    await this.loadAlerts();
    this.startPolling();
  }

  /**
   * Start polling for new alerts
   */
  startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(() => {
      this.loadAlerts();
    }, this.updateFrequency);
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Load active alerts from API
   */
  async loadAlerts() {
    try {
      const response = await fetch(`${window.API_BASE_URL}/alerts/active`);
      const data = await response.json();

      if (data.success) {
        const newAlerts = data.data.alerts || [];

        // Check for new critical alerts
        newAlerts.forEach(alert => {
          if (
            alert.severity === 'critical' &&
            !this.notifiedAlerts.has(alert.shipment_number + alert.km)
          ) {
            this.showCriticalAlertNotification(alert);
            this.notifiedAlerts.add(alert.shipment_number + alert.km);
          }
        });

        this.activeAlerts = newAlerts;
        this.updateAlertsUI();
        this.updateAlertBadge();
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  }

  /**
   * Show critical alert notification
   */
  showCriticalAlertNotification(alert) {
    if (this.app && this.app.showNotification) {
      this.app.showNotification(`🚨 ${alert.title} - ${alert.shipment_number}`, 'error');
    }

    // Play alert sound (optional)
    this.playAlertSound();
  }

  /**
   * Play alert sound
   */
  playAlertSound() {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Ignore if audio not supported
    }
  }

  /**
   * Update alerts UI
   */
  updateAlertsUI() {
    const container = document.getElementById('live-alerts-feed');
    if (!container) return;

    if (this.activeAlerts.length === 0) {
      container.innerHTML = '<div class="empty-state">✅ Nenhum alerta ativo no momento</div>';
      return;
    }

    // Sort by severity and risk score
    const sorted = [...this.activeAlerts].sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.risk_score - a.risk_score;
    });

    container.innerHTML = sorted.map(alert => this.renderAlertCard(alert)).join('');

    // Add click handlers
    container.querySelectorAll('.alert-card').forEach((card, index) => {
      card.addEventListener('click', () => {
        this.showAlertDetails(sorted[index]);
      });
    });
  }

  /**
   * Render alert card HTML
   */
  renderAlertCard(alert) {
    const severityClass = {
      critical: 'alert-critical',
      high: 'alert-high',
      medium: 'alert-medium',
      low: 'alert-low',
    }[alert.severity];

    const severityIcon = {
      critical: '🚨',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️',
    }[alert.severity];

    const timeAgo = this.getTimeAgo(new Date(alert.created_at));

    return `
      <div class="alert-card ${severityClass}" data-shipment="${alert.shipment_number}">
        <div class="alert-header">
          <span class="alert-icon">${severityIcon}</span>
          <div class="alert-title-section">
            <div class="alert-title">${alert.title}</div>
            <div class="alert-meta">
              <span class="alert-shipment">${alert.shipment_number}</span>
              <span class="alert-time">${timeAgo}</span>
            </div>
          </div>
          <div class="alert-score">
            <div class="risk-score-badge risk-${alert.severity}">
              ${alert.risk_score.toFixed(0)}
            </div>
          </div>
        </div>
        <div class="alert-body">
          <div class="alert-location">
            📍 BR-${alert.br} (${alert.uf}) - KM ${alert.km.toFixed(1)}
          </div>
          <div class="alert-description">${alert.description}</div>
          ${
            alert.recommendations && alert.recommendations.length > 0
              ? `
            <div class="alert-recommendations">
              <strong>Recomendações:</strong>
              <ul>
                ${alert.recommendations
                  .slice(0, 2)
                  .map(r => `<li>${r}</li>`)
                  .join('')}
              </ul>
            </div>
          `
              : ''
          }
        </div>
        <div class="alert-footer">
          <span class="alert-confidence">Confiança: ${alert.confidence}%</span>
          <span class="alert-source">${this.getSourceLabel(alert.prediction_source)}</span>
        </div>
      </div>
    `;
  }

  /**
   * Show alert details in modal
   */
  showAlertDetails(alert) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'alert-modal-overlay';
    modal.innerHTML = `
      <div class="alert-modal glass-card">
        <div class="modal-header">
          <h2>${alert.title}</h2>
          <button class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="alert-detail-section">
            <h3>Informações do Alerta</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Carga:</span>
                <span class="detail-value">${alert.shipment_number}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Severidade:</span>
                <span class="detail-value">
                  <span class="badge badge-${alert.severity}">${alert.severity.toUpperCase()}</span>
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Score de Risco:</span>
                <span class="detail-value">${alert.risk_score.toFixed(2)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Confiança:</span>
                <span class="detail-value">${alert.confidence}%</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Localização:</span>
                <span class="detail-value">BR-${alert.br} (${alert.uf}) - KM ${alert.km.toFixed(1)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fonte:</span>
                <span class="detail-value">${this.getSourceLabel(alert.prediction_source)}</span>
              </div>
            </div>
          </div>

          <div class="alert-detail-section">
            <h3>Descrição</h3>
            <p>${alert.description}</p>
          </div>

          ${
            alert.segment_info
              ? `
            <div class="alert-detail-section">
              <h3>Informações do Segmento</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">KM Inicial:</span>
                  <span class="detail-value">${alert.segment_info.start_km}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">KM Final:</span>
                  <span class="detail-value">${alert.segment_info.end_km}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Acidentes (3 anos):</span>
                  <span class="detail-value">${alert.segment_info.accident_count}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Severidade Média:</span>
                  <span class="detail-value">${(alert.segment_info.avg_severity * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          `
              : ''
          }

          ${
            alert.recommendations && alert.recommendations.length > 0
              ? `
            <div class="alert-detail-section">
              <h3>Recomendações</h3>
              <ul class="recommendations-list">
                ${alert.recommendations.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>
          `
              : ''
          }

          ${
            alert.actions_suggested && alert.actions_suggested.length > 0
              ? `
            <div class="alert-detail-section">
              <h3>Ações Sugeridas</h3>
              <ul class="actions-list">
                ${alert.actions_suggested.map(a => `<li>${a}</li>`).join('')}
              </ul>
            </div>
          `
              : ''
          }

          <div class="alert-detail-section">
            <h3>Componentes do Score</h3>
            <div class="score-breakdown">
              <div class="score-item">
                <div class="score-label">Histórico</div>
                <div class="score-bar">
                  <div class="score-fill" style="width: ${alert.historical_score}%"></div>
                </div>
                <div class="score-value">${alert.historical_score.toFixed(1)}</div>
              </div>
              <div class="score-item">
                <div class="score-label">Previsão ML</div>
                <div class="score-bar">
                  <div class="score-fill" style="width: ${alert.ml_prediction_score}%"></div>
                </div>
                <div class="score-value">${alert.ml_prediction_score.toFixed(1)}</div>
              </div>
              <div class="score-item">
                <div class="score-label">Contextual</div>
                <div class="score-bar">
                  <div class="score-fill" style="width: ${alert.contextual_score}%"></div>
                </div>
                <div class="score-value">${alert.contextual_score.toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">Fechar</button>
          <button class="btn btn-primary" onclick="window.sompoApp.navigateToSection('map')">Ver no Mapa</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add close handlers
    modal.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.remove();
      });
    });

    // Close on overlay click
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  /**
   * Update alert badge count
   */
  updateAlertBadge() {
    const badge = document.getElementById('alert-badge-count');
    if (!badge) return;

    const criticalCount = this.activeAlerts.filter(a => a.severity === 'critical').length;

    if (criticalCount > 0) {
      badge.textContent = criticalCount;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }

  /**
   * Get time ago string
   */
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'agora mesmo';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
    return `${Math.floor(seconds / 86400)}d atrás`;
  }

  /**
   * Get source label
   */
  getSourceLabel(source) {
    const labels = {
      historical: 'Dados Históricos',
      ml_model: 'Modelo ML',
      hybrid: 'Híbrido (ML + Histórico)',
      rules_based: 'Regras',
    };
    return labels[source] || source;
  }

  /**
   * Get shipment alerts
   */
  async getShipmentAlerts(shipmentNumber) {
    try {
      const response = await fetch(`${window.API_BASE_URL}/alerts/shipment/${shipmentNumber}/live`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      }

      return null;
    } catch (error) {
      console.error('Error getting shipment alerts:', error);
      return null;
    }
  }

  /**
   * Render alert feed in shipment detail
   */
  async renderShipmentAlertFeed(shipmentNumber, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const alertData = await this.getShipmentAlerts(shipmentNumber);

    if (!alertData) {
      container.innerHTML = '<div class="empty-state">Nenhum alerta disponível</div>';
      return;
    }

    // Overall status indicator
    const statusIndicator = this.getStatusIndicator(alertData.overall_status);

    let html = `
      <div class="shipment-alert-status ${alertData.overall_status}">
        ${statusIndicator} Status Geral: <strong>${this.getStatusLabel(alertData.overall_status)}</strong>
      </div>
    `;

    // Current alerts
    if (alertData.current_alerts && alertData.current_alerts.length > 0) {
      html += `
        <div class="alert-section">
          <h4>⚠️ Alertas Atuais</h4>
          ${alertData.current_alerts.map(a => this.renderCompactAlert(a)).join('')}
        </div>
      `;
    }

    // Upcoming alerts
    if (alertData.upcoming_alerts && alertData.upcoming_alerts.length > 0) {
      html += `
        <div class="alert-section">
          <h4>🔮 Alertas Futuros</h4>
          ${alertData.upcoming_alerts.map(a => this.renderCompactAlert(a)).join('')}
        </div>
      `;
    }

    // Current segment
    if (alertData.current_segment) {
      html += `
        <div class="alert-section">
          <h4>📍 Segmento Atual</h4>
          <div class="segment-info">
            <div>BR-${alertData.current_segment.br} KM ${alertData.current_segment.start_km.toFixed(0)}-${alertData.current_segment.end_km.toFixed(0)}</div>
            <div class="risk-badge risk-${alertData.current_segment.alert_level}">
              Risco: ${alertData.current_segment.risk_score.toFixed(0)}
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  /**
   * Render compact alert
   */
  renderCompactAlert(alert) {
    const icon = {
      critical: '🚨',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️',
    }[alert.severity];

    return `
      <div class="compact-alert alert-${alert.severity}">
        <span class="alert-icon">${icon}</span>
        <div class="alert-content">
          <div class="alert-title-compact">${alert.title}</div>
          <div class="alert-location-compact">BR-${alert.br} KM ${alert.km.toFixed(0)}</div>
        </div>
        <div class="alert-score-compact">${alert.risk_score.toFixed(0)}</div>
      </div>
    `;
  }

  /**
   * Get status indicator
   */
  getStatusIndicator(status) {
    const indicators = {
      safe: '✅',
      caution: '⚡',
      warning: '⚠️',
      danger: '🚨',
    };
    return indicators[status] || '❓';
  }

  /**
   * Get status label
   */
  getStatusLabel(status) {
    const labels = {
      safe: 'SEGURO',
      caution: 'ATENÇÃO',
      warning: 'ALERTA',
      danger: 'PERIGO',
    };
    return labels[status] || status.toUpperCase();
  }

  /**
   * Get alert summary
   */
  async getAlertSummary() {
    try {
      const response = await fetch(`${window.API_BASE_URL}/alerts/summary`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      }

      return null;
    } catch (error) {
      console.error('Error getting alert summary:', error);
      return null;
    }
  }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LiveAlertsModule;
}
