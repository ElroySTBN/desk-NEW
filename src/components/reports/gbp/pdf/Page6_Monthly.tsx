import { Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { GBPReportData } from '@/types/gbp-reports';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 30,
    textAlign: 'center',
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 20,
  },
  leftColumn: {
    width: '50%',
  },
  rightColumn: {
    width: '50%',
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  kpiItem: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 6,
    lineHeight: 1.5,
  },
  evolution: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 8,
    marginBottom: 10,
  },
  impactLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 10,
    marginBottom: 5,
  },
  impactText: {
    fontSize: 10,
    color: '#4B5563',
    lineHeight: 1.5,
  },
});

interface Page6_MonthlyProps {
  data: GBPReportData;
}

export function Page6_Monthly({ data }: Page6_MonthlyProps) {
  if (!data.monthlyKpis) {
    return null;
  }

  const { monthlyKpis, period } = data;
  const month = monthlyKpis.month;
  const year = period.year;

  const calculateEvolution = (current: number, previous: number) => {
    if (previous === 0) return { difference: current, percentage: 0, text: 'N/A' };
    const difference = current - previous;
    const percentage = ((difference / previous) * 100);
    const text = percentage >= 0 ? `+${percentage.toFixed(1)}%` : `${percentage.toFixed(1)}%`;
    return { difference, percentage, text };
  };

  const vueEnsembleEvol = calculateEvolution(monthlyKpis.vue_ensemble.current, monthlyKpis.vue_ensemble.previous);
  const appelsEvol = calculateEvolution(monthlyKpis.appels.current, monthlyKpis.appels.previous);
  const clicsWebEvol = calculateEvolution(monthlyKpis.clics_web.current, monthlyKpis.clics_web.previous);
  const itineraireEvol = calculateEvolution(monthlyKpis.itineraire.current, monthlyKpis.itineraire.previous);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1F2937' }}>RaiseMed.IA</Text>
      </View>

      <Text style={styles.title}>Rapport Mensuel Détaillé - {month} {year}</Text>

      <View style={styles.twoColumns}>
        {/* Colonne gauche */}
        <View style={styles.leftColumn}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERFORMANCES GÉNÉRALES</Text>
            <Text style={styles.kpiItem}>
              • {month} {year} : {monthlyKpis.vue_ensemble.current.toLocaleString('fr-FR')} interactions
            </Text>
            <Text style={styles.kpiItem}>
              • {month} {year - 1} : {monthlyKpis.vue_ensemble.previous.toLocaleString('fr-FR')} interactions
            </Text>
            <Text style={[styles.evolution, { color: vueEnsembleEvol.percentage >= 0 ? '#059669' : '#DC2626' }]}>
              Évolution : {vueEnsembleEvol.difference >= 0 ? '+' : ''}{vueEnsembleEvol.difference.toLocaleString('fr-FR')} ({vueEnsembleEvol.text})
            </Text>
            <Text style={styles.impactLabel}>Impact / Analyse :</Text>
            <Text style={styles.impactText}>{monthlyKpis.vue_ensemble.analysis}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📞 APPELS TÉLÉPHONIQUES</Text>
            <Text style={styles.kpiItem}>
              • {month} {year} : {monthlyKpis.appels.current.toLocaleString('fr-FR')} appels
            </Text>
            <Text style={styles.kpiItem}>
              • {month} {year - 1} : {monthlyKpis.appels.previous.toLocaleString('fr-FR')} appels
            </Text>
            <Text style={[styles.evolution, { color: appelsEvol.percentage >= 0 ? '#059669' : '#DC2626' }]}>
              Évolution : {appelsEvol.difference >= 0 ? '+' : ''}{appelsEvol.difference.toLocaleString('fr-FR')} ({appelsEvol.text})
            </Text>
            <Text style={styles.impactLabel}>Impact / Analyse :</Text>
            <Text style={styles.impactText}>{monthlyKpis.appels.analysis}</Text>
          </View>
        </View>

        {/* Colonne droite */}
        <View style={styles.rightColumn}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌐 CLICS VERS VOTRE SITE WEB</Text>
            <Text style={styles.kpiItem}>
              • {month} {year} : {monthlyKpis.clics_web.current.toLocaleString('fr-FR')} clics
            </Text>
            <Text style={styles.kpiItem}>
              • {month} {year - 1} : {monthlyKpis.clics_web.previous.toLocaleString('fr-FR')} clics
            </Text>
            <Text style={[styles.evolution, { color: clicsWebEvol.percentage >= 0 ? '#059669' : '#DC2626' }]}>
              Évolution : {clicsWebEvol.difference >= 0 ? '+' : ''}{clicsWebEvol.difference.toLocaleString('fr-FR')} ({clicsWebEvol.text})
            </Text>
            <Text style={styles.impactLabel}>Impact / Analyse :</Text>
            <Text style={styles.impactText}>{monthlyKpis.clics_web.analysis}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 DEMANDES D'ITINÉRAIRE</Text>
            <Text style={styles.kpiItem}>
              • {month} {year} : {monthlyKpis.itineraire.current.toLocaleString('fr-FR')} demandes
            </Text>
            <Text style={styles.kpiItem}>
              • {month} {year - 1} : {monthlyKpis.itineraire.previous.toLocaleString('fr-FR')} demandes
            </Text>
            <Text style={[styles.evolution, { color: itineraireEvol.percentage >= 0 ? '#059669' : '#DC2626' }]}>
              Évolution : {itineraireEvol.difference >= 0 ? '+' : ''}{itineraireEvol.difference.toLocaleString('fr-FR')} ({itineraireEvol.text})
            </Text>
            <Text style={styles.impactLabel}>Impact / Analyse :</Text>
            <Text style={styles.impactText}>{monthlyKpis.itineraire.analysis}</Text>
          </View>
        </View>
      </View>
    </Page>
  );
}

