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
    position: 'relative',
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

interface Page2_VueEnsembleProps {
  data: GBPReportData;
}

export function Page2_VueEnsemble({ data }: Page2_VueEnsembleProps) {
  const { kpis, period, screenshots } = data;
  const vueEnsemble = kpis.vue_ensemble;
  const evolution = vueEnsemble.previous > 0
    ? ((vueEnsemble.current - vueEnsemble.previous) / vueEnsemble.previous) * 100
    : 0;
  const difference = vueEnsemble.current - vueEnsemble.previous;
  const evolutionText = evolution >= 0 ? `+${evolution.toFixed(1)}%` : `${evolution.toFixed(1)}%`;
  const evolutionColor = evolution >= 0 ? '#059669' : '#DC2626';

  return (
    <Page size="A4" style={styles.page}>
      {/* Logo en haut à droite */}
      <View style={styles.header}>
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1F2937' }}>RaiseMed.IA</Text>
      </View>

      {/* Colonne gauche */}
      <View style={styles.leftColumn}>
        <Text style={styles.title}>📊 VUE D'ENSEMBLE</Text>
        <Text style={styles.subtitle}>
          Période {period.startMonth}-{period.endMonth} {period.year}
        </Text>

        <View style={styles.kpiBlock}>
          <Text style={styles.kpiTitle}>INTERACTIONS TOTALES AVEC VOTRE FICHE :</Text>
          <Text style={styles.kpiItem}>
            • {period.startMonth}-{period.endMonth} {period.year} : {vueEnsemble.current.toLocaleString('fr-FR')} interactions
          </Text>
          <Text style={styles.kpiItem}>
            • {period.startMonth}-{period.endMonth} {period.year - 1} : {vueEnsemble.previous.toLocaleString('fr-FR')} interactions
          </Text>
          <Text style={[styles.evolution, { color: evolutionColor }]}>
            Évolution : {difference >= 0 ? '+' : ''}{difference.toLocaleString('fr-FR')} interactions ({evolutionText})
          </Text>
        </View>

        <View style={styles.analysisBlock}>
          <Text style={styles.analysisLabel}>Ce que cela signifie concrètement :</Text>
          <Text style={styles.analysisText}>{vueEnsemble.analysis}</Text>
        </View>
      </View>

      {/* Colonne droite */}
      <View style={styles.rightColumn}>
        {screenshots.vue_ensemble && (
          <Image
            src={screenshots.vue_ensemble}
            style={styles.screenshot}
          />
        )}
        {/* Mascotte (placeholder - à remplacer par l'image réelle) */}
        <View style={styles.mascot}>
          <Text style={{ fontSize: 60, textAlign: 'center' }}>🤖</Text>
        </View>
      </View>

      {/* Footer bleu */}
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

