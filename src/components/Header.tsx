import React from 'react';
import { View, StyleSheet, Linking, Pressable } from 'react-native';
import { ThemedText } from './themed-text';

export function Header() {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => openLink("https://www.youtube.com/channel/UCkj71ff5W1nIeL5p4E-m5Hw")} style={styles.link}>
        <ThemedText style={styles.linkText}>YouTube</ThemedText>
      </Pressable>
      <Pressable onPress={() => openLink("https://www.instagram.com/its_cipolletti/")} style={styles.link}>
        <ThemedText style={styles.linkText}>Instagram</ThemedText>
      </Pressable>
      <Pressable onPress={() => openLink("https://www.facebook.com/profile.php?id=100042874851211")} style={styles.link}>
        <ThemedText style={styles.linkText}>Facebook</ThemedText>
      </Pressable>
      <Pressable onPress={() => openLink("https://x.com/itscipolletti")} style={styles.link}>
        <ThemedText style={styles.linkText}>X (Twitter)</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    paddingTop: 30,
    gap: 15,
    flexWrap: 'wrap',
    width: '100%',
  },
  link: {
    padding: 5,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#116EB3',
  }
});
