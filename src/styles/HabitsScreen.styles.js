import { StyleSheet } from 'react-native';

export const getStyles = (theme) => StyleSheet.create({
  topRowContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
    marginBottom: theme.spacing.m,
  },
  foldersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  dateRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  titleContainer: {
    padding: theme.spacing.s,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'TitilliumWeb_400Regular',
    color: theme.colors.text,
  },
  addButtonContainer: {
    padding: theme.spacing.s,
  },
  addShape: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  folderAddShape: {
    width: 75,
    height: 45,
    borderRadius: 20,
    backgroundColor: theme.colors.active, 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  foldersChoiceContainer: {
    flex: 1, 
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.text,
    marginRight: theme.spacing.s,
  },
  placeholderText: {
    color: theme.colors.text,  
    fontSize: 12,
  },
  subtitleContainer: {
    padding: theme.spacing.s,
  },
  subtitleText: {
    color: theme.colors.text,  
    fontSize: 22,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  dateContainer: {
    flex: 1, 
    padding: theme.spacing.s,
    marginLeft: theme.spacing.s,
  },
  dateText: {
    color: theme.colors.text, 
    fontSize: 22,
    fontFamily: 'TitilliumWeb_700Bold',
  },
  listContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    minHeight: 100, 
    elevation: 3,
  },
  itemWrapper: {
    marginBottom: 10,
  },
  emptyText: {
    color: theme.colors.inactive,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    width: '85%', backgroundColor: theme.colors.card,
    borderRadius: 20, padding: 25, alignItems: 'center',
    elevation: 5,
  },
  modalIconCircle: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22, color: theme.colors.text,
    fontFamily: 'TitilliumWeb_700Bold', marginBottom: 20,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    paddingBottom: 4,
  },
  detailLabel: {
    fontSize: 16,
    color: theme.colors.inactive,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: 'TitilliumWeb_700Bold',
    maxWidth: '60%',
    textAlign: 'right',
  },
  modalButtons: {
    flexDirection: 'row', justifyContent: 'space-between', width: '100%',
  },
  actionBtn: {
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, width: '45%', 
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
