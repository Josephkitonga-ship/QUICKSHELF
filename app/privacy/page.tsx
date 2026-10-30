import type { Metadata } from 'next'
import { Policy } from '@/components/Policy'
export const metadata: Metadata = { title: 'Privacy' }
// DRAFT. To be reviewed by a Kenyan lawyer before launch. Kenya’s Data Protection Act applies.
const S: { t: string; p: string[] }[] = [
  { t: 'What we collect', p: ['Shoppers: your name and phone number when you place an order, and the items and delivery area in it. Saved items and your cart stay on your own phone.', 'Vendors: business and contact details, plan and payment codes, products, orders and wholesale activity.'] },
  { t: 'How we use it', p: ['To pass your order to the vendor you chose, to run vendor accounts and plans, to prevent misuse, and to improve the service.'] },
  { t: 'Who sees it', p: ['The vendor you order from sees your name, phone number and order. For wholesale, the supplier sees the buying vendor’s details. We do not sell personal data.'] },
  { t: 'Where it is kept', p: ['In our database provider’s systems [region and provider details to be confirmed], protected by access rules. We keep orders for as long as needed for the service and for the law [retention period to be confirmed].'] },
  { t: 'Your rights', p: ['You can ask to see, correct or delete your data [contact details to be added]. QuickShelf will register as a data controller where the law requires [to be confirmed].'] },
]
export default function Page() {
  return <Policy title="Privacy" intro="What we collect about shoppers and vendors, and why. Last updated: [date]." sections={S.map((x) => ({ h: x.t, p: x.p }))} />
}
