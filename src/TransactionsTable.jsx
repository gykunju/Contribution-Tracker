import React, { useState } from "react";

function TransactionsTable({ data }) {
  const [filterName, setFilterName] = useState("");

  const filteredData = data.filter((transaction) =>
    transaction.memberName.toLowerCase().includes(filterName.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Filter by name..."
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="px-4 py-2 rounded-lg text-zinc-200 border-2 border-zinc-700 focus:outline-none focus:border-zinc-500"
        />
      </div>
      
      <div className="max-h-[600px] overflow-y-auto border-zinc-700 p-1">
        <table className="w-full bg-opacity-100">
          <thead>
            <tr className="text-zinc-500 text-xl sm:text-lg xs:text-base border-b">
              <th className="sm:text-start">Name</th>
              <th className="sm:text-start">Email</th>
              <th className="sm:text-start">Amount</th>
              <th className="sm:text-start">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((transaction) => (
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
      </div>
    </div>
  );
}

export default TransactionsTable;
