FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar los archivos de configuración primero
COPY package*.json ./

# Instalar dependencias (incluye devDependencies)
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 5000

# Usar nodemon para recarga en caliente
CMD ["npm", "run", "dev"]
