import { Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: '#4A9EFF',
    opacity: 0.1,
  },
  blueGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '40%',
    height: '100%',
    backgroundColor: '#4A9EFF',
  },
  header: {
    position: 'absolute',
    top: 40,
    right: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    zIndex: 10,
  },
  logo: {
    width: 80,
    height: 40,
    objectFit: 'contain',
  },
  clientLogo: {
    width: 80,
    height: 40,
    objectFit: 'contain',
  },
  xSymbol: {
    fontSize: 24,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  titleContainer: {
    position: 'absolute',
    top: '30%',
    left: 40,
    right: 40,
    zIndex: 10,
  },
  mainTitle: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  baseline: {
    fontSize: 18,
    color: '#4A9EFF',
    marginTop: 20,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: 'column',
    gap: 8,
    zIndex: 10,
  },
  footerText: {
    fontSize: 10,
    color: '#1F2937',
  },
});

interface Page1_CoverProps {
  client: {
    name: string;
    company?: string;
    logo_url?: string;
  };
}

export function Page1_Cover({ client }: Page1_CoverProps) {
  return (
    <Page size="A4" style={styles.page}>
      {/* Background gradient */}
      <View style={styles.gradientBackground} />
      <View style={styles.blueGradient} />
      
      {/* Header avec logos */}
      <View style={styles.header}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937' }}>RaiseMed.IA</Text>
        <Text style={styles.xSymbol}>X</Text>
        {client.logo_url ? (
          <Image
            src={client.logo_url}
            style={styles.clientLogo}
          />
        ) : (
          <View style={[styles.clientLogo, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: 10, color: '#9CA3AF' }}>Logo Client</Text>
          </View>
        )}
      </View>
      
      {/* Titre principal */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Rapport de</Text>
        <Text style={styles.mainTitle}>Performances</Text>
        <Text style={styles.baseline}>Votre Visibilité Locale, Notre Expertise</Text>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Instagram : @Raisemed.IA</Text>
        <Text style={styles.footerText}>Contact : contact@raisemedia.fr</Text>
        <Text style={styles.footerText}>Site : raisemedia.fr</Text>
        <Text style={styles.footerText}>+33 7 82 49 21 24</Text>
      </View>
    </Page>
  );
}

