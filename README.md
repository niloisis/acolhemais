# Documentação do projeto

REFS:
- SHADCN -> https://ui.shadcn.com/docs/components/separator
- TAILWINDCSS -> https://v2.tailwindcss.com/docs

## Para rodar o APP
```
docker compose up -d
docker exec -it acolhemais sh -c "cd ./backend && npx prisma migrate deploy"
```
Para visualizar os logs, você pode ver diretamente pelo Docker Desktop, ou execute este comando
```
docker logs -f acolhemais
```
Caso precise entrar no container por algum motivo (Não esqueça que suas alterações lá não refletem no projeto, isso inclui as migrations)
```
docker exec -it acolhemais sh
```
"sh" te fará conectar com linha de comando, mas você pode apenas enviar um comando para o container substituindo o sh por algo como "echo 'helloworld'"



# Ambiente de Desenvolvimento

Este guia descreve os passos necessários para configurar e executar o projeto em seu ambiente de desenvolvimento local.

## Pré-requisitos

Antes de começar, garanta que você tenha as seguintes ferramentas instaladas:

  * [Docker](https://www.docker.com/get-started) e [Docker Compose](https://docs.docker.com/compose/install/)
  * [Node.js](https://nodejs.org/en/) (que inclui o npm)

## Passos para Configuração

Siga as etapas abaixo para configurar o ambiente completo.

### 1\. Iniciar os Serviços de Infraestrutura

Inicie todos os serviços de background (como o banco de dados e o Minio) definidos no Docker:

```bash
docker compose up -d
```

### 2\. Configurar o Minio (Storage S3)

O Minio é usado para simular o S3 (armazenamento de arquivos). Você precisa gerar chaves de acesso para a aplicação:

1.  Acesse o painel do Minio em seu navegador: `http://localhost:9003`.
2.  Faça login com as credenciais (`MINIO_ROOT_USER` e `MINIO_ROOT_PASSWORD`) definidas no seu arquivo `docker-compose.yml`.
3.  No painel, navegue até a seção de "Access Keys" (Chaves de Acesso) e clique em "Create access key".
4.  Copie o **Access Key** e o **Secret Key** gerados.

### 3\. Configurar Variáveis de Ambiente (.env)

1.  Crie um arquivo `.env` na raiz do projeto, copiando o arquivo `.env.example` como base:

    ```bash
    cp .env.example .env
    ```

2.  Abra o arquivo `.env` e cole as chaves do Minio que você acabou de gerar nas variáveis correspondentes (ex: `MINIO_ACCESS_KEY` e `MINIO_SECRET_KEY`).

3.  Revise as outras variáveis (como a `DATABASE_URL`) para garantir que correspondam à configuração do seu `docker-compose.yml`.

### 4\. Instalar Dependências (Node.js)

Instale todas as dependências do projeto. O comando deve ser executado nos três diretórios (raiz, backend e frontend) para garantir que todos os pacotes sejam instalados corretamente.

```bash
# 1. Na raiz do projeto
npm install --legacy-peer-deps

# 2. No backend
cd backend
npm install --legacy-peer-deps
cd ..

# 3. No frontend
cd frontend
npm install --legacy-peer-deps
cd ..
```

*(Nota: O uso de `--legacy-peer-deps` é necessário para resolver conflitos de versão de dependências específicos deste projeto.)*

### 5\. Configurar o Banco de Dados (Prisma)

Após instalar as dependências, você precisa preparar o banco de dados:

1.  Navegue até o diretório do backend:

    ```bash
    cd backend
    ```

2.  Gere o cliente Prisma com base no seu `schema.prisma`:

    ```bash
    npx prisma generate
    ```

3.  Aplique as migrações para criar as tabelas no banco de dados:

    ```bash
    npx prisma migrate deploy
    ```

## Rodando a Aplicação

Após a configuração estar completa, volte para o diretório raiz e inicie a aplicação em modo de desenvolvimento:

```bash
# Certifique-se de estar na raiz do projeto (use 'cd ..' se estiver em /backend)
npm run dev
```
