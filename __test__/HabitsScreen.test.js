import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import HabitsScreen from '../src/screens/HabitsScreen';

const mockNavigation = {
  navigate: jest.fn(),
};

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../src/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: { background: 'white', text: 'black', card: 'white', primary: 'blue' },
      spacing: { m: 10, s: 5, l: 20 },
      isAccessibilityMode: false,
    },
  }),
}));

jest.mock('../src/firebaseConfig', () => ({
  auth: { currentUser: { uid: 'test-user-id' } },
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn((query, callback) => {
    callback({
      docs: [
        {
          id: '1',
          data: () => ({
            habitName: 'Testowy Nawyk',
            folder: 'Zdrowie',
            repeatMode: 'Codziennie',
            completedDates: []
          }),
        },
      ],
    });
    return () => {};
  }),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));

describe('HabitsScreen', () => {
  it('renderuje się poprawnie i wyświetla tytuł "Nawyki"', () => {
    render(<HabitsScreen navigation={mockNavigation} />);
    const titleElement = screen.getByText('Nawyki');
    expect(titleElement).toBeTruthy();
  });

  it('wyświetla nawyk pobrany z bazy danych (w sekcji Dzisiejsze lub Wszystkie)', async () => {
    render(<HabitsScreen navigation={mockNavigation} />);

    const habitElements = await screen.findAllByText('Testowy Nawyk');
    
    expect(habitElements.length).toBeGreaterThan(0);
  });

  it('przechodzi do ekranu dodawania po kliknięciu w plusa', () => {
    render(<HabitsScreen navigation={mockNavigation} />);
    
    const addButton = screen.getByLabelText('Dodaj nowy nawyk');
    fireEvent.press(addButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('HabitAdd');
  });
});