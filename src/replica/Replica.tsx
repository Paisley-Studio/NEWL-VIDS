/**
 * Faithful re-creation of NEWL AFRICA views that have no supplied screenshot
 * (project detail page, Submit Daily Log form, Add Expenditure form, Mark Project
 * Complete form, team leader Daily Logs page).
 *
 * Markup, labels, field order and styling are transcribed from the application's
 * own source (renderProjectDetail, openDailyLogModal, openExpenseModal,
 * openCompleteProjectModal, renderLogs and the :root CSS). Values are illustrative
 * and consistent with the supplied screenshots (KISUMU_NITA, Tesh, KES 500,000…).
 * Rendered at the screenshots' 1.35x zoom so both sources match on screen.
 */
import React from "react";
import { Icon } from "../components/base";
import { APP_ZOOM, C, CANVAS, FONT } from "../theme";
import type { ReplicaState } from "../types";

const NAT_W = CANVAS.w / APP_ZOOM;
const NAT_H = CANVAS.h / APP_ZOOM;

const PROJECT = { name: "KISUMU_NITA", smp: "SMP-WO-1851398", module: "TI Cabinet Installation", location: "KISUMU", budget: 500000 };
const CASUAL = { name: "John Otieno", phone: "+254712345678", role: "Rigger" };
const LOG = {
  date: "12 Nov 2026",
  hours: 8,
  work: "Installed and secured the TI cabinet on site. Completed cable routing to the mast base.",
  materials: "Cable 20m, mounting brackets x4",
};
const kes = (n: number) => (n < 0 ? "-" : "") + "KES " + Math.abs(n).toLocaleString("en-KE");

/* ---------------------------------------------------------------- styles from the app CSS */
const card: React.CSSProperties = { background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20 };
const mLabel: React.CSSProperties = { fontSize: 10, fontWeight: 600, color: C.textSoft, textTransform: "uppercase", letterSpacing: ".05em" };
const mValue: React.CSSProperties = { fontSize: 22, fontWeight: 700, letterSpacing: "-.02em", marginTop: 4, lineHeight: 1.2 };
const mSub: React.CSSProperties = { fontSize: 11, color: C.textSoft, marginTop: 2 };
const btn = (kind: "primary" | "outline" | "danger" | "outline-primary", size: "md" | "sm" | "xs" = "md"): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: size === "xs" ? 5 : 7,
  padding: size === "md" ? "11px 18px" : size === "sm" ? "8px 14px" : "6px 10px",
  minHeight: size === "md" ? 44 : size === "sm" ? 38 : 32,
  fontSize: size === "md" ? 13 : size === "sm" ? 12 : 11,
  fontWeight: 600,
  borderRadius: 999,
  border: `1px solid ${kind === "primary" ? C.primary : kind === "danger" ? "#f5c6cb" : kind === "outline-primary" ? C.primary : C.border}`,
  background: kind === "primary" ? C.primary : C.surface,
  color: kind === "primary" ? "#fff" : kind === "danger" ? C.danger : kind === "outline-primary" ? C.primary : C.text,
  whiteSpace: "nowrap",
  lineHeight: 1,
  boxSizing: "border-box",
});
const badge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "3px 12px",
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: ".04em",
  background: "#e6f4ec",
  color: C.primary,
};
const dot = <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.primary, display: "inline-block" }} />;
const label: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: C.textSoft, textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 6 };
const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: C.surface,
  border: `1.5px solid ${C.border}`,
  borderRadius: 12,
  color: C.text,
  fontSize: 15,
  minHeight: 46,
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};
const th: React.CSSProperties = {
  textAlign: "left",
  padding: "11px 14px",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: ".06em",
  color: C.textSoft,
  borderBottom: `1px solid ${C.border}`,
  fontWeight: 600,
  background: C.bg,
  whiteSpace: "nowrap",
};
const td: React.CSSProperties = { padding: "10px 14px", borderBottom: `1px solid ${C.border}`, verticalAlign: "middle", fontSize: 13 };

/* ---------------------------------------------------------------- shell */
const NAV = {
  admin: [
    ["home", "house", "Home"],
    ["projects", "folder", "Projects"],
    ["team-leaders", "user-tie", "Team Leaders"],
    ["financials", "wallet", "Financials"],
    ["logs", "clipboard-list", "Daily Logs"],
    ["casuals", "users", "All Casuals"],
    ["notifications", "bell", "Notifications"],
    ["audit", "clock-rotate-left", "Audit Log"],
    ["settings", "gear", "Settings"],
  ],
  tl: [
    ["home", "folder", "My Projects"],
    ["casuals", "users", "My Casuals"],
    ["logs", "clipboard-list", "Daily Logs"],
    ["funds", "coins", "Fund Requests"],
    ["notifications", "bell", "Notifications"],
    ["settings", "gear", "Settings"],
  ],
} as const;

const Shell: React.FC<{ role: "admin" | "tl"; active: string; children: React.ReactNode }> = ({ role, active, children }) => {
  const user = role === "admin" ? { n: "Onis", r: "Administrator", i: "O" } : { n: "Tesh", r: "Team Leader", i: "T" };
  return (
    <div style={{ display: "flex", gap: 20, padding: "14px 16px 0", alignItems: "flex-start" }}>
      <aside style={{ width: 240, flexShrink: 0, background: C.surface, borderRadius: 20, padding: "18px 12px", border: `1px solid ${C.border}`, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 14px", borderBottom: `1px solid ${C.border}`, marginBottom: 12 }}>
          <div style={{ background: C.primary, width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="tower-cell" size={18} color="#fff" />
          </div>
          <div>
            <b style={{ fontSize: 14 }}>NEWL AFRICA</b>
            <div style={{ fontSize: 9, color: C.textSoft, letterSpacing: ".05em" }}>MANAGEMENT</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV[role].map(([key, icon, text]) => {
            const on = key === active;
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "11px 12px",
                  borderRadius: 12,
                  fontWeight: on ? 600 : 500,
                  fontSize: 13,
                  color: on ? C.primary : C.textSoft,
                  background: on ? "#e6f4ec" : "transparent",
                  minHeight: 44,
                  boxSizing: "border-box",
                }}
              >
                <span style={{ width: 18, display: "flex", justifyContent: "center" }}>
                  <Icon name={icon} size={14} color={on ? C.primary : C.textSoft} />
                </span>
                <span>{text}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: C.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>
            {user.i}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{user.n}</div>
            <div style={{ fontSize: 10, color: C.textSoft }}>{user.r}</div>
          </div>
          <div style={{ ...btn("outline", "xs"), width: 32 }}>
            <Icon name="right-from-bracket" size={11} color={C.text} />
          </div>
        </div>
      </aside>
      <div style={{ flex: 1, minWidth: 0 }}>
        <header
          style={{
            background: C.surface,
            borderRadius: 20,
            padding: "10px 14px",
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            boxShadow: "0 1px 3px rgba(21,80,42,.06)",
          }}
        >
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: C.bg, borderRadius: 999, padding: "8px 16px", minHeight: 44, boxSizing: "border-box" }}>
            <Icon name="magnifying-glass" size={13} color={C.textSoft} />
            <span style={{ fontSize: 14, color: C.textLight }}>Search projects, SMP, PO, people...</span>
          </div>
          <div style={{ ...btn("outline", "sm") }}>
            <Icon name="bell" size={12} color={C.text} />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- pages */
const SectionHead: React.FC<{ hash: React.ReactNode; title: string; sub: React.ReactNode; right?: React.ReactNode }> = ({ hash, title, sub, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <span style={{ color: C.primary, fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", display: "inline-flex", gap: 6, alignItems: "center" }}>{hash}</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.2, margin: "4px 0 0" }}>{title}</h2>
      <div style={{ fontSize: 12, color: C.textSoft, marginTop: 3 }}>{sub}</div>
    </div>
    {right ? <div style={{ display: "flex", gap: 6, alignItems: "center" }}>{right}</div> : null}
  </div>
);

const Metric: React.FC<{ l: string; v: React.ReactNode; sub?: string; color?: string; hl?: boolean }> = ({ l, v, sub, color, hl = true }) => (
  <div style={card}>
    <div style={mLabel}>{l}</div>
    <div style={{ ...mValue, color: color ?? (hl ? C.primary : C.text) }}>{v}</div>
    {sub ? <div style={mSub}>{sub}</div> : null}
  </div>
);

const ProjectPage: React.FC<{ s: ReplicaState }> = ({ s }) => {
  const isAdmin = s.role === "admin";
  const spent = s.expense ? 70000 : 0;
  const nCasuals = s.casuals ? 1 : 0;
  const nLogs = s.logs ? 1 : 0;
  const pct = Math.min(90, nLogs * 8 + 10);
  const tabs = isAdmin ? ["overview", "casuals", "logs", "financials"] : ["overview", "casuals", "logs"];
  const tab = s.tab ?? "overview";
  return (
    <>
      <SectionHead
        hash={
          <>
            <Icon name="arrow-left" size={10} color={C.primary} /> Projects
          </>
        }
        title={PROJECT.name}
        sub={
          <>
            SMP <b>{PROJECT.smp}</b> - {PROJECT.module}
          </>
        }
        right={
          <>
            <span style={badge}>
              {dot}active
            </span>
            {isAdmin ? (
              <>
                <div data-hl="btn-edit" style={btn("outline", "sm")}>
                  <Icon name="pen-to-square" size={12} color={C.text} />
                </div>
                <div data-hl="btn-delete" style={btn("danger", "sm")}>
                  <Icon name="trash" size={12} color={C.danger} />
                </div>
              </>
            ) : (
              <div data-hl="btn-mark-complete" style={btn("primary", "sm")}>
                <Icon name="check" size={11} color="#fff" /> Mark Complete
              </div>
            )}
          </>
        }
      />
      {isAdmin ? (
        <div data-hl="metrics" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14, marginBottom: 16 }}>
          <Metric l="Budget" v={kes(PROJECT.budget)} />
          <Metric l="Spent + Funds" v={kes(spent)} hl={false} />
          <Metric l="Remaining" v={kes(PROJECT.budget - spent)} />
          <Metric l="Team Leader" v={<span style={{ fontSize: 14 }}>{s.tl ?? "-"}</span>} hl={false} sub={`${nCasuals} casuals active`} />
        </div>
      ) : (
        <div data-hl="metrics" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14, marginBottom: 16 }}>
          <Metric l="Progress" v={`${pct}%`} sub="Based on logs submitted" />
          <Metric l="Team" v={<span style={{ fontSize: 14 }}>{nCasuals} casuals active</span>} hl={false} sub={`${nLogs} logs submitted`} />
        </div>
      )}
      <div data-hl="tabs" style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
        {tabs.map((t) => (
          <div
            key={t}
            data-hl={`tab-${t}`}
            style={{
              padding: "12px 16px",
              color: t === tab ? C.primary : C.textSoft,
              fontWeight: 600,
              fontSize: 13,
              borderBottom: `2px solid ${t === tab ? C.primary : "transparent"}`,
              marginBottom: -1,
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>
      {tab === "overview" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div data-hl="details-card" style={card}>
            <h4 style={{ fontSize: 14, margin: "0 0 10px" }}>Project Details</h4>
            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "8px 12px", fontSize: 13 }}>
              {[
                ["Client", "-"],
                ["Location", PROJECT.location],
                ["Region", "-"],
                ["Start", "-"],
                ["End", "-"],
                ["Team Leader", s.tl ?? "-"],
              ].map(([k, v]) => (
                <React.Fragment key={k}>
                  <div style={{ color: C.textSoft }}>{k}</div>
                  <div>{v}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
          {isAdmin ? (
            <div data-hl="fin-summary" style={card}>
              <h4 style={{ fontSize: 14, margin: "0 0 10px" }}>Financial Summary</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6, fontSize: 13 }}>
                <div>Allocated budget</div>
                <div style={{ fontWeight: 600 }}>{kes(PROJECT.budget)}</div>
                <div>Direct expenditure</div>
                <div style={{ fontWeight: 600, color: C.danger }}>- {kes(spent)}</div>
                <div>Approved additional funds</div>
                <div style={{ fontWeight: 600, color: C.danger }}>- KES 0</div>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 4 }}>Remaining</div>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 4, fontWeight: 700, color: C.primary }}>{kes(PROJECT.budget - spent)}</div>
              </div>
            </div>
          ) : (
            <div data-hl="progress-card" style={card}>
              <h4 style={{ fontSize: 14, margin: "0 0 10px" }}>Progress</h4>
              <div style={{ height: 10, background: C.bg, borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: C.primary, borderRadius: 999 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textSoft, marginTop: 6 }}>
                <span>{pct}% complete</span>
                <span>Based on logs and status</span>
              </div>
            </div>
          )}
        </div>
      ) : null}
      {tab === "casuals" ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ fontSize: 14, margin: 0 }}>Casuals on this project ({nCasuals} active)</h4>
            {!isAdmin ? (
              <div data-hl="btn-add-casual" style={btn("primary", "sm")}>
                <Icon name="plus" size={11} color="#fff" /> Add Casual
              </div>
            ) : null}
          </div>
          {nCasuals ? (
            <div data-hl="casuals-table" style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Name", "Phone", "Role", "Status", ...(isAdmin ? [] : [""])].map((h) => (
                      <th key={h} style={th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr data-hl="casual-row-0">
                    <td style={{ ...td, borderBottom: "none" }}>
                      <b>{CASUAL.name}</b>
                    </td>
                    <td style={{ ...td, borderBottom: "none" }}>{CASUAL.phone}</td>
                    <td style={{ ...td, borderBottom: "none" }}>{CASUAL.role}</td>
                    <td style={{ ...td, borderBottom: "none" }}>
                      <span style={badge}>{dot}active</span>
                    </td>
                    {!isAdmin ? (
                      <td style={{ ...td, borderBottom: "none" }}>
                        <span style={{ display: "inline-flex", gap: 4 }}>
                          <span data-hl="btn-casual-edit" style={btn("outline", "xs")}>
                            <Icon name="pen-to-square" size={10} color={C.text} />
                          </span>
                          <span data-hl="btn-casual-delete" style={btn("danger", "xs")}>
                            <Icon name="trash" size={10} color={C.danger} />
                          </span>
                        </span>
                      </td>
                    ) : null}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ ...card, textAlign: "center", padding: 30, color: C.textSoft }}>No casuals added yet</div>
          )}
        </>
      ) : null}
      {tab === "logs" ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ fontSize: 14, margin: 0 }}>Daily Logs ({nLogs})</h4>
            {!isAdmin ? (
              <div style={btn("primary", "sm")}>
                <Icon name="plus" size={11} color="#fff" /> Submit Log
              </div>
            ) : null}
          </div>
          {nLogs ? <LogCard withProject={false} /> : <div style={{ ...card, textAlign: "center", padding: 30, color: C.textSoft }}>No logs submitted yet</div>}
        </>
      ) : null}
      {tab === "financials" ? <FinancialsTab expense={Boolean(s.expense)} /> : null}
    </>
  );
};

const FinancialsTab: React.FC<{ expense: boolean }> = ({ expense }) => {
  const spent = expense ? 70000 : 0;
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 14, marginBottom: 16 }}>
        <Metric l="Allocated" v={kes(PROJECT.budget)} />
        <Metric l="Spent + Funds" v={kes(spent)} hl={false} sub={`${expense ? 1 : 0} entries + 0 approved funds`} />
        <Metric l="Remaining" v={kes(PROJECT.budget - spent)} />
      </div>
      <div data-hl="expense-card" style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h4 style={{ fontSize: 14, margin: 0 }}>Expenditure</h4>
          <div data-hl="btn-add-expense" style={btn("primary", "xs")}>
            <Icon name="plus" size={10} color="#fff" /> Add
          </div>
        </div>
        {expense ? (
          <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Date", "Item", "Receipt", "Amount"].map((h) => (
                    <th key={h} style={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr data-hl="expense-row-0">
                  <td style={{ ...td, borderBottom: "none" }}>12 Nov 2026</td>
                  <td style={{ ...td, borderBottom: "none" }}>Mast Mounting</td>
                  <td style={{ ...td, borderBottom: "none" }}>RCP-001</td>
                  <td style={{ ...td, borderBottom: "none" }}>
                    <b>KES 70,000</b>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 20, color: C.textSoft, fontSize: 13 }}>No expenditure recorded</div>
        )}
      </div>
      <div data-hl="funds-card" style={card}>
        <h4 style={{ fontSize: 14, margin: "0 0 10px" }}>Additional Funds Requests</h4>
        <div style={{ textAlign: "center", padding: 20, color: C.textSoft, fontSize: 13 }}>No fund requests</div>
      </div>
    </>
  );
};

const LogCard: React.FC<{ withProject: boolean }> = ({ withProject }) => (
  <div data-hl="log-card-0" style={{ ...card, marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700 }}>
          {LOG.date}
          {withProject ? "" : ` - ${LOG.hours}h`}
        </div>
        {withProject ? (
          <div style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}>
            {PROJECT.name} - SMP {PROJECT.smp}
          </div>
        ) : null}
        <div style={{ fontSize: 13, marginTop: 8 }}>{LOG.work}</div>
        <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: C.textSoft }}>
          {withProject ? (
            <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
              <Icon name="clock" size={10} color={C.textSoft} /> {LOG.hours}h
            </span>
          ) : null}
          <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
            <Icon name="users" size={10} color={C.textSoft} /> {CASUAL.name}
          </span>
          <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
            <Icon name="box" size={10} color={C.textSoft} /> {LOG.materials}
          </span>
        </div>
      </div>
      <div style={{ textAlign: "right", fontSize: 11, color: C.textSoft }}>
        {withProject ? <div>by Tesh</div> : null}
        <div>just now</div>
      </div>
    </div>
  </div>
);

const LogsPage: React.FC = () => (
  <>
    <SectionHead
      hash="# Field Reports"
      title="Daily Logs"
      sub="1 log"
      right={
        <div style={btn("primary")}>
          <Icon name="plus" size={12} color="#fff" /> Submit Log
        </div>
      }
    />
    <LogCard withProject />
  </>
);

/* ---------------------------------------------------------------- modals */
const Field: React.FC<{ l: string; hl?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ l, hl, children, style }) => (
  <div style={{ marginBottom: 14, ...style }}>
    <span style={label}>{l}</span>
    <div data-hl={hl} style={{ borderRadius: 12 }}>
      {children}
    </div>
  </div>
);
const Placeholder: React.FC<{ t: string }> = ({ t }) => <span style={{ color: "#7b8a83" }}>{t}</span>;
const Select: React.FC<{ v: string }> = ({ v }) => (
  <div style={input}>
    <span>{v}</span>
    <Icon name="chevron-down" size={11} color={C.text} />
  </div>
);
const DateInput: React.FC<{ v: string }> = ({ v }) => (
  <div style={input}>
    <span>{v}</span>
    <Icon name="calendar" size={13} color={C.text} />
  </div>
);
const Check: React.FC<{ on: boolean }> = ({ on }) => (
  <span
    style={{
      width: 18,
      height: 18,
      borderRadius: 3,
      border: on ? "none" : "1.5px solid #767676",
      background: on ? "#0075ff" : "#fff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box",
      flexShrink: 0,
    }}
  >
    {on ? <Icon name="check" size={12} color="#fff" /> : null}
  </span>
);

const ModalFrame: React.FC<{ title: string; wide?: boolean; buttons: [string, string]; children: React.ReactNode }> = ({ title, wide, buttons, children }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <div data-hl="modal" style={{ background: C.surface, borderRadius: 22, padding: 24, width: wide ? 760 : 600, boxShadow: "0 24px 64px rgba(0,0,0,.25)", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{title}</h3>
        <div style={{ background: C.bg, width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="xmark" size={13} color={C.textSoft} />
        </div>
      </div>
      {children}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
        <div style={{ ...btn("outline"), flex: "1 1 auto", minWidth: 120 }}>{buttons[0]}</div>
        <div data-hl="btn-modal-submit" style={{ ...btn("primary"), flex: "1 1 auto", minWidth: 120 }}>
          {buttons[1]}
        </div>
      </div>
    </div>
  </div>
);

const DailyLogModal: React.FC<{ checked: number[] }> = ({ checked }) => (
  <ModalFrame title="Submit Daily Log" wide buttons={["Cancel", "Submit"]}>
    <Field l="Project" hl="dl-project">
      <Select v={`${PROJECT.name} - SMP ${PROJECT.smp}`} />
    </Field>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <Field l="Date" hl="dl-date">
        <DateInput v="11/12/2026" />
      </Field>
      <Field l="Hours Worked" hl="dl-hours">
        <div style={input}>
          <span>8</span>
        </div>
      </Field>
    </div>
    <Field l="Work Done" hl="dl-work">
      <div style={{ ...input, minHeight: 80, alignItems: "flex-start" }}>
        <Placeholder t="Describe what was accomplished today..." />
      </div>
    </Field>
    <Field l="Materials Used" hl="dl-materials">
      <div style={input}>
        <Placeholder t="e.g. Mast sections x3, cable 20m" />
      </div>
    </Field>
    <Field l="Casuals Present" hl="dl-casuals" style={{ marginBottom: 0 }}>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 8 }}>
        <div data-hl="dl-casual-0" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 4px", fontSize: 13, minHeight: 40, boxSizing: "border-box" }}>
          <Check on={checked.includes(0)} />
          <span>
            {CASUAL.name} <span style={{ color: C.textSoft }}>- {CASUAL.role}</span>
          </span>
        </div>
      </div>
    </Field>
  </ModalFrame>
);

const ExpenseModal: React.FC = () => (
  <ModalFrame title="Add Expenditure" buttons={["Cancel", "Add"]}>
    <Field l="Item Description" hl="f-item">
      <div style={input}>
        <Placeholder t="e.g. Mast section hardware" />
      </div>
    </Field>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <Field l="Amount (KES)" hl="f-amount">
        <div style={input}>
          <Placeholder t="120000" />
        </div>
      </Field>
      <Field l="Date" hl="f-date">
        <DateInput v="11/12/2026" />
      </Field>
    </div>
    <Field l="Receipt / Reference" hl="f-receipt" style={{ marginBottom: 0 }}>
      <div style={input}>
        <Placeholder t="RCP-001" />
      </div>
    </Field>
  </ModalFrame>
);

const CompleteModal: React.FC = () => (
  <ModalFrame title="Mark Project Complete" buttons={["Cancel", "Submit"]}>
    <div style={{ fontSize: 13, color: C.textSoft, marginBottom: 14 }}>
      Mark <b>{PROJECT.name}</b> as complete? Admin will be notified.
    </div>
    <div style={{ background: C.bg, padding: 12, borderRadius: 12, fontSize: 12, color: C.textSoft, marginBottom: 14 }}>
      <b>SMP:</b> {PROJECT.smp}
    </div>
    <Field l="Notes (optional)" hl="cp-notes" style={{ marginBottom: 0 }}>
      <div style={{ ...input, minHeight: 80 }} />
    </Field>
  </ModalFrame>
);

/* ---------------------------------------------------------------- root */
export const Replica: React.FC<{ state: ReplicaState; frame: number }> = ({ state }) => {
  const role = state.role ?? "admin";
  const page = state.page ?? "project";
  const active = page === "logs" ? "logs" : role === "admin" ? "projects" : "home";
  const modal = state.modal ?? null;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS.w, height: CANVAS.h, background: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: NAT_W,
          height: NAT_H,
          transform: `scale(${APP_ZOOM})`,
          transformOrigin: "0 0",
          fontFamily: FONT,
          fontSize: 14,
          lineHeight: 1.5,
          color: C.text,
        }}
      >
        <div style={{ position: "absolute", inset: 0, filter: modal ? "blur(4px)" : undefined }}>
          <Shell role={role} active={active}>
            {page === "logs" ? <LogsPage /> : <ProjectPage s={state} />}
          </Shell>
        </div>
        {modal ? (
          <>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)" }} />
            {modal === "daily-log" ? <DailyLogModal checked={state.checked ?? []} /> : null}
            {modal === "expense" ? <ExpenseModal /> : null}
            {modal === "complete" ? <CompleteModal /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
};
