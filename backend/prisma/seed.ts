import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Lista oficial de bairros do Recife
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
]

async function main() {
  console.log('🌱 Iniciando seed dos bairros de Recife...')

  for (const bairro of bairrosRecife) {
    await prisma.bairro.upsert({
      where: { nome: bairro },
      update: {}, // Se já existir, não faz nada
      create: {
        nome: bairro,
        cidade: "Recife",
        estado: "PE"
      },
    })
  }

  console.log('✅ Bairros populados com sucesso!')
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