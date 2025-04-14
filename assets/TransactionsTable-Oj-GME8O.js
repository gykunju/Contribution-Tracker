import{r as c,j as e}from"./index-DVuyAWPK.js";function i({data:r}){const[s,a]=c.useState(""),l=r.filter(t=>t.memberName.toLowerCase().includes(s.toLowerCase()));return e.jsxs("div",{className:"space-y-4",children:[e.jsx("div",{className:"flex items-center space-x-4",children:e.jsx("input",{type:"text",placeholder:"Filter by name...",value:s,onChange:t=>a(t.target.value),className:"px-4 py-2 rounded-lg text-zinc-200 border-2 border-zinc-700 focus:outline-none focus:border-zinc-500"})}),e.jsx("div",{className:"max-h-[600px] overflow-y-auto border-zinc-700 p-1",children:e.jsxs("table",{className:"w-full bg-opacity-100",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"text-zinc-500 text-xl sm:text-lg xs:text-base border-b",children:[e.jsx("th",{className:"sm:text-start",children:"Name"}),e.jsx("th",{className:"sm:text-start",children:"Email"}),e.jsx("th",{className:"sm:text-start",children:"Amount"}),e.jsx("th",{className:"sm:text-start",children:"Date"})]})}),e.jsx("tbody",{children:l.map(t=>e.jsxs("tr",{className:"text-zinc-200 text-xl sm:text-lg xs:text-base border-3 border-zinc-800 text-start",children:[e.jsx("td",{className:"p-3 border-2 border-zinc-800",children:t.memberName}),e.jsx("td",{className:"p-3 border-2 border-zinc-800",children:t.memberEmail}),e.jsx("td",{className:"p-3 border-2 border-zinc-800",children:t.amount}),e.jsx("td",{className:"p-3 border-2 border-zinc-800",children:new Date(t.created_at).toISOString().split("T")[0]})]},t.id))})]})})]})}export{i as default};
