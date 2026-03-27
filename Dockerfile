# 1. Usamos una versión ligera de Node.js basada en Linux (Alpine)
FROM node:20-alpine

# 2. Creamos una carpeta llamada 'app' dentro del contenedor y nos metemos en ella
WORKDIR /app

# 3. Copiamos los archivos package.json y package-lock.json a esa carpeta
COPY package*.json ./

# 4. Instalamos las dependencias de NestJS dentro del contenedor
RUN npm install

# 5. Copiamos el resto de tu código (la carpeta src, tsconfig, etc.)
COPY . .

# 6. Le decimos al contenedor que va a comunicarse por el puerto 3000
EXPOSE 3000

# 7. El comando final para encender el servidor cuando el contenedor arranque
CMD ["npm", "run", "start:dev"]