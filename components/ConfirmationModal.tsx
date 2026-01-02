import { Trash2 } from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  variant = "danger", // "danger" pour rouge, "warning" pour orange
}: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay sombre */}
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Contenu de la Modal */}
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 transform transition-all animate-in fade-in zoom-in duration-200">
        <div className="text-center">
          {/* Icône dynamique selon la variante */}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
              variant === "danger"
                ? "bg-red-50 text-red-500"
                : "bg-orange-50 text-orange-500"
            }`}
          >
            <Trash2 className="size-8" />
          </div>

          <h3 className="text-2xl font-extrabold text-neutral-900 mb-2">
            {title}
          </h3>
          <p className="text-neutral-500 mb-8 leading-relaxed">{description}</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 border border-neutral-200 text-neutral-600 font-bold rounded-2xl hover:bg-neutral-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3.5 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 ${
                variant === "danger"
                  ? "bg-red-600 hover:bg-red-700 shadow-red-100"
                  : "bg-neutral-900 hover:bg-neutral-800 shadow-neutral-100"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
