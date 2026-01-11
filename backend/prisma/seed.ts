import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando o seed...')

  // 1. NECESSIDADES (CAUSAS)
  const necessidades = [
    "🍞 Alimentos",
    "🚿 Higiene",
    "📚 Educação",
    "🏥 Saúde",
    "🧠 Saúde Mental",
    "🤝 Comunidade",
    "🌱 Meio Ambiente",
    "🎨 Arte e Lazer",
    "⚧️ Igualdade de Gênero",
    "🧑‍⚖️ Direitos e Justiça",
    "🚨 Emergências",
    "💼 Emprego"
  ];

  for (const tipo of necessidades) {
    await prisma.necessidade.upsert({
      where: { tipo },
      update: {},
      create: { tipo },
    })
  }

  // 2. PÚBLICO ALVO
  const publicoAlvo = [
    "👨‍👩‍👧‍👦 Todas as idades",
    "🧒 Crianças",
    "🧑‍🎓 Adolescentes",
    "🧑 Adultos",
    "👵 Idosos",
    "♀️ Mulheres",
    "🏳️‍🌈 LGBTQIA+",
    "✊🏿 População negra",
    "🌿 População Indígena",
    "♿ Pessoas com Deficiência",
    "🧩 Neurodivergentes"
  ];

  for (const tipo of publicoAlvo) {
    await prisma.publicoAlvo.upsert({
      where: { tipo },
      update: {},
      create: { tipo },
    })
  }

  // 3. TIPOS DE CONTATO
  const tiposContato = ["Instagram", "WhatsApp", "Facebook", "Site", "Email", "Telefone"];

  for (const tipo of tiposContato) {
    await prisma.tipoContato.upsert({
      where: { tipo },
      update: {},
      create: { tipo },
    })
  }

  // 4. BAIRROS DO RECIFE (Com Lat/Lon reais)
  // Dados aproximados do centro de cada bairro
  const bairros = [
    { nome: "Recife Antigo", lat: -8.063169, lon: -34.871139 },
    { nome: "Boa Viagem", lat: -8.1122, lon: -34.8942 },
    { nome: "Pina", lat: -8.0963, lon: -34.8864 },
    { nome: "Várzea", lat: -8.0370, lon: -34.9570 },
    { nome: "Caxangá", lat: -8.0311, lon: -34.9654 },
    { nome: "Casa Forte", lat: -8.0346, lon: -34.9197 },
    { nome: "Casa Amarela", lat: -8.0244, lon: -34.9125 },
    { nome: "Apipucos", lat: -8.0205, lon: -34.9358 },
    { nome: "Espinheiro", lat: -8.0438, lon: -34.8931 },
    { nome: "Aflitos", lat: -8.0433, lon: -34.8980 },
    { nome: "Graças", lat: -8.0468, lon: -34.9015 },
    { nome: "Derby", lat: -8.0569, lon: -34.8997 },
    { nome: "Madalena", lat: -8.0526, lon: -34.9103 },
    { nome: "Torre", lat: -8.0454, lon: -34.9150 },
    { nome: "Cordeiro", lat: -8.0537, lon: -34.9298 },
    { nome: "Iputinga", lat: -8.0392, lon: -34.9387 },
    { nome: "Santo Amaro", lat: -8.0489, lon: -34.8819 },
    { nome: "Boa Vista", lat: -8.0583, lon: -34.8879 },
    { nome: "Encruzilhada", lat: -8.0335, lon: -34.8967 },
    { nome: "Rosarinho", lat: -8.0318, lon: -34.8991 },
    { nome: "Tamarineira", lat: -8.0287, lon: -34.9042 },
    { nome: "Jaqueira", lat: -8.0357, lon: -34.9048 },
    { nome: "Campo Grande", lat: -8.0249, lon: -34.8845 },
    { nome: "Arruda", lat: -8.0202, lon: -34.8906 },
    { nome: "Bomba do Hemetério", lat: -8.0260, lon: -34.9080 },
    { nome: "Beberibe", lat: -8.0068, lon: -34.8974 },
    { nome: "Dois Irmãos", lat: -8.0175, lon: -34.9458 },
    { nome: "Imbiribeira", lat: -8.1065, lon: -34.9101 },
    { nome: "Ipsep", lat: -8.1132, lon: -34.9248 },
    { nome: "Ibura", lat: -8.1287, lon: -34.9431 },
    { nome: "Afogados", lat: -8.0772, lon: -34.9095 },
    { nome: "San Martin", lat: -8.0694, lon: -34.9302 }

  ];

  for (const bairro of bairros) {
    await prisma.bairro.upsert({
      where: { nome: bairro.nome },
      update: {
          lat: bairro.lat,
          lon: bairro.lon
      },
      create: {
        nome: bairro.nome,
        lat: bairro.lat,
        lon: bairro.lon,
        cidade: "Recife",
        estado: "PE"
      },
    })
  }

  console.log('✅ Seed finalizado com sucesso!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })