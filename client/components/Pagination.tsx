interface PaginationProp {
    page: number
    totalPages: number
    toPreviousPage: () => void
    toNextPage: () => void
}

export default function Pagination({page, totalPages, toPreviousPage, toNextPage} : PaginationProp) {
    return (
         <div className="max-w-7xl mx-auto my-12 px-4 text-gray-600 md:px-8">
            <div className="flex gap-4 items-center justify-between text-sm text-gray-600 font-medium">
                <button onClick={() => toPreviousPage()} disabled={page === 0} className="px-4 py-2 border rounded-lg duration-150 hover:bg-gray-50">
                    Previous
                </button>
                <div>
                    Page {page + 1} of {totalPages}
                </div>
                <button onClick={() => toNextPage()} disabled={page + 1 > totalPages} className="px-4 py-2 border rounded-lg duration-150 hover:bg-gray-50">
                    Next
                </button>
            </div>
        </div>
    )
}