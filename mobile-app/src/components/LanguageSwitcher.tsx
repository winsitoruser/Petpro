import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSwitcherProps {
  isCompact?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ isCompact = false }) => {
  const { currentLanguage, changeLanguage, t, availableLanguages } = useLanguage();
  const [modalVisible, setModalVisible] = React.useState(false);

  const getLanguageFlag = (code: string) => {
    switch (code) {
      case 'en':
        return '🇺🇸';
      case 'ja':
        return '🇯🇵';
      case 'id':
        return '🇮🇩';
      default:
        return '🌐';
    }
  };

  const getCurrentLanguageName = () => {
    const language = availableLanguages.find(lang => lang.code === currentLanguage);
    return language ? language.name : 'English';
  };

  const handleLanguageChange = async (langCode: string) => {
    await changeLanguage(langCode);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity 
        style={isCompact ? styles.compactButton : styles.button} 
        onPress={() => setModalVisible(true)}
      >
        {isCompact ? (
          <Text style={styles.flagText}>{getLanguageFlag(currentLanguage)}</Text>
        ) : (
          <View style={styles.buttonContent}>
            <Text style={styles.flagText}>{getLanguageFlag(currentLanguage)}</Text>
            <Text style={styles.languageText}>{getCurrentLanguageName()}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('language.language')}</Text>
            
            <FlatList
              data={availableLanguages}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    currentLanguage === item.code && styles.selectedLanguage
                  ]}
                  onPress={() => handleLanguageChange(item.code)}
                >
                  <Text style={styles.languageFlag}>{getLanguageFlag(item.code)}</Text>
                  <Text style={styles.languageName}>{item.name}</Text>
                  {currentLanguage === item.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  compactButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 18,
    marginRight: 5,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedLanguage: {
    backgroundColor: '#f5f5f5',
  },
  languageFlag: {
    fontSize: 22,
    marginRight: 15,
  },
  languageName: {
    fontSize: 16,
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default LanguageSwitcher;
