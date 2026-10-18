import { FiCreditCard, FiCopy } from 'react-icons/fi'

// Abhi dummy data hai, baad mein backend (admin panel) se aayega
const accounts = [
  {
    id: 1,
    bankName: 'HBL',
    accountTitle: 'Foreign Air Travel',
    accountNumber: '0000000000000',
    iban: 'PK00HABB0000000000000000',
    branch: 'Main Branch, Lahore',
  },
  {
    id: 2,
    bankName: 'Meezan Bank',
    accountTitle: 'Foreign Air Travel',
    accountNumber: '0000000000000',
    iban: 'PK00MEZN0000000000000000',
    branch: 'Gulberg Branch, Lahore',
  },
]

function Detail({ label, value }) {
  if (!value) return null

  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#003366]">{value}</p>
    </div>
  )
}

export default function BankAccountPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#003366] sm:text-3xl">Bank Account</h1>
      <p className="mt-1 text-sm text-slate-600">
        You can send your payment to any of the accounts below.
      </p>

      {accounts.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
          No bank accounts available yet.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {accounts.map((item) => (
            <div key={item.id} className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#FF6B35]/10 text-xl text-[#FF6B35]">
                  <FiCreditCard />
                </span>
                <h2 className="min-w-0 truncate text-lg font-semibold text-[#003366]">
                  {item.bankName}
                </h2>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#003366]/10 pt-5 sm:grid-cols-2">
                <Detail label="Account title" value={item.accountTitle} />
                <Detail label="Account number" value={item.accountNumber} />
                <Detail label="IBAN" value={item.iban} />
                <Detail label="Branch" value={item.branch} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}