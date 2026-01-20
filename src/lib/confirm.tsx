import { toast } from 'sonner';

interface ConfirmOptions {
    description?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info';
}

export const showConfirm = (
    message: string,
    onConfirm: () => void | Promise<void>,
    options: ConfirmOptions = {}
) => {
    const {
        description,
        confirmText = '确定',
        cancelText = '取消',
        type = 'danger'
    } = options;

    toast.custom((t) => (
        <div className="bg-white w-[356px] rounded-lg shadow-lg border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-2">
                <div className="flex gap-3 items-start">
                    {/* Icon based on type */}
                    <div className={`mt-0.5 flex-shrink-0 ${type === 'danger' ? 'text-red-500' : 'text-blue-500'}`}>
                        {type === 'danger' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{message}</h3>
                        {description && (
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 justify-end mt-2">
                    <button
                        onClick={() => toast.dismiss(t)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t);
                            await onConfirm();
                        }}
                        className={`px-3 py-1.5 text-xs font-medium text-white rounded-md transition-shadow shadow-sm hover:shadow 
                            ${type === 'danger'
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    ), {
        duration: Infinity, // Prevent auto-dismissal for confirmations
    });
};
