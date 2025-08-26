import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const initialNotifications = [
  {
    id: 1,
    type: 'alert',
    icon: <MaterialIcons name="warning" size={28} color="#fff" style={{ marginRight: 12 }} />,
    title: 'Rabies Case Reported!',
    content: 'A new rabies case has been reported on Brgy Estrella area. Immediate verification and response required.',
    date: '2025-01-02',
    isRead: false,
  },
  {
    id: 2,
    type: 'report',
    icon: <Ionicons name="notifications" size={28} color="#fff" style={{ marginRight: 12 }} />,
    title: 'Scheduled Veterinary Outreach Program',
    content: 'A free veterinary check-up and vaccination campaign is set on 01/01/25 at Bgry Laram. Ensure the medical team, supplies, and logistics are prepared.',
    date: '2024-12-30',
    isRead: false,
  },
];

export default function NotificationPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      isRead: true
    })));
  };

  const clearNotifications = () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to clear all notifications?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setNotifications([]),
        },
      ]
    );
  };

  const hasUnreadNotifications = notifications.some(notification => !notification.isRead);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Notifications Center</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={markAllAsRead} disabled={!hasUnreadNotifications}>
              <Text style={[styles.markAll, !hasUnreadNotifications && styles.disabledText]}>
                Mark all as read
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearNotifications} disabled={notifications.length === 0}>
              <Text style={[styles.clearAll, notifications.length === 0 && styles.disabledText]}>
                Clear notifications
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Notification Feed */}
      <ScrollView style={styles.feed} contentContainerStyle={{ paddingBottom: 32 }}>
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>No notifications.</Text>
        ) : (
          notifications.map((n) => (
            <View key={n.id} style={[styles.notificationBox, n.isRead && { opacity: 0.5 }]}> 
              <View style={styles.iconCol}>{n.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notificationTitle}>{n.title}</Text>
                <Text style={styles.notificationContent}>{n.content}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 32,
  },
  headerRow: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  titleContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#045b26',
    textAlign: 'left',
    marginBottom: 4,
  },
  markAll: {
    color: '#D37F52',
    fontWeight: 'bold',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  clearAll: {
    color: '#D37F52',
    fontWeight: 'bold',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  disabledText: {
    color: '#ccc',
    fontWeight: 'bold',
    fontSize: 12,
  },
  feed: {
    flex: 1,
    paddingHorizontal: 16,
  },
  notificationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },
  iconCol: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 4,
  },
  notificationContent: {
    color: '#fff',
    fontSize: 15,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
}); 