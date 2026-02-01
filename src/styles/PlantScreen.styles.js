import { StyleSheet } from 'react-native';

export const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  bubbleContainer: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    width: 160,
    marginBottom: 10,
  },
  bubbleTextBold: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'TitilliumWeb_700Bold',
  },
  bubbleText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'TitilliumWeb_400Regular',
  },
  bubbleArrow: {
    position: 'absolute',
    bottom: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  }

});