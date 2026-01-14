/**
 * Modal dialog for creating a new event under a selected category.
 * Collects basic event fields (title/description) and submits them via a parent-provided handler.
 */
export default function CreateEventModal(
    categoryName=categoryName,
    handleFormSubmit=handleFormSubmit,
    setName=setName,
    description=description,
    setDescription=setDescription,
    closeModal=closeModal,

) {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-xl font-bold mb-4">Skapa event för {categoryName}</h3>
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Titel</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="T.ex. Föreläsning"
                            autoFocus
                        />
                        <label className="block text-sm font-medium text-gray-700">Beskrivning</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="T.ex. Föreläsning om..."
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                            Lägg till händelse
                        </button>
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
                            Avbryt
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}