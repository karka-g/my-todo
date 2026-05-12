import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import MainScreen from '../app/main';

// Мокаем expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Мокаем иконки
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

// Мокаем SVG
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: () => null,
  Circle: () => null,
}));

// Тест 1 — приветствие отображается
test('показывает приветствие Привет!', () => {
  const { getByText } = render(<MainScreen />);
  getByText('Привет!');
});

// Тест 2 — имя пользователя отображается
test('показывает имя пользователя', () => {
  const { getByText } = render(<MainScreen />);
  getByText('Иван Иванов');
});

// Тест 3 — карточка баллов отображается
test('показывает карточку Ваши баллы', () => {
  const { getByText } = render(<MainScreen />);
  getByText('Ваши баллы');
});

// Тест 4 — задачи отображаются
test('показывает список задач', () => {
  const { getAllByText } = render(<MainScreen />);
  const tasks = getAllByText('Personal Project');
  expect(tasks.length).toBe(5);
});

// Тест 5 — даты отображаются
test('показывает даты задач', () => {
  const { getByText } = render(<MainScreen />);
  getByText('24.02.2026');
  getByText('25.02.2026');
});

// Тест 6 — кнопка перехода в профиль нажимается
test('кнопка профиль переходит на страницу профиля', () => {
  const mockPush = jest.fn();
  jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({
    push: mockPush,
  });

  const { getByTestId } = render(<MainScreen />);
  fireEvent.press(getByTestId('profile-button'));
  expect(mockPush).toHaveBeenCalledWith('/profile');
});

// Тест 7 — кнопка добавить задачу нажимается
test('кнопка добавить задачу переходит на add-task', () => {
  const mockPush = jest.fn();
  jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({
    push: mockPush,
  });

  const { getByTestId } = render(<MainScreen />);
  fireEvent.press(getByTestId('add-task-button'));
  expect(mockPush).toHaveBeenCalledWith('/add-task');
});