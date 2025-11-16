# Gunakan Node versi terbaru stabil
FROM node:18-alpine

# Membuat folder kerja
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua file project
COPY . .

# Expose port default Render
EXPOSE 3000

# Jalankan server
CMD ["npm", "start"]
