import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ArchiveScreen from '../app/archive';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

// Тест 1 — заголовок отображается
test('показывает заголовок Архив задач', () => {
  const { getByText } = render(<ArchiveScreen />);
  getByText('Архив задач');
});

// Тест 2 — задачи отображаются
test('показывает список задач', () => {
  const { getAllByText } = render(<ArchiveScreen />);
  const tasks = getAllByText('Personal Project');
  expect(tasks.length).toBe(5);
});

// Тест 3 — подпись Перейти к задаче есть
test('показывает подпись Перейти к задаче', () => {
  const { getAllByText } = render(<ArchiveScreen />);
  const subtitles = getAllByText('Перейти к задаче');
  expect(subtitles.length).toBe(5);
});

// Тест 4 — кнопка домик нажимается
test('кнопка домик переходит на главный экран', () => {
  const mockPush = jest.fn();
  jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({
    push: mockPush,
  });

  const { getByTestId } = render(<ArchiveScreen />);
  fireEvent.press(getByTestId('home-button'));
  expect(mockPush).toHaveBeenCalledWith('/main');
});