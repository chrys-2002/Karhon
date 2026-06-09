"use client";

// <FormulaireDynamique> — génère un formulaire à partir d'une liste de champs
// (config par produit, voir src/lib/formulaires.ts). Un seul composant pour
// TOUS les produits : il s'adapte automatiquement aux questions fournies.
//
// Composants PREMIUM réutilisés : <Select> (listes) et <DatePicker> (dates),
// pour un rendu cohérent et soigné (pas de menus/calendriers natifs).
import type { Champ, Reponses } from "@/lib/formulaires";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";

type Props = {
  champs: Champ[];
  valeurs: Reponses;
  onChange: (valeurs: Reponses) => void;
};

const styleInput =
  "w-full px-4 py-3 rounded-xl text-sm border bg-white focus:outline-none transition-all";

export default function FormulaireDynamique({ champs, valeurs, onChange }: Props) {
  const set = (id: string, v: string | string[]) => onChange({ ...valeurs, [id]: v });

  // Bascule une option dans un champ "checkbox" (liste de valeurs).
  const toggleCase = (id: string, option: string) => {
    const actuel = Array.isArray(valeurs[id]) ? (valeurs[id] as string[]) : [];
    const next = actuel.includes(option)
      ? actuel.filter((o) => o !== option)
      : [...actuel, option];
    set(id, next);
  };

  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {champs.map((c) => {
        const val = valeurs[c.id];
        const valStr = typeof val === "string" ? val : "";
        const pleine = c.pleineLargeur || c.type === "textarea" || c.type === "checkbox";

        // ── Liste déroulante PREMIUM ──
        if (c.type === "select") {
          return (
            <div key={c.id} className={pleine ? "sm:col-span-2" : ""}>
              <Select
                label={c.label}
                name={c.id}
                value={valStr}
                onChange={(e) => set(c.id, e.target.value)}
                options={(c.options ?? []).map((o) => ({ value: o, label: o }))}
                required={c.requis}
              />
              {c.aide && <p className="text-xs text-gray-400 mt-1">{c.aide}</p>}
            </div>
          );
        }

        return (
          <div key={c.id} className={pleine ? "sm:col-span-2" : ""}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {c.label} {c.requis && <span style={{ color: "#2a8a8a" }}>*</span>}
            </label>

            {/* Date PREMIUM (calendrier maison) */}
            {c.type === "date" && (
              <DatePicker value={valStr} onChange={(v) => set(c.id, v)} placeholder="Choisir une date" />
            )}

            {/* Texte / Nombre */}
            {(c.type === "text" || c.type === "number") && (
              <div className="relative">
                <input
                  type={c.type}
                  value={valStr}
                  onChange={(e) => set(c.id, e.target.value)}
                  className={styleInput}
                  style={{ borderColor: "#e0ecec", paddingRight: c.suffixe ? "3.5rem" : undefined }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(42,138,138,0.15)")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
                {c.suffixe && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">{c.suffixe}</span>
                )}
              </div>
            )}

            {/* Zone de texte */}
            {c.type === "textarea" && (
              <textarea
                rows={3}
                value={valStr}
                onChange={(e) => set(c.id, e.target.value)}
                className={`${styleInput} resize-none`}
                style={{ borderColor: "#e0ecec" }}
              />
            )}

            {/* Cases à cocher (plusieurs choix) */}
            {c.type === "checkbox" && (
              <div className="flex flex-wrap gap-2">
                {c.options?.map((o) => {
                  const actif = Array.isArray(val) && val.includes(o);
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => toggleCase(c.id, o)}
                      className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all border"
                      style={
                        actif
                          ? { background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)", color: "#fff", borderColor: "transparent" }
                          : { background: "#fff", color: "#1a2e5a", borderColor: "#e0ecec" }
                      }
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            )}

            {c.aide && <p className="text-xs text-gray-400 mt-1">{c.aide}</p>}
          </div>
        );
      })}
    </div>
  );
}
