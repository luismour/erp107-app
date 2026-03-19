import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 A iniciar o povoamento estratégico da Base de Dados...')

  // 1. Limpar a base de dados
  console.log('🧹 A limpar dados antigos...')
  await prisma.fee.deleteMany()
  await prisma.fundTransaction.deleteMany()
  await prisma.guardian.deleteMany()
  await prisma.youth.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.inventoryItem.deleteMany()

  // 2. CRIAR O ADMINISTRADOR
  console.log('🔒 A configurar a Tesouraria...')
  const hashedPassword = await bcrypt.hash("123456", 10)
  await prisma.user.upsert({
    where: { email: 'admin@107.com' },
    update: { password: hashedPassword },
    create: { name: 'Tesouraria Padre Roma', email: 'admin@107.com', password: hashedPassword },
  })

  // 3. DADOS DOS JOVENS (Com lógicas específicas para testes)
  console.log('👥 A cadastrar jovens (incluindo irmãos para testar descontos)...')
  
  const youthsData = [
    // === FAMÍLIA SILVA (IRMAOS = DESCONTO) ===
    { name: 'Lucas Silva', age: 8, branch: 'Lobinho', guardian: 'Maria Silva', phone: '81999990001' },
    { name: 'Mateus Silva', age: 13, branch: 'Escoteiro', guardian: 'Maria Silva', phone: '81999990001' },
    
    // === FAMÍLIA OLIVEIRA (IRMAOS = DESCONTO) ===
    { name: 'Sofia Oliveira', age: 9, branch: 'Lobinho', guardian: 'João Oliveira', phone: '81999990002' },
    { name: 'Beatriz Oliveira', age: 16, branch: 'Sênior', guardian: 'João Oliveira', phone: '81999990002' },

    // === JOVEM PARA TESTAR O BLOQUEIO DE MENSALIDADE ===
    { name: 'Arthur Mendes', age: 11, branch: 'Escoteiro', guardian: 'Juliana Mendes', phone: '81999990008' }, // Este terá dívidas propositadas!

    // === OUTROS JOVENS (Filhos únicos = Sem desconto) ===
    { name: 'Pedro Henrique', age: 7, branch: 'Lobinho', guardian: 'Ana Luiza', phone: '81999990003' },
    { name: 'Laura Beatriz', age: 10, branch: 'Lobinho', guardian: 'Carlos Roberto', phone: '81999990004' },
    { name: 'Gabriel Costa', age: 12, branch: 'Escoteiro', guardian: 'Paula Costa', phone: '81999990006' },
    { name: 'Mariana Lima', age: 13, branch: 'Escoteiro', guardian: 'Roberto Lima', phone: '81999990007' },
    { name: 'João Victor', age: 12, branch: 'Escoteiro', guardian: 'Sandra Victor', phone: '81999990010' },
    { name: 'Felipe Almeida', age: 16, branch: 'Sênior', guardian: 'Marcos Almeida', phone: '81999990011' },
    { name: 'Letícia Carvalho', age: 15, branch: 'Sênior', guardian: 'Tatiana Carvalho', phone: '81999990012' },
    { name: 'Tiago Monteiro', age: 15, branch: 'Sênior', guardian: 'Rafael Monteiro', phone: '81999990015' },
    { name: 'Rafael Cardoso', age: 19, branch: 'Pioneiro', guardian: 'Marta Cardoso', phone: '81999990016' },
    { name: 'Amanda Castro', age: 20, branch: 'Pioneiro', guardian: 'Cláudio Castro', phone: '81999990017' },
    { name: 'Leonardo Neves', age: 18, branch: 'Pioneiro', guardian: 'Silvia Neves', phone: '81999990018' },
    { name: 'Juliana Freitas', age: 21, branch: 'Pioneiro', guardian: 'Fábio Freitas', phone: '81999990019' },
    { name: 'Marcos Vinícius', age: 19, branch: 'Pioneiro', guardian: 'Renata Vinícius', phone: '81999990020' },
  ]

  // Contar ocorrências de cada telefone para saber quem tem irmãos
  const phoneCounts = youthsData.reduce((acc, curr) => {
    acc[curr.phone] = (acc[curr.phone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  for (const y of youthsData) {
    // 1. Criar o Jovem
    const youth = await prisma.youth.create({
      data: {
        name: y.name,
        age: y.age,
        branch: y.branch,
        guardians: { create: { name: y.guardian, phone: y.phone } }
      }
    })

    // 2. Lógica de Desconto de Mensalidade
    // Se o telefone do responsável aparece mais de 1 vez, é porque tem irmãos!
    const hasSiblings = phoneCounts[y.phone] > 1;
    const feeAmount = hasSiblings ? 15.00 : 20.00; // 40 reais para irmãos, 50 para filho único

    // 3. Gerar 6 meses de Histórico
    for (let i = 0; i < 6; i++) {
      let calcMonth = currentMonth - i
      let calcYear = currentYear
      
      if (calcMonth <= 0) {
        calcMonth += 12
        calcYear -= 1
      }

      let status = 'paid'
      
      // === REGRA PARA O ARTHUR MENDES (TESTE DE BLOQUEIO) ===
      if (y.name === 'Arthur Mendes') {
        if (i === 2) status = 'overdue' // 2 meses atrás: Atrasado
        else if (i === 1) status = 'pending' // Mês passado: Pendente
        else if (i === 0) status = 'pending' // Mês atual: Pendente
        else status = 'paid' // O resto para trás está pago
      } 

      else {
        if (i === 1) status = Math.random() > 0.8 ? 'overdue' : 'paid' 
        if (i === 0) status = Math.random() > 0.5 ? 'pending' : 'paid' 
      }

      const dueDate = new Date(calcYear, calcMonth - 1, 10)

      await prisma.fee.create({
        data: {
          youthId: youth.id, 
          month: calcMonth, 
          year: calcYear,
          amount: feeAmount, // Aplica o valor com ou sem desconto
          status: status, 
          dueDate: dueDate
        }
      })
    }

    // 4. Caixa Individual
    await prisma.fundTransaction.create({
      data: {
        youthId: youth.id, 
        amount: Math.floor(Math.random() * 80) + 20,
        description: 'Venda de Rifas', 
        type: 'credit'
      }
    })
  }

  // 4. DESPESAS E ALMOXARIFADO (Rápido)
  console.log('📦 A gerar Despesas e Almoxarifado...')
  await prisma.expense.createMany({
    data: [
      { description: 'Conta de Energia', amount: 125.40, category: 'Sede', date: new Date() },
      { description: 'Material de Limpeza', amount: 65.00, category: 'Sede', date: new Date() },
    ]
  })

  await prisma.inventoryItem.createMany({
    data: [
      { name: 'Barraca Igloo 4 Pessoas', category: 'Acampamento', condition: 'BOM', quantity: 4, borrowed: 1, owner: 'Patrulha Touro', location: 'Armário 1' },
      { name: 'Lona Preta 4x4m', category: 'Acampamento', condition: 'NOVO', quantity: 5, borrowed: 0, owner: '', location: 'Armário 1' },
      { name: 'Panela de Ferro G', category: 'Cozinha', condition: 'MANUTENCAO', quantity: 3, borrowed: 0, owner: '', location: 'Cozinha da Sede' },
    ]
  })

  console.log('🌲 Seed finalizado! Pode testar as lógicas agora!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })