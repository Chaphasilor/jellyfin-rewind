<div class="relative">
    <div class="absolute top-0 left-0 w-full h-1rem pt-10 pb-10 flex flex-col items-center justify-center gap-12 bg-[#121212AB]">
        <span class="text-4xl text-[#00A4DC] tracking-wider font-semibold -rotate-15">
            Unavailable
        </span>
        <button
            on:click|stopPropagation={() => {
                //TODO showOverlayFeatureUnavailableMissingPlaybackReporting
            }}
            class="w-32 rounded-md flex flex-row items-center justify-around px-2 py-1 bg-white text-gray-900"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 icon icon-tabler icon-tabler-info-square-rounded"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 8h.01"></path>
                <path d="M11 12h1v4h1"></path>
                <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"></path>
            </svg>
            <span class="font-medium">Learn why</span>
        </button>
    </div>
</div>
