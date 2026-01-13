import { createRoot } from "react-dom/client";
import AlertModal, { ALERT_TYPES }  from "../components/AlertModal";


export function confirmCustom(message) {
    return new Promise((resolve) => {
        const container = document.createElement("div");
        document.body.appendChild(container);

        const root = createRoot(container);

        const handleClose = () => {
            root.unmount();
            container.remove();
        };

        root.render(
            <AlertModal
                alertData={{
                    type: ALERT_TYPES.CONFIRM,
                    message,
                }}
                onClose={handleClose}
                onResult={(result) => resolve(result)}
            />
        );
    });
}


export function alertCustom(message) {
    return new Promise((resolve) => {
        const container = document.createElement("div");
        document.body.appendChild(container);

        const root = createRoot(container);

        const handleClose = () => {
            resolve(); // resolve the promise when OK is clicked
            root.unmount();
            container.remove();
        };

        root.render(
            <AlertModal
                alertData={{
                    type: ALERT_TYPES.OK,
                    message,
                }}
                onClose={handleClose}
            />
        );
    });
}
