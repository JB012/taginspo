interface PaginationProp {
    page: number
    meta: {
        page: number
        size: number //number of records in a page
        totalPages: number
    }
    toPreviousPage: () => void
    toNextPage: () => void
    toNthPage: (n : number) => void
}

export default function Pagination({page, meta, toPreviousPage, toNextPage, toNthPage} : PaginationProp) {
    const pages = initializePageArray();
    
    function initializePageArray() : number[] {
        const totalPages = meta.totalPages;
        const currPage = page;
        let arr : number[] = [];
        
        if (currPage < totalPages) {
            if (currPage + 10 <= totalPages) {
                arr = [...Array(10).keys()].map( i => (currPage + i - 1));
            }
            else {
                arr = [...Array(totalPages).keys()];
            }
        }

        return arr;
    }

    return (
        <div className="max-w-7xl mx-auto mt-12 px-4 text-gray-600 md:px-8">
            <div className="hidden items-center justify-between sm:flex" aria-label="Pagination">
                <button onClick={() => toPreviousPage()} className="hover:text-indigo-600 flex items-center gap-x-2" disabled={page === 0}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M18 10a.75.75 0 01-.75.75H4.66l2.1 1.95a.75.75 0 11-1.02 1.1l-3.5-3.25a.75.75 0 010-1.1l3.5-3.25a.75.75 0 111.02 1.1l-2.1 1.95h12.59A.75.75 0 0118 10z" clipRule="evenodd" />
                    </svg>
                    Previous
                </button>
                <ul className="flex items-center gap-1">
                    {
                        pages.map((item, idx) => (
                            <li key={item} className="text-sm">
                                {
                                    <button onClick={() => toNthPage(idx)} aria-current={page === item ? "page" : false} className={`px-3 py-2 rounded-lg duration-150 hover:text-indigo-600 hover:bg-indigo-50 ${page == item ? "bg-indigo-50 text-indigo-600 font-medium" : ""}`}>
                                        {item + 1}
                                    </button>
                                }
                            </li>
                        ))
                    }
                </ul>
                <button onClick={() => toNextPage()} disabled={page + 1 > meta.totalPages} className="hover:text-indigo-600 flex items-center gap-x-2">
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            {/* On mobile version */}
            <div className="flex items-center justify-between text-sm text-gray-600 font-medium sm:hidden">
                <button onClick={() => toPreviousPage()} className="px-4 py-2 border rounded-lg duration-150 hover:bg-gray-50">Previous</button>
                <div className="font-medium">
                    Page {page + 1} of {pages.length}
                </div>
                <button onClick={() => toNextPage()} className="px-4 py-2 border rounded-lg duration-150 hover:bg-gray-50">Next</button>
            </div>
        </div>
    )
}