import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Footer() {
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#111111';
  const secondaryColor = isDark ? '#A0A0A0' : '#666666';

  return (
    <View style={[styles.container, { borderTopColor: isDark ? '#333' : '#E0E0E0' }]}>
      <Text style={[styles.title, { color: textColor }]}>Instituto Técnico Superior Cipolletti</Text>
      <Text style={[styles.description, { color: secondaryColor }]}>
        Desde su creación el Instituto Técnico Superior Cipolletti se ha ocupado de ser una institución que promueve la innovación y construcción de habilidades, estableciéndose como una alternativa de educación superior de alta calidad. El sello que distingue nuestra oferta educativa es la manera de aprender, que se lleva a cabo mediante clases prácticas, laboratorios, prácticas profesionalizantes y clases virtuales, generando un ambiente de constantes desafíos. El ITS Cipolletti es EDUCACIÓN PÚBLICA GRATUITA dependiente del Ministerio de Educación de Río Negro, inclusivo y accesible a tod@s l@s que quieran estudiar nuestras Tecnicaturas, basado en una gestión académica e institucional comprometida con la igualdad de oportunidades educativas.
      </Text>
      
      <View style={styles.infoSection}>
        <Text style={[styles.infoText, { color: textColor }]}>
          <Text style={{ fontWeight: 'bold' }}>Dirección:</Text> Perú, Río Salado y, R8324 Cipolletti, Río Negro
        </Text>
        <Text style={[styles.infoText, { color: textColor }]}>
          <Text style={{ fontWeight: 'bold' }}>Teléfono:</Text> 0299 477-1976
        </Text>
        <Text style={[styles.infoText, { color: textColor }]}>
          <Text style={{ fontWeight: 'bold' }}>Horarios:</Text> Lunes a Viernes de 19:00 a 23:00 hs (7–11 p.m.). Sábado y Domingo cerrado.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    marginTop: 40,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'justify',
  },
  infoSection: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
});
