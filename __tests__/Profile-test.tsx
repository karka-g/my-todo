import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ProfileScreen from '../app/profile';

// Нам нужно "заглушить" иконки, чтобы они не ломали тест
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('<ProfileScreen />', () => {
  it('проверяет наличие баллов на экране', async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(<ProfileScreen />);
    });
    
    const instance = tree.root;
    // Ищем текст, который содержит "85 баллов"
    const pointsText = instance.findByProps({ children: '85 баллов' });
    expect(pointsText).toBeTruthy();
  });

  it('проверяет наличие кнопки удаления аккаунта', async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(<ProfileScreen />);
    });

    const instance = tree.root;
    const deleteButton = instance.findByProps({ children: 'Удалить аккаунт' });
    expect(deleteButton).toBeTruthy();
  });
});