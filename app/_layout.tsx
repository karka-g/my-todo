import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="main" options={{ headerShown: false }} />
  <Stack.Screen name="profile" options={{ headerShown: false }} />
  <Stack.Screen name="add-task" options={{ headerShown: false }} />
  <Stack.Screen name="archive" options={{ headerShown: false }} />
</Stack>
  );
}