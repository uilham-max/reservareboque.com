#!/bin/bash
echo "Iniciando container com Docker..."

echo "removendo container (reboquesoliveira)..."
docker rm -f reboquesoliveira

echo "docker run --rm -v .:/app -p 3000:3000 reboquesoliveira"
docker run --name=reboquesoliveira -v .:/app -p 3000:3000 reboquesoliveira