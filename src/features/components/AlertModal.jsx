import React from "react";

export const ALERT_TYPES = {
    OK: "ok",
    CONFIRM: "confirm",
};

export default function AlertModal({ alertData, onClose, onResult }) {
    if (!alertData) return null;

    const handleConfirm = () => {
        onResult?.(true);  
        onClose();
    };

    const handleCancel = () => {
        onResult?.(false); 
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <p className="mb-4">{alertData.message}</p>

                {alertData.type === ALERT_TYPES.OK && (

                    <div className="flex justify-end">
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded "
                            onClick={() => onClose()}
                        >
                            OK
                        </button>
                    </div>
                )}

                {alertData.type === ALERT_TYPES.CONFIRM && (
                    <div className="flex gap-2 justify-end">
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                            onClick={handleConfirm}
                        >
                            Ja
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-300 text-black rounded"
                            onClick={handleCancel}
                        >
                            Nej
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
