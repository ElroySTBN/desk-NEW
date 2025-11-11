import { Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { GBPReportData } from '@/types/gbp-reports';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  leftColumn: {
    width: '60%',
    paddingRight: 20,
  },
  rightColumn: {
    width: '40%',
    paddingLeft: 20,
  },
  header: {
    position: 'absolute',
    top: 40,
    right: 40,
    zIndex: 10,
  },
  logo: {
    width: 60,
    height: 30,
    objectFit: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 30,
  },
  kpiBlock: {
    marginBottom: 20,
  },
  kpiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  kpiItem: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 1.6,
  },
  evolution: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 5,
  },
  analysisBlock: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
  },
  analysisLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    backgroundColor: '#4A9EFF',
    padding: 15,
    borderRadius: 5,
  },
  footerText: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  screenshot: {
    width: '100%',
    height: 'auto',
    maxHeight: 400,
    objectFit: 'contain',
    marginTop: 20,
    borderRadius: 5,
    border: '1px solid #E5E7EB',
  },
  mascot: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 120,
    height: 120,
    objectFit: 'contain',
    opacity: 0.3,
  },
});

interface Page4_ClicsWebProps {
  data: GBPReportData;
}

export function Page4_ClicsWeb({ data }: Page4_ClicsWebProps) {
  const { kpis, period, screenshots } = data;
  const clicsWeb = kpis.clics_web;
  const evolution = clicsWeb.previous > 0
    ? ((clicsWeb.current - clicsWeb.previous) / clicsWeb.previous) * 100
    : 0;
  const difference = clicsWeb.current - clicsWeb.previous;
  const evolutionText = evolution >= 0 ? `+${evolution.toFixed(1)}%` : `${evolution.toFixed(1)}%`;
  const evolutionColor = evolution >= 0 ? '#059669' : '#DC2626';

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1F2937' }}>RaiseMed.IA</Text>
      </View>

      <View style={styles.leftColumn}>
        <Text style={styles.title}>🌐 CLICS VERS VOTRE SITE WEB</Text>
        <Text style={styles.subtitle}>
          Période {period.startMonth}-{period.endMonth} {period.year}
        </Text>

        <View style={styles.kpiBlock}>
          <Text style={styles.kpiTitle}>CLICS VERS LE SITE WEB :</Text>
          <Text style={styles.kpiItem}>
            • {period.year} ({period.startMonth}-{period.endMonth}) : {clicsWeb.current.toLocaleString('fr-FR')} clics
          </Text>
          <Text style={styles.kpiItem}>
            • {period.year - 1} ({period.startMonth}-{period.endMonth}) : {clicsWeb.previous.toLocaleString('fr-FR')} clics
          </Text>
          <Text style={[styles.evolution, { color: evolutionColor }]}>
            Évolution : {difference >= 0 ? '+' : ''}{difference.toLocaleString('fr-FR')} clics ({evolutionText})
          </Text>
        </View>

        <View style={styles.analysisBlock}>
          <Text style={styles.analysisLabel}>Ce que cela signifie concrètement :</Text>
          <Text style={styles.analysisText}>{clicsWeb.analysis}</Text>
        </View>
      </View>

      <View style={styles.rightColumn}>
        {screenshots.clics_web && (
          <Image
            src={screenshots.clics_web}
            style={styles.screenshot}
          />
        )}
        <View style={styles.mascot}>
          <Text style={{ fontSize: 60, textAlign: 'center' }}>🤖</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          La visibilité locale est aujourd'hui un pilier essentiel pour les entreprises,{'\n'}
          et la fiche Google Business Profile représente le premier point de contact{'\n'}
          entre une entreprise et ses clients potentiels.
        </Text>
      </View>
    </Page>
  );
}

