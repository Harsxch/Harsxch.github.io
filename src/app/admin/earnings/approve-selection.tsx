"use client";

import { useState, useTransition } from "react";
import { approveTransactionsAction } from "./actions";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

interface Row {
  id: string;
  date: string;
  influencer: string;
  course: string;
  type: string;
  model: string;
  amount: string;
  status: string;
}

export function ApproveSelection({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState(new Set<string>());
  const [isPending, startTransition] = useTransition();

  const pendingRows = rows.filter((r) => r.status === "PENDING" && r.type === "EARNING");

  return (
    <div>
      {pendingRows.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
          <span className="text-xs text-slate-500">{selected.size} selected</span>
          <Button
            variant="secondary"
            disabled={selected.size === 0 || isPending}
            onClick={() => startTransition(() => approveTransactionsAction([...selected]).then(() => setSelected(new Set())))}
          >
            {isPending ? "Approving..." : "Approve selected"}
          </Button>
        </div>
      )}
      <Table>
        <Thead>
          <Tr>
            <Th></Th>
            <Th>Date</Th>
            <Th>Influencer</Th>
            <Th>Course</Th>
            <Th>Type</Th>
            <Th>Model</Th>
            <Th align="right">Amount</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <tbody>
          {rows.map((r) => (
            <Tr key={r.id}>
              <Td>
                {r.status === "PENDING" && r.type === "EARNING" && (
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={(e) => {
                      const next = new Set(selected);
                      if (e.target.checked) next.add(r.id);
                      else next.delete(r.id);
                      setSelected(next);
                    }}
                  />
                )}
              </Td>
              <Td>{r.date}</Td>
              <Td>{r.influencer}</Td>
              <Td>{r.course}</Td>
              <Td>{r.type}</Td>
              <Td>{r.model.replaceAll("_", " ")}</Td>
              <Td align="right">{formatCurrency(r.amount)}</Td>
              <Td>
                <Badge>{r.status}</Badge>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
