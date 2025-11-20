FROM debian:bullseye

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest \
    && node -v \
    && npm -v

WORKDIR /app
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm install --verbose
COPY . .
RUN cd ./backend && npx prisma generate
EXPOSE 3000 3001
CMD [ "sh" , "-c", "npm run dev" ]