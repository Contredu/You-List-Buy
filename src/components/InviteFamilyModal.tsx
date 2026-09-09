import React, { useState } from "react";
import {
  Users,
  Copy,
  Check,
  Share2,
  Send,
  UserPlus,
  Home,
  ShieldCheck,
  X,
  Sparkles,
  ArrowRight,
  UserX,
  Shield,
} from "lucide-react";
import { Household, HouseholdMember, MonthlyList } from "../types";
import { User } from "firebase/auth";

interface InviteFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household | null;
  authUser: User | null;
  activeList?: MonthlyList | null;
  onJoinByCode: (code: string) => Promise<{ success: boolean; message: string }>;
  onCreateNewHousehold: (name: string) => Promise<void>;
  onRemoveMember: (memberUid: string) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const InviteFamilyModal: React.FC<InviteFamilyModalProps> = ({
  isOpen,
  onClose,
  household,
  authUser,
  activeList,
  onJoinByCode,
  onCreateNewHousehold,
  onRemoveMember,
  onShowToast,
}) => {
  const [inviteType, setInviteType] = useState<"list" | "household">(
    activeList?.inviteCode ? "list" : "household"
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [memberUidConfirmingDelete, setMemberUidConfirmingDelete] = useState<string | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  React.useEffect(() => {
    if (activeList?.inviteCode) {
      setInviteType("list");
    } else {
      setInviteType("household");
    }
  }, [activeList?.id, activeList?.inviteCode]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const currentMember = household?.members.find(
    (m) =>
      (authUser?.uid && m.uid === authUser.uid) ||
      (authUser?.email && m.email.toLowerCase() === authUser.email.toLowerCase())
  );
  const isOwnerOrAdmin = Boolean(
    authUser &&
    household &&
    (household.ownerUid === authUser.uid ||
      (household.ownerEmail &&
        authUser.email &&
        household.ownerEmail.toLowerCase() === authUser.email.toLowerCase()) ||
      currentMember?.role === "Administrador")
  );

  const activeCode =
    inviteType === "list" && activeList?.inviteCode
      ? activeList.inviteCode
      : household?.inviteCode || "FAM-2026";

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?join=${activeCode}`
      : `https://app.com/?join=${activeCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopiedCode(true);
      onShowToast(`Código ${activeCode} copiado al portapapeles`);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      onShowToast(`Código: ${activeCode}`);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      onShowToast("Enlace de invitación copiado al portapapeles");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      onShowToast("No se pudo copiar el enlace automáticamente");
    }
  };

  const handleShareWhatsApp = () => {
    const listLabel =
      inviteType === "list" && activeList?.title
        ? `a la lista "${activeList.title}"`
        : `a nuestro hogar "${household?.name || "Familiar"}"`;
    const text = encodeURIComponent(
      `¡Hola! Únete ${listLabel} en nuestra app de compras y despensa compartida en tiempo real.\n\n` +
      `Código de sesión: ${activeCode}\n` +
      `Enlace directo: ${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    setIsJoining(true);
    setJoinError(null);
    try {
      const res = await onJoinByCode(joinCodeInput.trim());
      if (res.success) {
        setJoinCodeInput("");
        onShowToast(res.message);
        onClose();
      } else {
        setJoinError(res.message);
      }
    } catch (err: any) {
      setJoinError("Error al conectar con el hogar.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHouseholdName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateNewHousehold(newHouseholdName.trim());
      setNewHouseholdName("");
      setIsCreatingNew(false);
      onShowToast("Nuevo espacio familiar creado y activo");
    } catch {
      onShowToast("Error al crear nuevo hogar");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Click-outside backdrop layer */}
      <div
        id="invite-modal-backdrop"
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Sesión Compartida Familiar
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                {household?.name || "Hogar Familiar"} • Mismo carrito en tiempo real
              </p>
            </div>
          </div>
          <button
            id="close-invite-modal"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Message */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs sm:text-sm text-emerald-950">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">
                Una sola lista para todos los miembros
              </span>
              Al compartir este código con Juana, Noelia u otros familiares, todos se conectan a esta misma sesión de compra. Todo lo que alguien añade, edita o tacha en el supermercado se actualiza al instante en los móviles de los demás.
            </div>
          </div>

          {/* Invite Scope Selector if activeList is present */}
          {activeList && (
            <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200">
              <button
                type="button"
                onClick={() => setInviteType("list")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  inviteType === "list"
                    ? "bg-white text-emerald-800 shadow-xs border border-emerald-200/60"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                📋 Código de esta Lista ({activeList.title})
              </button>
              <button
                type="button"
                onClick={() => setInviteType("household")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  inviteType === "household"
                    ? "bg-white text-emerald-800 shadow-xs border border-emerald-200/60"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                🏠 Código del Hogar Completo
              </button>
            </div>
          )}

          {/* Big Invite Code Box */}
          <div className="bg-stone-50 border-2 border-dashed border-emerald-300 rounded-2xl p-5 text-center">
            <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold block mb-1">
              {inviteType === "list" && activeList
                ? `Código Único para: ${activeList.title}`
                : `Código de Invitación del Hogar: ${household?.name || "Mi Hogar"}`}
            </span>
            <div className="font-mono text-3xl sm:text-4xl font-black text-emerald-800 tracking-wider my-2 select-all">
              {activeCode}
            </div>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
              {inviteType === "list" && activeList
                ? "Cada lista creada genera su propio código aleatorio exclusivo para compartirla con tus familiares de forma separada."
                : "Cualquiera que introduzca este código en su móvil se unirá automáticamente a vuestra sesión familiar."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                id="copy-invite-code-btn"
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>¡Código Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>

              <button
                id="copy-invite-link-btn"
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-stone-600" />
                    <span>Copiar Enlace Directo</span>
                  </>
                )}
              </button>

              <button
                id="whatsapp-share-btn"
                onClick={handleShareWhatsApp}
                className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Members currently in the session */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                Miembros en esta sesión ({household?.members?.length || 0})
              </h4>
              <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sincronización en vivo
              </span>
            </div>

            {/* Role Notice */}
            <div
              className={`mb-3 p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                isOwnerOrAdmin
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-emerald-50 border-emerald-200 text-emerald-900"
              }`}
            >
              <span className="text-base shrink-0">
                {isOwnerOrAdmin ? "👑" : "🛡️"}
              </span>
              <p className="leading-snug">
                {isOwnerOrAdmin
                  ? "Eres el Administrador de la sesión. Puedes invitar a otros familiares o eliminarlos de esta sesión cuando quieras."
                  : "Tu rol es Familiar: Tienes acceso completo para agregar, modificar o eliminar productos de la lista de compra compartida. Solo el Administrador puede gestionar miembros."}
              </p>
            </div>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl bg-white overflow-hidden max-h-56 overflow-y-auto">
              {household?.members && household.members.length > 0 ? (
                household.members.map((member, index) => {
                  const isCurrent =
                    (authUser?.uid && member.uid === authUser.uid) ||
                    (authUser?.email &&
                      member.email.toLowerCase() === authUser.email.toLowerCase());

                  const isMemberAdmin =
                    member.uid === household.ownerUid ||
                    (household.ownerEmail &&
                      member.email.toLowerCase() === household.ownerEmail.toLowerCase()) ||
                    member.role === "Administrador";

                  const canDeleteThisMember = isOwnerOrAdmin && !isMemberAdmin && !isCurrent;
                  const isConfirming = memberUidConfirmingDelete === member.uid;

                  return (
                    <div
                      key={member.uid || index}
                      className="p-3 flex items-center justify-between hover:bg-stone-50 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-lg border border-emerald-200 shrink-0">
                          {member.avatar || "👤"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-stone-900 text-sm truncate">
                              {member.name}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                                Tú
                              </span>
                            )}
                            {isMemberAdmin && (
                              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold shrink-0">
                                Admin
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-stone-400 truncate block">
                            {member.email || "Familiar"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 hidden sm:inline-block">
                          {member.role || "Familiar"}
                        </span>

                        {canDeleteThisMember && (
                          <div>
                            {isConfirming ? (
                              <div className="flex items-center gap-1.5 bg-rose-50 p-1 rounded-lg border border-rose-200">
                                <span className="text-[11px] text-rose-800 font-medium px-1">
                                  ¿Expulsar?
                                </span>
                                <button
                                  type="button"
                                  disabled={isDeletingMember}
                                  onClick={async () => {
                                    setIsDeletingMember(true);
                                    try {
                                      await onRemoveMember(member.uid);
                                      setMemberUidConfirmingDelete(null);
                                    } finally {
                                      setIsDeletingMember(false);
                                    }
                                  }}
                                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-md transition-colors cursor-pointer"
                                >
                                  {isDeletingMember ? "..." : "Sí"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setMemberUidConfirmingDelete(null)}
                                  className="px-1.5 py-0.5 text-stone-500 hover:text-stone-700 text-[11px] font-medium rounded-md cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setMemberUidConfirmingDelete(member.uid)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200/60 transition-colors cursor-pointer"
                                title="Eliminar a este familiar de la sesión de compra"
                              >
                                <UserX className="w-3.5 h-3.5 text-rose-600" />
                                <span className="hidden sm:inline">Eliminar</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-stone-400">
                  Cargando miembros del hogar...
                </div>
              )}
            </div>
          </div>

          {/* Join Another Household Form */}
          <div className="border-t border-stone-200 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-stone-400" />
              ¿Quieres unirte a la sesión de otro familiar?
            </h4>
            <form onSubmit={handleJoinSubmit} className="flex gap-2">
              <input
                id="join-code-input"
                type="text"
                placeholder="Introduce código (ej. FAM-8204)"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                id="submit-join-code-btn"
                type="submit"
                disabled={isJoining || !joinCodeInput.trim()}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>{isJoining ? "Conectando..." : "Unirme"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
            {joinError && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{joinError}</p>
            )}
          </div>

          {/* Create new household option */}
          <div className="pt-1 text-center">
            {!isCreatingNew ? (
              <button
                id="open-create-household-toggle"
                onClick={() => setIsCreatingNew(true)}
                className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-medium cursor-pointer"
              >
                ¿Quieres crear un espacio familiar nuevo independiente?
              </button>
            ) : (
              <form onSubmit={handleCreateSubmit} className="bg-stone-50 p-3 rounded-xl border border-stone-200 mt-2 space-y-2 text-left">
                <label className="text-xs font-medium text-stone-700 block">
                  Nombre del nuevo hogar (ej. Casa de Verano, Familia Martínez):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nombre del hogar..."
                    value={newHouseholdName}
                    onChange={(e) => setNewHouseholdName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={isCreating || !newHouseholdName.trim()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                  >
                    {isCreating ? "Creando..." : "Crear"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-2 py-1.5 rounded-lg text-xs text-stone-500 hover:text-stone-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex justify-end">
          <button
            id="done-invite-modal-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
