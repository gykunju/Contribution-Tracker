import React, { useState } from "react";

function TransactionsTable({ data }) {
  const [filterName, setFilterName] = useState("");

  const filteredData = data.filter((transaction) =>
    transaction.memberName.toLowerCase().includes(filterName.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {localStorage.getItem("permission") === "admin" && (
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Filter by name..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="px-4 py-2 rounded-lg text-zinc-900 border-2 border-[#D8C3A5] focus:outline-none focus:border-zinc-500"
          />
        </div>
      )}
      <div className="table-container max-h-[400px] overflow-y-auto rounded-xl">
        <table className="w-full bg-opacity-100">
          <thead className="rounded-5xl border-3 border-[#D8C3A5]">
            <tr className="text-[#bd655f] text-xl sm:text-lg xs:text-base bg-[#D8C3A5]">
              <th className="sm:text-start p-3">Name</th>
              <th className="sm:text-start">Email</th>
              <th className="sm:text-start">Amount</th>
              <th className="sm:text-start">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((transaction) => (
              <tr
                key={transaction.id}
                className="text-zinc-600 text-xl sm:text-lg xs:text-base border-3 border-[#D8C3A5] text-start"
              >
                <td className="p-3 ">{transaction.memberName}</td>
                <td className="p-3 ">{transaction.memberEmail}</td>
                <td className="p-3 ">{transaction.amount}</td>
                <td className="p-3 ">
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
