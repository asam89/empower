"use client";

import { useState, useEffect, useCallback } from "react";

interface Client {
  id: number;
  org_name: string;
  org_type: string;
  board: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  status: string;
  created_at: string;
}

interface Intake {
  id: number;
  client_id: number;
  enrolment_range: string;
  grade_range: string;
  identified_range: string;
  exceptionalities: string;
  current_staffing: string;
  current_resources: string;
  challenges: string;
  budget_range: string;
  goals: string;
  created_at: string;
}

interface Plan {
  id: number;
  client_id: number;
  intake_id: number;
  plan_md: string;
  model: string;
  created_at: string;
}

interface Lead {
  id: number;
  name: string;
  role: string;
  org: string;
  email: string;
  phone: string | null;
  message: string;
  source: string;
  created_at: string;
}

type Tab = "clients" | "leads";

export function AdminDashboard() {

  const [activeTab, setActiveTab] = useState<Tab>("clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clients");
      if (res.status === 401) {
        window.location.href = "/login?next=/admin";
        return;
      }
      const data = (await res.json()) as {
        clients?: Client[];
        intakes?: Intake[];
        plans?: Plan[];
        leads?: Lead[];
      };
      setClients(data.clients || []);
      setIntakes(data.intakes || []);
      setPlans(data.plans || []);
      setLeads(data.leads || []);
    } catch {
      console.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function clientIntakes(clientId: number) {
    return intakes.filter((i) => i.client_id === clientId);
  }

  function clientPlans(clientId: number) {
    return plans.filter((p) => p.client_id === clientId);
  }

  function copyPlan(planMd: string) {
    navigator.clipboard.writeText(planMd);
  }

  function downloadPlan(plan: Plan, orgName: string) {
    const blob = new Blob([plan.plan_md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${orgName}-plan-${plan.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Plan detail view
  if (selectedPlan) {
    const planClient = clients.find(
      (c) => c.id === selectedPlan.client_id
    );
    return (
      <section className="py-10 md:py-16">
        <div className="max-w-[900px] mx-auto px-6">
          <button
            onClick={() => setSelectedPlan(null)}
            className="text-brand-primary font-semibold text-[0.9rem] mb-6 hover:underline"
          >
            &larr; Back to {selectedClient ? "client" : "dashboard"}
          </button>
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => copyPlan(selectedPlan.plan_md)}
              className="px-5 py-2.5 bg-brand-primary text-white font-semibold rounded-xl text-[0.85rem] hover:bg-brand-primary-700 transition-colors"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() =>
                downloadPlan(selectedPlan, planClient?.org_name || "plan")
              }
              className="px-5 py-2.5 bg-brand-care text-white font-semibold rounded-xl text-[0.85rem] hover:bg-brand-care/90 transition-colors"
            >
              Download Markdown
            </button>
          </div>
          <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm plan-content">
            <pre className="whitespace-pre-wrap text-[0.9rem] text-ink leading-relaxed font-sans">
              {selectedPlan.plan_md}
            </pre>
          </div>
          <p className="text-[0.8rem] text-slate mt-4">
            Model: {selectedPlan.model} | Generated:{" "}
            {new Date(selectedPlan.created_at).toLocaleString()}
          </p>
        </div>
      </section>
    );
  }

  // Client detail view
  if (selectedClient) {
    const cIntakes = clientIntakes(selectedClient.id);
    const cPlans = clientPlans(selectedClient.id);
    return (
      <section className="py-10 md:py-16">
        <div className="max-w-[900px] mx-auto px-6">
          <button
            onClick={() => setSelectedClient(null)}
            className="text-brand-primary font-semibold text-[0.9rem] mb-6 hover:underline"
          >
            &larr; Back to dashboard
          </button>
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm mb-6">
            <h2 className="text-[1.3rem] font-bold text-brand-primary mb-4">
              {selectedClient.org_name}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 text-[0.88rem]">
              <p>
                <span className="font-semibold">Type:</span>{" "}
                {selectedClient.org_type}
              </p>
              <p>
                <span className="font-semibold">Board:</span>{" "}
                {selectedClient.board}
              </p>
              <p>
                <span className="font-semibold">Contact:</span>{" "}
                {selectedClient.contact_name}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {selectedClient.contact_email}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {selectedClient.contact_phone || "—"}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span className="inline-block px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[0.8rem] rounded-lg font-medium">
                  {selectedClient.status}
                </span>
              </p>
            </div>
          </div>

          <h3 className="text-[1.1rem] font-bold text-ink mb-3">
            Intakes ({cIntakes.length})
          </h3>
          {cIntakes.length === 0 ? (
            <p className="text-slate text-[0.9rem] mb-6">No intakes yet.</p>
          ) : (
            <div className="space-y-3 mb-6">
              {cIntakes.map((intake) => (
                <div
                  key={intake.id}
                  className="bg-cloud rounded-xl border border-border p-4 text-[0.85rem]"
                >
                  <p>
                    <span className="font-semibold">Grades:</span>{" "}
                    {intake.grade_range} | <span className="font-semibold">Enrolment:</span>{" "}
                    {intake.enrolment_range} |{" "}
                    <span className="font-semibold">Identified:</span>{" "}
                    {intake.identified_range}
                  </p>
                  <p className="text-slate mt-1">
                    Challenges: {intake.challenges || "—"}
                  </p>
                </div>
              ))}
            </div>
          )}

          <h3 className="text-[1.1rem] font-bold text-ink mb-3">
            Generated Plans ({cPlans.length})
          </h3>
          {cPlans.length === 0 ? (
            <p className="text-slate text-[0.9rem]">No plans generated yet.</p>
          ) : (
            <div className="space-y-3">
              {cPlans.map((p) => (
                <div
                  key={p.id}
                  className="bg-cloud rounded-xl border border-border p-4 flex items-center justify-between"
                >
                  <div className="text-[0.85rem]">
                    <p className="font-semibold">
                      Plan #{p.id}
                    </p>
                    <p className="text-slate">
                      {new Date(p.created_at).toLocaleDateString()} |{" "}
                      {p.model}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPlan(p)}
                    className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-xl text-[0.8rem] hover:bg-brand-primary-700 transition-colors"
                  >
                    View Plan
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Main admin dashboard
  return (
    <section className="py-10 md:py-16">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[1.6rem] font-bold text-brand-primary">
            Admin Dashboard
          </h1>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-cloud border border-border rounded-xl text-[0.85rem] font-medium hover:bg-surface transition-colors disabled:opacity-50"
          >
            {loading ? "Loading\u2026" : "Refresh"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-cloud rounded-xl p-1 w-fit">
          {(["clients", "leads"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-[0.85rem] font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-brand-primary text-white"
                  : "text-slate hover:text-ink"
              }`}
            >
              {tab === "clients"
                ? `Clients (${clients.length})`
                : `Leads (${leads.length})`}
            </button>
          ))}
        </div>

        {/* Clients table */}
        {activeTab === "clients" && (
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[0.85rem]">
                <thead>
                  <tr className="bg-cloud border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-ink">
                      Organization
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-ink">
                      Board
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-ink">
                      Contact
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-ink">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-ink">
                      Plans
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-ink">
                      Date
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-border last:border-0 hover:bg-cloud/50"
                    >
                      <td className="px-4 py-3 font-medium">
                        {client.org_name}
                      </td>
                      <td className="px-4 py-3 text-slate">{client.board}</td>
                      <td className="px-4 py-3">
                        <p>{client.contact_name}</p>
                        <p className="text-slate text-[0.8rem]">
                          {client.contact_email}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[0.78rem] rounded-lg font-medium">
                          {client.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate">
                        {clientPlans(client.id).length}
                      </td>
                      <td className="px-4 py-3 text-slate">
                        {new Date(client.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="text-brand-primary font-semibold text-[0.8rem] hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {clients.length === 0 && (
              <p className="text-center text-slate py-8 text-[0.9rem]">
                No clients yet.
              </p>
            )}
          </div>
        )}

        {/* Leads table */}
        {activeTab === "leads" && (
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[0.85rem]">
                <thead>
                  <tr className="bg-cloud border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-ink">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-ink">
                      Role
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-ink">
                      Organization
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-ink">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-ink">
                      Source
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-ink">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-border last:border-0 hover:bg-cloud/50"
                    >
                      <td className="px-4 py-3 font-medium">{lead.name}</td>
                      <td className="px-4 py-3 text-slate">{lead.role}</td>
                      <td className="px-4 py-3">{lead.org}</td>
                      <td className="px-4 py-3 text-slate">{lead.email}</td>
                      <td className="px-4 py-3 text-slate">{lead.source}</td>
                      <td className="px-4 py-3 text-slate">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {leads.length === 0 && (
              <p className="text-center text-slate py-8 text-[0.9rem]">
                No leads yet.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
