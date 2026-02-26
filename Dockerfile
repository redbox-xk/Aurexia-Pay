# Multi-stage build
FROM golang:1.21-alpine AS go-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /app/build/aurexiad ./consensus/cmd/aurexiad

FROM node:18-alpine AS node-builder
WORKDIR /app
COPY frontend/web/package*.json ./
RUN npm ci
COPY frontend/web ./
RUN npm run build

FROM alpine:latest
RUN apk add --no-cache ca-certificates
COPY --from=go-builder /app/build/aurexiad /usr/local/bin/
COPY --from=node-builder /app/.next /app/.next
COPY --from=node-builder /app/public /app/public
COPY --from=node-builder /app/package.json /app/
EXPOSE 8545 3000
CMD ["aurexiad"]
