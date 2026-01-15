import { StyleSheet } from 'react-native';

export const getStyles = (theme) => StyleSheet.create({
  mainContainer: {
    flex: 1, 
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.m, 
  },
  topRowContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
    marginBottom: theme.spacing.m,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.isAccessibilityMode ? 40 : 32,
    fontFamily: 'TitilliumWeb_400Regular', // Zmiana na lżejszą czcionkę jak w nawykach
    color: theme.colors.text,
    fontWeight: theme.isAccessibilityMode ? 'bold' : 'normal',
  },
  addButtonContainer: {
    padding: theme.spacing.s,
  },
  addShape:{
    width: theme.isAccessibilityMode ? 65 : 50, 
    height: theme.isAccessibilityMode ? 65 : 50,
    borderRadius: theme.isAccessibilityMode ? 32.5 : 25,
    backgroundColor: theme.colors.primary, // Zmiana na primary (jak w nawykach)
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    borderWidth: theme.isAccessibilityMode ? 3 : 0,
    borderColor: theme.colors.text,
  },
  foldersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    height: theme.isAccessibilityMode ? 100 : 60, 
  },
  folderItem: {
    width: theme.isAccessibilityMode ? 110 : 70, 
    height: theme.isAccessibilityMode ? 80 : 45,     
    borderRadius: 15, 
    backgroundColor: theme.colors.card, 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, 
    borderWidth: theme.isAccessibilityMode ? 4 : 1,
    borderColor: theme.isAccessibilityMode ? theme.colors.text : (theme.colors.border || '#ccc'), 
  },
  folderItemSelected: {
    backgroundColor: theme.colors.primary, 
    borderColor: theme.isAccessibilityMode ? theme.colors.text : theme.colors.primary,
  },
  folderAddShape:{
    width: theme.isAccessibilityMode ? 110 : 70, 
    height: theme.isAccessibilityMode ? 80 : 45,
    borderRadius: 15,
    backgroundColor: theme.colors.active, // Zmiana na active (jak w nawykach)
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    borderWidth: theme.isAccessibilityMode ? 4 : 0,
    borderColor: theme.colors.text, 
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  titleTaskContainer: {
    padding: theme.spacing.s,
  },
  foldersAddContainer: {
    padding: theme.spacing.s,
  },
  titleTodayContainer: {
    padding: theme.spacing.s,
  },
  daysDateContainer: {
    flex: 1, 
    padding: theme.spacing.s,
    marginLeft: theme.spacing.s,
  },
  dateRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  subtitleContainer: {
    marginRight: 15,
  },
  subtitleText: {
    fontSize: theme.isAccessibilityMode ? 28 : 22,
    color: theme.colors.text,
    fontFamily: 'TitilliumWeb_400Regular', // Ujednolicenie czcionki
  },
  dateContainer: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tasksTodayContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    marginBottom: theme.spacing.l,
    marginTop: theme.spacing.n,
    minHeight: 200, 
    elevation: 3,
  },
  titleFutureContainer: {
    padding: theme.spacing.s,
    marginBottom: theme.spacing.s,
    alignSelf: 'flex-start', 
  },
  tasksFutureContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    minHeight: 200, 
    marginBottom: theme.spacing.l, 
    marginTop: theme.spacing.n,
    elevation: 3,
  },
  titleTaskText:{
    color: theme.colors.text, 
    fontSize: 32,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  SubTytlesText:{
    color: theme.colors.text,
    fontSize: 22,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  dateText:{
    color: theme.colors.text, 
    fontSize: theme.isAccessibilityMode ? 24 : 22, // Powiększone, by pasowało do nawyków
    fontFamily: 'TitilliumWeb_700Bold', 
  },
  emptyListText: {
    color: theme.isAccessibilityMode ? theme.colors.text : theme.colors.inactive,
    textAlign: 'center',
    marginTop: 20,
    fontSize: theme.isAccessibilityMode ? 22 : 16,
    fontFamily: 'TitilliumWeb_400Regular',
    fontWeight: theme.isAccessibilityMode ? 'bold' : 'normal',
  },
  emptyText: {
    color: theme.isAccessibilityMode ? theme.colors.text : theme.colors.inactive,
    textAlign: 'center',
    marginTop: 20,
    fontSize: theme.isAccessibilityMode ? 22 : 16,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  listContainer: {
    minHeight: 50,
  },
  swipeContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  deleteAction: {
    backgroundColor: '#FF4500', 
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    width: '100%',
    height: '100%', 
  },
  itemWrapper: {
    marginBottom: 5,
  }
});