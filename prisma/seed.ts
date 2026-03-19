import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

// 1. Carrega as variáveis de ambiente (o seu DATABASE_URL)
dotenv.config()

// 2. Configura a ligação com o PostgreSQL usando o Adaptador
const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// 3. Inicializa o Prisma COM o adaptador (Isto resolve o erro!)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 A iniciar o povoamento da Base de Dados...')

  // Limpar a base de dados
  console.log('🧹 A limpar dados antigos para evitar duplicados...')
  await prisma.fee.deleteMany()
  await prisma.fundTransaction.deleteMany()
  await prisma.guardian.deleteMany()
  await prisma.youth.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.inventoryItem.deleteMany()

  // CRIAR O ADMINISTRADOR
  console.log('🔒 A criar a conta da Tesouraria...')
  const hashedPassword = await bcrypt.hash("123456", 10)
  
  await prisma.user.upsert({
    where: { email: 'admin@107.com' },
    update: { password: hashedPassword },
    create: {
      name: 'Tesouraria Padre Roma',
      email: 'admin@107.com',
      password: hashedPassword,
    },
  })

  // DADOS DOS JOVENS
  console.log('👥 A cadastrar 20 jovens e responsáveis...')
  const youthsData = [
    { name: 'Lucas Miguel Silva', age: 8, branch: 'Lobinho', guardian: 'Maria Silva', phone: '81999990001' },
    { name: 'Sofia Oliveira', age: 9, branch: 'Lobinho', guardian: 'João Oliveira', phone: '81999990002' },
    { name: 'Pedro Henrique', age: 7, branch: 'Lobinho', guardian: 'Ana Luiza', phone: '81999990003' },
    { name: 'Laura Beatriz', age: 10, branch: 'Lobinho', guardian: 'Carlos Roberto', phone: '81999990004' },
    { name: 'Matheus Santos', age: 9, branch: 'Lobinho', guardian: 'Fernanda Santos', phone: '81999990005' },
    
    { name: 'Gabriel Costa', age: 12, branch: 'Escoteiro', guardian: 'Paula Costa', phone: '81999990006' },
    { name: 'Mariana Lima', age: 13, branch: 'Escoteiro', guardian: 'Roberto Lima', phone: '81999990007' },
    { name: 'Arthur Mendes', age: 11, branch: 'Escoteiro', guardian: 'Juliana Mendes', phone: '81999990008' },
    { name: 'Beatriz Rocha', age: 14, branch: 'Escoteiro', guardian: 'Ricardo Rocha', phone: '81999990009' },
    { name: 'João Victor', age: 12, branch: 'Escoteiro', guardian: 'Sandra Victor', phone: '81999990010' },

    { name: 'Felipe Almeida', age: 16, branch: 'Sênior', guardian: 'Marcos Almeida', phone: '81999990011' },
    { name: 'Letícia Carvalho', age: 15, branch: 'Sênior', guardian: 'Tatiana Carvalho', phone: '81999990012' },
    { name: 'Gustavo Araújo', age: 17, branch: 'Sênior', guardian: 'Eduardo Araújo', phone: '81999990013' },
    { name: 'Camila Ribeiro', age: 16, branch: 'Sênior', guardian: 'Sônia Ribeiro', phone: '81999990014' },
    { name: 'Tiago Monteiro', age: 15, branch: 'Sênior', guardian: 'Rafael Monteiro', phone: '81999990015' },

    { name: 'Rafael Cardoso', age: 19, branch: 'Pioneiro', guardian: 'Marta Cardoso', phone: '81999990016' },
    { name: 'Amanda Castro', age: 20, branch: 'Pioneiro', guardian: 'Cláudio Castro', phone: '81999990017' },
    { name: 'Leonardo Neves', age: 18, branch: 'Pioneiro', guardian: 'Silvia Neves', phone: '81999990018' },
    { name: 'Juliana Freitas', age: 21, branch: 'Pioneiro', guardian: 'Fábio Freitas', phone: '81999990019' },
    { name: 'Marcos Vinícius', age: 19, branch: 'Pioneiro', guardian: 'Renata Vinícius', phone: '81999990020' },
  ]

  for (const y of youthsData) {
    const youth = await prisma.youth.create({
      data: {
        name: y.name,
        age: y.age,
        branch: y.branch,
        guardians: { create: { name: y.guardian, phone: y.phone } }
      }
    })

    // MENSALIDADES (Histórico de 6 meses)
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    for (let i = 0; i < 6; i++) {
      let calcMonth = currentMonth - i
      let calcYear = currentYear
      
      if (calcMonth <= 0) {
        calcMonth += 12
        calcYear -= 1
      }

      const isLastMonth = i === 1 
      const isCurrentMonth = i === 0 

      let status = 'paid' 
      if (isLastMonth) status = Math.random() > 0.7 ? 'overdue' : 'paid' 
      if (isCurrentMonth) status = Math.random() > 0.4 ? 'pending' : 'paid' 

      const dueDate = new Date(calcYear, calcMonth - 1, 10)

      await prisma.fee.create({
        data: {
          youthId: youth.id, month: calcMonth, year: calcYear,
          amount: 20.00, status: status, dueDate: dueDate
        }
      })
    }

    // CAIXA INDIVIDUAL
    await prisma.fundTransaction.create({
      data: {
        youthId: youth.id, amount: Math.floor(Math.random() * 100) + 50,
        description: 'Venda de Rifas de Páscoa', type: 'credit'
      }
    })

    if (Math.random() > 0.3) {
      await prisma.fundTransaction.create({
        data: {
          youthId: youth.id, amount: 45.00,
          description: 'Acampamento Regional', type: 'debit'
        }
      })
    }
  }

  // DESPESAS DO GRUPO
  console.log('📉 A registar Despesas Gerais...')
  await prisma.expense.createMany({
    data: [
      { description: 'Conta de Energia (CELPE)', amount: 125.40, category: 'Sede', date: new Date() },
      { description: 'Conta de Água (COMPESA)', amount: 65.00, category: 'Sede', date: new Date() },
      { description: 'Compra de 3 Lampiões', amount: 350.00, category: 'Equipamentos', date: new Date(new Date().setDate(new Date().getDate() - 10)) },
      { description: 'Papel Chamex e Tintas', amount: 89.90, category: 'Secretaria', date: new Date(new Date().setDate(new Date().getDate() - 15)) },
      { description: 'Tintas para o Muro', amount: 150.00, category: 'Manutenção', date: new Date(new Date().setDate(new Date().getDate() - 20)) },
    ]
  })

  // ALMOXARIFADO
  console.log('📦 A preencher as prateleiras do Almoxarifado...')
  await prisma.inventoryItem.createMany({
    data: [
      { name: 'Barraca Igloo 4 Pessoas', category: 'Acampamento', condition: 'BOM', quantity: 4, borrowed: 1, owner: 'Patrulha Touro', location: 'Armário 1', description: 'Barracas azuis da Nautika' },
      { name: 'Barraca Canadense 6 Pessoas', category: 'Acampamento', condition: 'MANUTENCAO', quantity: 2, borrowed: 0, owner: '', location: 'Sótão', description: 'Falta lona de cima' },
      { name: 'Lona Preta 4x4m', category: 'Acampamento', condition: 'NOVO', quantity: 5, borrowed: 2, owner: 'Patrulha Águia, Chefia', location: 'Armário 1' },
      { name: 'Saco de Dormir', category: 'Acampamento', condition: 'BOM', quantity: 10, borrowed: 0, owner: '', location: 'Armário 2' },
      { name: 'Panela de Ferro G', category: 'Cozinha', condition: 'BOM', quantity: 3, borrowed: 1, owner: 'Patrulha Leão', location: 'Cozinha da Sede' },
      { name: 'Botijão de Gás P13', category: 'Cozinha', condition: 'NOVO', quantity: 2, borrowed: 0, owner: '', location: 'Cozinha da Sede' },
      { name: 'Fogareiro 2 Bocas', category: 'Cozinha', condition: 'BOM', quantity: 2, borrowed: 2, owner: 'Patrulha Touro, Patrulha Águia', location: 'Armário 3' },
      { name: 'Machadinha', category: 'Ferramentas', condition: 'MANUTENCAO', quantity: 4, borrowed: 0, owner: '', location: 'Caixa de Ferramentas', description: 'Duas precisam de amolar' },
      { name: 'Corda Sisal (Rolo 50m)', category: 'Ferramentas', condition: 'NOVO', quantity: 8, borrowed: 3, owner: 'Tropa Escoteira', location: 'Prateleira A' },
      { name: 'Pá de Bico', category: 'Ferramentas', condition: 'BOM', quantity: 3, borrowed: 0, owner: '', location: 'Quintal' },
      { name: 'Facão', category: 'Ferramentas', condition: 'BOM', quantity: 5, borrowed: 1, owner: 'Tropa Sênior', location: 'Caixa de Ferramentas' },
      { name: 'Bandeira do Brasil', category: 'Secretaria', condition: 'BOM', quantity: 1, borrowed: 0, owner: '', location: 'Mastro Principal' },
      { name: 'Caixa de Som JBL', category: 'Outros', condition: 'NOVO', quantity: 1, borrowed: 1, owner: 'Chefe Marcos', location: 'Secretaria' },
      { name: 'Kits de Primeiros Socorros', category: 'Outros', condition: 'BOM', quantity: 4, borrowed: 2, owner: 'Tropa Escoteira, Alcatéia', location: 'Armário de Saúde' },
    ]
  })

  console.log('🌲 Seed finalizado com sucesso! Tudo pronto no Grupo Escoteiro 107!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect() // Certifica de fechar as ligações da Pool!
  })