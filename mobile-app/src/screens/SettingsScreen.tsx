import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const SettingsScreen = () => {
  const { t } = useLanguage();
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  const renderSettingsItem = (title: string, component: React.ReactNode) => (
    <View style={styles.settingsItem}>
      <Text style={styles.settingTitle}>{title}</Text>
      <View style={styles.settingControl}>
        {component}
      </View>
    </View>
  );

  const renderSettingsLink = (title: string, onPress: () => void) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile.settings')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.title')}</Text>
        {renderSettingsLink(t('profile.editProfile'), () => {})}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.appName')}</Text>
        {renderSettingsItem(
          t('profile.language'), 
          <LanguageSwitcher />
        )}
        {renderSettingsItem(
          t('profile.darkMode'),
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={darkMode ? '#f5dd4b' : '#f4f3f4'}
          />
        )}
        {renderSettingsItem(
          t('profile.notifications'),
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notifications ? '#f5dd4b' : '#f4f3f4'}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.help')}</Text>
        {renderSettingsLink(t('profile.about'), () => {})}
        {renderSettingsLink(t('profile.terms'), () => {})}
        {renderSettingsLink(t('profile.privacy'), () => {})}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#888',
    marginVertical: 10,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 20,
    color: '#888',
  },
});

export default SettingsScreen;
