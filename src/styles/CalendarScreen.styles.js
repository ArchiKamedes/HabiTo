import { StyleSheet } from 'react-native';

export const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginTop: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: theme.isAccessibilityMode ? 40 : 32,
    fontFamily: 'TitilliumWeb_400Regular',
    color: theme.colors.text,
    fontWeight: theme.isAccessibilityMode ? 'bold' : 'normal',
  },
  calendar: {
    marginBottom: 10,
    borderRadius: 16,
    marginHorizontal: theme.spacing.m,
    elevation: 3,
    paddingBottom: 10,
    borderWidth: theme.isAccessibilityMode ? 2 : 0,
    borderColor: theme.colors.text,
  },
  arrowContainer: {
    padding: theme.isAccessibilityMode ? 15 : 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: theme.isAccessibilityMode ? 60 : 40,
    minHeight: theme.isAccessibilityMode ? 60 : 40,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.m,
  },
  sectionTitle: {
    fontSize: theme.isAccessibilityMode ? 28 : 22,
    fontFamily: 'TitilliumWeb_700Bold',
    color: theme.colors.text,
    marginBottom: 15,
    marginTop: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    padding: theme.isAccessibilityMode ? 25 : 20,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderLeftWidth: theme.isAccessibilityMode ? 10 : 6,
    borderWidth: theme.isAccessibilityMode ? 3 : 0,
    borderColor: theme.isAccessibilityMode ? theme.colors.text : 'transparent',
    elevation: 2,
  },
  iconBox: {
    width: theme.isAccessibilityMode ? 70 : 50,
    alignItems: 'center',
    marginRight: 15,
  },
  cardTitle: {
    fontSize: theme.isAccessibilityMode ? 24 : 18,
    color: theme.colors.text,
    fontFamily: 'TitilliumWeb_700Bold',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: theme.isAccessibilityMode ? 18 : 14,
    color: theme.isAccessibilityMode ? theme.colors.text : theme.colors.inactive,
    fontFamily: theme.isAccessibilityMode ? 'TitilliumWeb_600SemiBold' : 'TitilliumWeb_400Regular',
  },
  emptyText: {
    color: theme.isAccessibilityMode ? theme.colors.text : theme.colors.inactive,
    textAlign: 'center',
    marginTop: 30,
    fontSize: theme.isAccessibilityMode ? 24 : 18,
    fontFamily: 'TitilliumWeb_400Regular',
    fontWeight: theme.isAccessibilityMode ? 'bold' : 'normal',
  }
});