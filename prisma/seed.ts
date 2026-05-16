import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  await db.lead.deleteMany({})

  const now = new Date()
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)
  const daysFromNow = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000)

  await db.lead.createMany({
    data: [
      { name: 'Michael Torres', email: 'michael.torres@example.com', phone: '(512) 555-0101', address: '123 Oak Lane, Austin, TX 78701', status: 'LEAD', product: 'Ather Rizta', createdAt: daysAgo(0) },
      { name: 'Jessica Park', email: 'jessica.park@example.com', phone: '(512) 555-0102', address: '456 Elm St, Austin, TX 78702', status: 'LEAD', product: 'TVS iQube', createdAt: daysAgo(1) },
      { name: 'David Chen', email: 'david.chen@example.com', phone: '(512) 555-0103', address: '789 Maple Ave, Austin, TX 78703', status: 'LEAD', product: 'Bajaj Chetak', createdAt: daysAgo(5) },
      { name: 'Sarah Williams', email: 'sarah.w@example.com', phone: '(512) 555-0104', address: '321 Pine Rd, Austin, TX 78704', status: 'NOT_RESPONDING', product: 'Oben Rorr Ez Sigma', createdAt: daysAgo(4) },
      { name: 'Robert Johnson', email: 'robert.j@example.com', phone: '(512) 555-0105', address: '654 Cedar Blvd, Austin, TX 78705', status: 'CALL_BACK', product: 'Ather Rizta', createdAt: daysAgo(3) },
      { name: 'Emily Davis', email: 'emily.d@example.com', phone: '(512) 555-0106', address: '987 Birch Way, Austin, TX 78706', status: 'INTERESTED', product: 'TVS iQube', createdAt: daysAgo(2) },
      { name: 'James Wilson', email: 'james.w@example.com', phone: '(512) 555-0107', address: '147 Walnut St, Austin, TX 78707', status: 'INTERESTED', product: 'Bajaj Chetak', createdAt: daysAgo(6) },
      { name: 'Amanda Brown', email: 'amanda.b@example.com', phone: '(512) 555-0108', address: '258 Ash Ct, Austin, TX 78708', status: 'NOT_INTERESTED', product: 'Ather Rizta', createdAt: daysAgo(8) },
      {
        name: 'Christopher Lee', email: 'chris.lee@example.com', phone: '(512) 555-0109',
        address: '369 Spruce Dr, Austin, TX 78709', status: 'HOME_DEMO_SCHEDULED',
        product: 'Oben Rorr Ez Sigma', demoDate: daysFromNow(2), createdAt: daysAgo(3),
      },
      {
        name: 'Rachel Martinez', email: 'rachel.m@example.com', phone: '(512) 555-0110',
        address: '741 Willow Ln, Austin, TX 78710', status: 'HOME_DEMO_COMPLETED',
        product: 'TVS iQube', demoDate: daysAgo(1), createdAt: daysAgo(7),
      },
      { name: 'Kevin Anderson', email: 'kevin.a@example.com', phone: '(512) 555-0111', address: '852 Poplar Pl, Austin, TX 78711', status: 'SALE', product: 'Bajaj Chetak', createdAt: daysAgo(10) },
    ],
  })

  console.log('Seeded 11 test leads')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
