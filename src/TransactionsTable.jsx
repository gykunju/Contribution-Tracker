import React from "react";

function TransactionsTable({ data }) {
  return (
    <table className="w-full mt-4 bg-opacity-100 p-10">
      <thead>
        <tr className="text-zinc-500 text-xl sm:text-lg xs:text-base border-b">
          <th className="sm:text-start">Name</th>
          <th className="sm:text-start">Email</th>
          <th className="sm:text-start">Amount</th>
          <th className="sm:text-start">Date</th>
        </tr>
      </thead>
      <tbody>
        {data.map((transaction) => (
          <tr
            key={transaction.id}
            className="text-zinc-200 text-xl sm:text-lg xs:text-base border-3 border-zinc-800 text-start"
          >
            <td className="p-3 border-2 border-zinc-800">{transaction.memberName}</td>
            <td className="p-3 border-2 border-zinc-800">{transaction.memberEmail}</td>
            <td className="p-3 border-2 border-zinc-800">{transaction.amount}</td>
            <td className="p-3 border-2 border-zinc-800">
              {new Date(transaction.created_at).toISOString().split("T")[0]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TransactionsTable;
