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

  // 4. BAIRROS DO RECIFE
  // Dados aproximados do centro de cada bairro
  const bairros = [
    // Centro (RPA 1)
    { nome: "Recife Antigo", lat: -8.0631, lon: -34.8711 },
    { nome: "Santo Antônio", lat: -8.0670, lon: -34.8770 },
    { nome: "São José", lat: -8.0720, lon: -34.8810 },
    { nome: "Boa Vista", lat: -8.0583, lon: -34.8879 },
    { nome: "Santo Amaro", lat: -8.0489, lon: -34.8819 },
    { nome: "Cabanga", lat: -8.0820, lon: -34.8900 },
    { nome: "Ilha do Leite", lat: -8.0650, lon: -34.8930 },
    { nome: "Paissandu", lat: -8.0680, lon: -34.8950 },
    { nome: "Coelhos", lat: -8.0685, lon: -34.8990 },
    { nome: "Ilha Joana Bezerra", lat: -8.0750, lon: -34.8950 },
    { nome: "Soledade", lat: -8.0560, lon: -34.8950 },

    // Zona Norte (RPA 2 e 3)
    { nome: "Arruda", lat: -8.0202, lon: -34.8906 },
    { nome: "Campina do Barreto", lat: -8.0150, lon: -34.8850 },
    { nome: "Campo Grande", lat: -8.0249, lon: -34.8845 },
    { nome: "Encruzilhada", lat: -8.0335, lon: -34.8967 },
    { nome: "Hipódromo", lat: -8.0280, lon: -34.8920 },
    { nome: "Peixinhos", lat: -8.0120, lon: -34.8800 },
    { nome: "Ponto de Parada", lat: -8.0250, lon: -34.8950 },
    { nome: "Rosarinho", lat: -8.0318, lon: -34.8991 },
    { nome: "Torreão", lat: -8.0380, lon: -34.8880 },
    { nome: "Água Fria", lat: -8.0100, lon: -34.8950 },
    { nome: "Alta de Santa Terezinha", lat: -8.0050, lon: -34.9000 },
    { nome: "Bomba do Hemetério", lat: -8.0260, lon: -34.9080 },
    { nome: "Cajueiro", lat: -8.0100, lon: -34.8900 },
    { nome: "Fundão", lat: -8.0080, lon: -34.8920 },
    { nome: "Porto da Madeira", lat: -8.0150, lon: -34.8880 },
    { nome: "Beberibe", lat: -8.0068, lon: -34.8974 },
    { nome: "Dois Unidos", lat: -7.9980, lon: -34.9050 },
    { nome: "Linha do Tiro", lat: -8.0050, lon: -34.9100 },
    { nome: "Aflitos", lat: -8.0433, lon: -34.8980 },
    { nome: "Apipucos", lat: -8.0205, lon: -34.9358 },
    { nome: "Casa Amarela", lat: -8.0244, lon: -34.9125 },
    { nome: "Casa Forte", lat: -8.0346, lon: -34.9197 },
    { nome: "Derby", lat: -8.0569, lon: -34.8997 },
    { nome: "Dois Irmãos", lat: -8.0175, lon: -34.9458 },
    { nome: "Espinheiro", lat: -8.0438, lon: -34.8931 },
    { nome: "Graças", lat: -8.0468, lon: -34.9015 },
    { nome: "Jaqueira", lat: -8.0357, lon: -34.9048 },
    { nome: "Monteiro", lat: -8.0250, lon: -34.9250 },
    { nome: "Parnamirim", lat: -8.0350, lon: -34.9100 },
    { nome: "Poço da Panela", lat: -8.0300, lon: -34.9200 },
    { nome: "Santana", lat: -8.0380, lon: -34.9250 },
    { nome: "Sítio dos Pintos", lat: -8.0100, lon: -34.9500 },
    { nome: "Tamarineira", lat: -8.0287, lon: -34.9042 },
    { nome: "Alto do Mandu", lat: -8.0180, lon: -34.9200 },
    { nome: "Alto José Bonifácio", lat: -8.0150, lon: -34.9150 },
    { nome: "Alto José do Pinho", lat: -8.0180, lon: -34.9100 },
    { nome: "Mangabeira", lat: -8.0220, lon: -34.9050 },
    { nome: "Morro da Conceição", lat: -8.0200, lon: -34.9120 },
    { nome: "Vasco da Gama", lat: -8.0150, lon: -34.9250 },
    { nome: "Brejo da Guabiraba", lat: -7.9950, lon: -34.9300 },
    { nome: "Brejo de Beberibe", lat: -8.0000, lon: -34.9150 },
    { nome: "Córrego do Jenipapo", lat: -7.9900, lon: -34.9350 },
    { nome: "Guabiraba", lat: -7.9850, lon: -34.9400 },
    { nome: "Macaxeira", lat: -8.0050, lon: -34.9250 },
    { nome: "Nova Descoberta", lat: -8.0000, lon: -34.9250 },
    { nome: "Passarinho", lat: -7.9800, lon: -34.9250 },
    { nome: "Pau Ferro", lat: -7.9900, lon: -34.9500 },

    // Zona Oeste (RPA 4)
    { nome: "Caxangá", lat: -8.0311, lon: -34.9654 },
    { nome: "Cidade Universitária", lat: -8.0500, lon: -34.9500 },
    { nome: "Cordeiro", lat: -8.0537, lon: -34.9298 },
    { nome: "Engenho do Meio", lat: -8.0500, lon: -34.9350 },
    { nome: "Ilha do Retiro", lat: -8.0600, lon: -34.9050 },
    { nome: "Iputinga", lat: -8.0392, lon: -34.9387 },
    { nome: "Madalena", lat: -8.0526, lon: -34.9103 },
    { nome: "Prado", lat: -8.0650, lon: -34.9100 },
    { nome: "Torre", lat: -8.0454, lon: -34.9150 },
    { nome: "Torrões", lat: -8.0600, lon: -34.9250 },
    { nome: "Várzea", lat: -8.0370, lon: -34.9570 },
    { nome: "Zumbi", lat: -8.0550, lon: -34.9150 },

    // Zona Sudoeste (RPA 5)
    { nome: "Afogados", lat: -8.0772, lon: -34.9095 },
    { nome: "Areias", lat: -8.0900, lon: -34.9300 },
    { nome: "Barro", lat: -8.0950, lon: -34.9450 },
    { nome: "Bongi", lat: -8.0750, lon: -34.9150 },
    { nome: "Caçote", lat: -8.0950, lon: -34.9350 },
    { nome: "Coqueiral", lat: -8.0850, lon: -34.9600 },
    { nome: "Curado", lat: -8.0700, lon: -34.9600 },
    { nome: "Estância", lat: -8.0850, lon: -34.9350 },
    { nome: "Jardim São Paulo", lat: -8.0800, lon: -34.9400 },
    { nome: "Jiquiá", lat: -8.0850, lon: -34.9250 },
    { nome: "Mangueira", lat: -8.0750, lon: -34.9050 },
    { nome: "Mustardinha", lat: -8.0750, lon: -34.9200 },
    { nome: "San Martin", lat: -8.0694, lon: -34.9302 },
    { nome: "Sancho", lat: -8.0850, lon: -34.9500 },
    { nome: "Tejipió", lat: -8.0900, lon: -34.9550 },
    { nome: "Totó", lat: -8.0950, lon: -34.9600 },

    // Zona Sul (RPA 6)
    { nome: "Boa Viagem", lat: -8.1122, lon: -34.8942 },
    { nome: "Brasília Teimosa", lat: -8.0880, lon: -34.8820 },
    { nome: "Imbiribeira", lat: -8.1065, lon: -34.9101 },
    { nome: "Ipsep", lat: -8.1132, lon: -34.9248 },
    { nome: "Pina", lat: -8.0963, lon: -34.8864 },
    { nome: "Ibura", lat: -8.1287, lon: -34.9431 },
    { nome: "Jordão", lat: -8.1350, lon: -34.9300 },
    { nome: "Cohab", lat: -8.1300, lon: -34.9500 }
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