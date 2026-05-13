FROM node:18-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем весь проект
COPY . .

# Указываем API URL для фронтенда (внутри Docker сети)
ENV EXPO_PUBLIC_API_URL=http://backend:8000

# Запускаем Expo
EXPOSE 3000

CMD ["npm", "start"]