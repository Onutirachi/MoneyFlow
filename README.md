# Finanças Pessoais

Sistema de gerenciamento financeiro pessoal: contas com métodos de pagamento, movimentos de entrada e saída, parcelamento automático, custos fixos mensais e um dashboard com comparação entre meses.

## Projetos
- [`backend/`](backend/): API mock em Node + Express + TypeScript (dados em `backend/data/db.json`)
- [`frontend/`](frontend/): Vite + React + TypeScript

## Como rodar
Requisitos: Node 20 ou superior.

```bash
# terminal 1
cd backend
npm install
npm run seed      # cria dados de demonstração
npm run dev       # http://localhost:3333

# terminal 2
cd frontend
npm install
npm run dev       # http://localhost:5173
```

Login de demonstração: **demo@demo.com** / **123456**

## Documentação
Toda a documentação do projeto, com padrões, contrato da API, regras de negócio, diário de etapas e decisões, está em [`docs/`](docs/README.md).
