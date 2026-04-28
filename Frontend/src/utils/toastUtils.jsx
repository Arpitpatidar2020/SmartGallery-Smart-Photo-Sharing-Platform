import toast from 'react-hot-toast'

/**
 * A custom confirm dialog using react-hot-toast
 * @param {string} message - The confirmation message
 * @param {function} onConfirm - Callback when user clicks Confirm
 * @param {string} confirmText - Label for confirm button
 * @param {string} cancelText - Label for cancel button
 */
export const confirmToast = (message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel') => {
  toast((t) => (
    <div className="flex flex-col gap-4 p-1 min-w-[250px]">
      <div>
        <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Are you sure?</h3>
        <p className="text-dark-400 text-xs leading-relaxed">
          {message}
        </p>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700 transition-all border border-dark-700"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
          className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
        >
          {confirmText}
        </button>
      </div>
    </div>
  ), {
    duration: 6000,
    position: 'top-center',
    style: {
      background: '#0f172a', // dark-900
      color: '#fff',
      border: '1px solid #1e293b', // dark-800
      borderRadius: '16px',
      padding: '12px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    }
  });
};
