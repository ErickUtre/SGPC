FROM node:20-alpine

# Instalar LibreOffice para conversión de documentos (DOCX -> PDF)
RUN apk add --no-cache libreoffice openjdk8-jre-base ttf-droid ttf-freefont ttf-liberation ttf-dejavu

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
