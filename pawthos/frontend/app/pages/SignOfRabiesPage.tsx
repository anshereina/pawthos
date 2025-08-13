import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function SignOfRabiesPage({ onBack }: { onBack?: () => void }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack || (() => {})} style={{marginRight: 4}}>
          <MaterialIcons name="chevron-left" size={30} color="#045b26" />
        </TouchableOpacity>
        <MaterialCommunityIcons name="dog" size={30} color="#045b26" style={{ marginRight: 4 }} />
        <MaterialCommunityIcons name="cat" size={30} color="#045b26" style={{ marginRight: 12 }} />
        <Text style={styles.title}>Common Signs of Rabies in Pets</Text>
      </View>
      {/* Introduction */}
      <View style={styles.introBox}>
        <Text style={styles.introText}>
          Rabies is a dangerous disease of animals transmissible to humans through bites of an infected animal.
        </Text>
      </View>
      {/* Canine Rabies */}
      <Text style={styles.sectionHeader}>Signs of Canine Rabies</Text>
      <Text style={styles.subHeader}>A. Furious Type:</Text>
      <View style={styles.bulletBox}>
        <Text style={styles.bulletText}>• A change from a friendly disposition into wild, vicious behavior.</Text>
        <Text style={styles.bulletText}>• Whining, as if in pain.</Text>
        <Text style={styles.bulletText}>• Foaming of the mouth.</Text>
        <Text style={styles.bulletText}>• If on a leash, biting objects within its reach; if caged, biting even the cage.</Text>
        <Text style={styles.bulletText}>• Difficulty in eating or drinking.</Text>
        <Text style={styles.bulletText}>• Restlessness.</Text>
        <Text style={styles.bulletText}>• Running aimlessly, snapping at imaginary objects, and biting anyone or anything in its path.</Text>
      </View>
      <Text style={styles.subHeader}>B. Dumb Type:</Text>
      <View style={styles.bulletBox}>
        <Text style={styles.bulletText}>• Becoming lethargic and depressed.</Text>
        <Text style={styles.bulletText}>• Hiding in dark, quiet places; sluggish or sleepy.</Text>
        <Text style={styles.bulletText}>• Refusing to eat.</Text>
        <Text style={styles.bulletText}>• Appearing to be staring at a distant object.</Text>
        <Text style={styles.bulletText}>• The lower jaw drops, the tongue hangs out, and the dog salivates continuously.</Text>
        <Text style={styles.bulletText}>• Difficulty in swallowing/drinking.</Text>
        <Text style={styles.bulletText}>• Lameness.</Text>
        <Text style={styles.bulletText}>• Difficulty in breathing.</Text>
        <Text style={styles.bulletText}>• Dying suddenly without any preceding signs.</Text>
      </View>
      {/* Feline Rabies */}
      <Text style={styles.sectionHeader}>Signs of Feline Rabies</Text>
      <Text style={styles.subHeader}>A. Prodromal Stage (Early Stage):</Text>
      <View style={styles.bulletBox}>
        <Text style={styles.bulletText}>• Personality Changes: The cat's usual behavior flips. A friendly cat might become withdrawn or irritable, while a shy cat might become unusually clingy.</Text>
        <Text style={styles.bulletText}>• They might lose their appetite, hide, or act restless or overly tired.</Text>
      </View>
      <Text style={styles.subHeader}>B. Furious Type:</Text>
      <View style={styles.bulletBox}>
        <Text style={styles.bulletText}>• Extreme Aggression: Cats become very aggressive, attacking without warning using both teeth and claws.</Text>
        <Text style={styles.bulletText}>• They become easily agitated by light, sound, or touch.</Text>
        <Text style={styles.bulletText}>• They might make strange, excessive meows or cries.</Text>
        <Text style={styles.bulletText}>• They can become disoriented, wander aimlessly, and have seizures.</Text>
        <Text style={styles.bulletText}>• Drooling/Foaming: They struggle to swallow, leading to a lot of drooling or foamy saliva.</Text>
        <Text style={styles.bulletText}>• They may bite or scratch at nothing in particular.</Text>
        <Text style={styles.bulletText}>• Unusually, they might lose their fear of people or other animals.</Text>
      </View>
      <Text style={styles.subHeader}>C. Dumb (Paralytic) Type:</Text>
      <View style={styles.bulletBox}>
        <Text style={styles.bulletText}>• Quiet and Withdrawn: Cats become very lethargic, depressed, and seek out dark, quiet places to hide.</Text>
        <Text style={styles.bulletText}>• They refuse to eat or drink.</Text>
        <Text style={styles.bulletText}>• Difficulty Swallowing: Their lower jaw might drop, and they drool continuously because they can't swallow.</Text>
        <Text style={styles.bulletText}>• Paralysis: Weakness starts in one area (like a limb) and spreads, eventually making them unable to move or stand.</Text>
        <Text style={styles.bulletText}>• They might stare blankly.</Text>
        <Text style={styles.bulletText}>• Eventually, they struggle to breathe, fall into a coma, and die suddenly.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#045b26',
    flex: 1,
    flexWrap: 'wrap',
  },
  introBox: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  introText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'left',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#045b26',
    marginTop: 10,
    marginBottom: 6,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#388e3c',
    marginTop: 8,
    marginBottom: 4,
  },
  bulletBox: {
    marginLeft: 8,
    marginBottom: 8,
  },
  bulletText: {
    color: '#333',
    fontSize: 15,
    marginBottom: 2,
  },
}); 