"use client"

export default function SearchInput({ placeholder }) {
  return (
    <>
      <input
        id="searchBarDashboard"
        type="text"
        className={`w-full md:min-w-[100px] lg:min-w-[100px] border flex flex-auto md:flex-1  py-2.5 text-xs  pl-2 bg-[white] rounded-lg focus:outline-none placeholder-[#AEA8A8] 
        placeholder:text-center md:placeholder:text-left md:placeholder:pl-0
        `}
        placeholder={placeholder}
      />
    </>
  );
}