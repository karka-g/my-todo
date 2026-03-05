import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Main from '../app/index';

// Мокаем expo-router чтобы тесты не падали из-за навигации
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Мокаем картинки чтобы тесты не падали из-за файлов
jest.mock('../assets/images/woman.png', () => 'woman');
jest.mock('../assets/images/cup.png', () => 'cup');
jest.mock('../assets/images/watch.png', () => 'watch');
jest.mock('../assets/images/vase.png', () => 'vase');
jest.mock('../assets/images/Ellipse.png', () => 'ellipse');
jest.mock('../assets/images/circle.png', () => 'circle');
jest.mock('../assets/images/calendar.png', () => 'calendar');

// Тест 1 — проверяем первый заголовок
test('показывает заголовок Добро пожаловать в MY-TODO', () => {
  const { getByText } = render(<Main />);
  getByText('Добро пожаловать в MY-TODO');
});

// Тест 2 — проверяем второй заголовок
test('показывает подзаголовок Ставь задачи и получай баллы', () => {
  const { getByText } = render(<Main />);
  getByText('Ставь задачи и получай баллы');
});

// Тест 3 — проверяем что кнопка есть
test('показывает кнопку Начать', () => {
  const { getByText } = render(<Main />);
  getByText('Начать');
});

// Тест 4 — проверяем что кнопка нажимается
test('кнопка Начать нажимается без ошибок', () => {
  const { getByText } = render(<Main />);
  fireEvent.press(getByText('Начать'));
});

// Тест 5 — проверяем что при нажатии переходим на /profile
test('кнопка Начать переходит на страницу profile', () => {
  const mockPush = jest.fn();
  jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({
    push: mockPush,
  });

  const { getByText } = render(<Main />);
  fireEvent.press(getByText('Начать'));
  expect(mockPush).toHaveBeenCalledWith('/profile');
});