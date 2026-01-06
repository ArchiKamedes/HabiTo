import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const getStyles = (theme) => StyleSheet.create({
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
    fontSize: 32,
    fontFamily: 'TitilliumWeb_400Regular',
    color: theme.colors.text,
  },
  calendar: {
    marginBottom: 10,
    borderRadius: 16,
    marginHorizontal: theme.spacing.m,
    elevation: 3,
    paddingBottom: 10,
  },
  arrowContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.m,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'TitilliumWeb_700Bold',
    color: theme.colors.text,
    marginBottom: 15,
    marginTop: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderLeftWidth: 6,
    elevation: 2,
  },
  iconBox: {
    width: 50,
    alignItems: 'center',
    marginRight: 15,
  },
  cardTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontFamily: 'TitilliumWeb_700Bold',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: theme.colors.inactive,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  emptyText: {
    color: theme.colors.inactive,
    textAlign: 'center',
    marginTop: 30,
    fontSize: 18,
    fontFamily: 'TitilliumWeb_400Regular',
  }
});