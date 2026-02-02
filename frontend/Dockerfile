FROM nginx:alpine

# Copiar el HTML al directorio de nginx
COPY web.html /usr/share/nginx/html/index.html

# Copiar configuración de nginx para CORS
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
