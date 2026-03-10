const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

// 1. Configurando a conexão do Postgres
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Inicializando o Adapter exigido pelo Prisma
const adapter = new PrismaPg(pool);

// 3. Criando o Prisma Client com o Adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando Seed - 107º Padre Roma...');

  // Limpeza de segurança
  await prisma.fee.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.youth.deleteMany();

  // --- FAMÍLIA 1: SILVA (R$ 15 cada) ---
  const telSilva = "81987665642";
  const silva1 = await prisma.youth.create({
    data: {
      name: "João Matheus Silva", age: 8, branch: "Lobinho",
      guardians: { create: { name: "Maria Luiza Silva", phone: telSilva } }
    }
  });
  const silva2 = await prisma.youth.create({
    data: {
      name: "Ana Clara Silva", age: 10, branch: "Escoteiro",
      guardians: { create: { name: "Maria Luiza Silva", phone: telSilva } }
    }
  });

  // --- FAMÍLIA 2: MOURA (R$ 10 cada) ---
  const telMoura = "81986555681";
  const moura1 = await prisma.youth.create({
    data: {
      name: "Luís Miguel Moura", age: 21, branch: "Pioneiro",
      guardians: { create: { name: "Ricardo Moura", phone: telMoura } }
    }
  });
  const moura2 = await prisma.youth.create({
    data: {
      name: "Pedro Henrique Moura", age: 15, branch: "Sênior",
      guardians: { create: { name: "Ricardo Moura", phone: telMoura } }
    }
  });
  const moura3 = await prisma.youth.create({
    data: {
      name: "Lucas Moura", age: 14, branch: "Escoteiro",
      guardians: { create: { name: "Ricardo Moura", phone: telMoura } }
    }
  });

  // --- FAMÍLIA 3: OLIVEIRA (R$ 20) ---
  const oliveira = await prisma.youth.create({
    data: {
      name: "Beatriz Oliveira", age: 7, branch: "Lobinho",
      guardians: { create: { name: "Carla Oliveira", phone: "81911112222" } }
    }
  });

  const familias = [
    { membros: [silva1, silva2], valor: 15.0 },
    { membros: [moura1, moura2, moura3], valor: 10.0 },
    { membros: [oliveira], valor: 20.0 }
  ];

  console.log('💰 Gerando mensalidades...');

  for (const familia of familias) {
    for (const youth of familia.membros) {
      await prisma.fee.createMany({
        data: [
          {
            youthId: youth.id,
            month: 3,
            year: 2026,
            amount: familia.valor,
            status: "paid",
            dueDate: new Date(2026, 2, 5)
          },
          {
            youthId: youth.id,
            month: 4,
            year: 2026,
            amount: familia.valor,
            status: "pending",
            dueDate: new Date(2026, 3, 5)
          }
        ]
      });
    }
  }

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });