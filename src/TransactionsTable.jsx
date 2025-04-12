import React from "react";

function TransactionsTable({ data }) {
  return (
    <table className="w-full rounded-xl mt-4 p-2">
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
            className="text-zinc-200 text-xl sm:text-lg xs:text-base border text-start"
          >
            <td className="p-3 border">{transaction.memberName}</td>
            <td className="p-3 border">{transaction.memberEmail}</td>
            <td className="p-3 border">{transaction.amount}</td>
            <td className="p-3 border">{transaction.created_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TransactionsTable;
