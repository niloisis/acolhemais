import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// --- 1. LISTAS DE DADOS ---

// Bairros do Recife
const bairrosRecife = [
  "Aflitos", "Afogados", "Água Fria", "Alto do Mandu", "Alto José do Pinho", 
  "Alto José Bonifácio", "Alto Santa Terezinha", "Apipucos", "Areias", "Arruda", 
  "Barro", "Beberibe", "Benfica", "Boa Viagem", "Boa Vista", "Bomba do Hemetério", 
  "Bongi", "Brasília Teimosa", "Brejo da Guabiraba", "Brejo de Beberibe", 
  "Cabanga", "Caçote", "Cajueiro", "Campina do Barreto", "Campo Grande", 
  "Casa Amarela", "Casa Forte", "Caxangá", "Cidade Universitária", "Coelhos", 
  "Cohab", "Coqueiral", "Cordeiro", "Curado", "Derby", "Dois Irmãos", 
  "Dois Unidos", "Encruzilhada", "Engenho do Meio", "Espinheiro", "Estância", 
  "Fundão", "Graças", "Guabiraba", "Hipódromo", "Ibura", "Ilha do Leite", 
  "Ilha do Retiro", "Ilha Joana Bezerra", "Imbiribeira", "Ipsep", "Iputinga", 
  "Jaqueira", "Jardim São Paulo", "Jiquiá", "Jordão", "Linha do Tiro", 
  "Macaxeira", "Madalena", "Mangabeira", "Mangueira", "Manguinhos", 
  "Monteiro", "Morro da Conceição", "Mustardinha", "Nova Descoberta", "Paissandu", 
  "Parnamirim", "Passarinho", "Pau Ferro", "Peixinhos", "Pina", "Poço da Panela", 
  "Ponto de Parada", "Porto da Madeira", "Prado", "Recife (Bairro do Recife)", 
  "Rosarinho", "San Martin", "Sancti Spiritus", "Santana", "Santo Amaro", 
  "Santo Antônio", "São José", "Sítio dos Pintos", "Soledade", "Tamarineira", 
  "Tejipió", "Torre", "Torreão", "Torrões", "Totó", "Várzea", "Vasco da Gama", 
  "Zumbi"
];

// Causas / Necessidades (Mesma lista do Frontend)
const necessidadesOptions = [
    "Assistência Social", "Educação", "Saúde", "Saúde Mental", 
    "Meio Ambiente", "Combate à Pobreza", "Cultura e Arte", 
    "Igualdade de Gênero", "Direitos Humanos", "Justiça Social", 
    "Esporte e Lazer", "Desenvolvimento Comunitário", "Emergências", "Emprego"
];

// Públicos Alvo (Mesma lista do Frontend)
const publicoAlvoOptions = [
    "Crianças", "Adolescentes", "Adultos", "Idosos", "Homens", 
    "Mulheres", "Animais", "População negra", "População Indígena", 
    "LGBTQIA+", "Pessoas com Deficiência"
];

// --- 2. FUNÇÃO PRINCIPAL ---

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // A. Seed de Bairros
  console.log('📍 Populando Bairros...')
  for (const bairro of bairrosRecife) {
    await prisma.bairro.upsert({
      where: { nome: bairro },
      update: {},
      create: {
        nome: bairro,
        cidade: "Recife",
        estado: "PE"
      },
    })
  }

  // B. Seed de Necessidades (Causas)
  console.log('❤️ Populando Necessidades (Causas)...')
  for (const tipo of necessidadesOptions) {
    // Assumindo que seu model se chama 'Necessidade' e o campo único é 'tipo'
    await prisma.necessidade.upsert({
      where: { tipo: tipo },
      update: {},
      create: { tipo: tipo },
    })
  }

  // C. Seed de Público Alvo
  console.log('👥 Populando Público Alvo...')
  for (const tipo of publicoAlvoOptions) {
    // Assumindo que seu model se chama 'PublicoAlvo' e o campo único é 'tipo'
    await prisma.publicoAlvo.upsert({
      where: { tipo: tipo },
      update: {},
      create: { tipo: tipo },
    })
  }

  console.log('✅ Seed finalizado com sucesso!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })