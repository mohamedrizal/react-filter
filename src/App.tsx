import {
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router-dom";


const getPersistedFilters = () => {
  try {
    const stored = localStorage.getItem("regionFilters");
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
};

export const loader = async ({ request }) => {
  const res = await fetch("/data/indonesia_regions.json");
  const { provinces, regencies, districts } = await res.json();

  const url = new URL(request.url);
  const persistedFilters = getPersistedFilters();

  const provinceId = url.searchParams.get("province") || persistedFilters.provinceId || null;
  const regencyId = url.searchParams.get("regency") || persistedFilters.regencyId || null;
  const districtId = url.searchParams.get("district") || persistedFilters.districtId || null;

  const selectedProvince = provinces.find((p) => p.id === Number(provinceId));
  const filteredRegencies = provinceId
    ? regencies.filter((r) => r.province_id === Number(provinceId))
    : [];

  const selectedRegency = filteredRegencies.find((r) => r.id === Number(regencyId));
  const filteredDistricts = regencyId
    ? districts.filter((d) => d.regency_id === Number(regencyId))
    : [];
    
  const selectedDistrict = filteredDistricts.find((d) => d.id === Number(districtId));

  localStorage.setItem(
    "regionFilters",
    JSON.stringify({ provinceId, regencyId, districtId })
  );

  return {
    provinces,
    filteredRegencies,
    filteredDistricts,
    selectedProvince,
    selectedRegency,
    selectedDistrict,
  };
};

function App() {
  const {
    provinces,
    filteredRegencies,
    filteredDistricts,
    selectedProvince,
    selectedRegency,
    selectedDistrict,
  } = useLoaderData();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newParams = new URLSearchParams(searchParams);

    if (name === "province") {
      newParams.set("province", value);
      newParams.delete("regency");
      newParams.delete("district");
    } else if (name === "regency") {
      newParams.set("regency", value);
      newParams.delete("district");
    } else if (name === "district") {
      newParams.set("district", value);
    }

    navigate(`?${newParams.toString()}`);
  };

  const handleReset = () => {
    localStorage.removeItem("regionFilters");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFC] flex">
      <aside className="w-1/5 bg-white p-[30px] border-r-[2px] border-[#F1F2F4] flex flex-col gap-y-[50px]">
        <h1 className="text-[20px] font-bold mb-2 flex items-center gap-[20px] m-[0px]">
          <span className="bg-[#E1F0F9] rounded-[20px] flex items-center justify-center w-[60px] h-[60px] sidebar-head-icon">
            <i className="fa-solid fa-earth-africa text-[30px] text-[#2B8CEC]"></i>
          </span>
          Frontend Assessment
        </h1>

        <div className="sidebar-form-wrap">
          <p className="text-[#9DA6B9] mb-0 mt-0">
            FILTER WILAYAH
          </p>

          <form>
            <div className="mb-[20px]">
              <label htmlFor="province" className="block text-sm font-[700] text-[#65738C] mb-[10px]">PROVINSI</label>
              <div className="relative border-[2px] border-[#757682] rounded-[15px]">
                <i className="text-[20px] text-[#9DA6B9] absolute top-[50%] left-[20px] translate-y-[-50%] fa-regular fa-map"></i>
                <i className="text-[12px] text-[#9DA6B9] absolute top-[50%] right-[20px] translate-y-[-50%] fa-solid fa-chevron-down"></i>
                <select
                  id="province"
                  name="province"
                  value={selectedProvince?.id || ""}
                  onChange={handleFilterChange}
                  className="w-full h-[50px] pl-[50px] pr-[20px] border-[0px] bg-transparent text-[#0E172A] text-[16px] appearance-none outline-none"
                >
                  <option value="">Pilih Provinsi</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-[20px]">
              <label htmlFor="regency" className="block text-sm font-[700] text-[#65738C] mb-[10px]">KOTA/KABUPATEN</label>
              <div className="relative border-[2px] border-[#757682] rounded-[15px]">
                <i className="text-[20px] text-[#9DA6B9] absolute top-[50%] left-[20px] translate-y-[-50%] fa-solid fa-city"></i>
                <i className="text-[12px] text-[#9DA6B9] absolute top-[50%] right-[20px] translate-y-[-50%] fa-solid fa-chevron-down"></i>
                <select
                  id="regency"
                  name="regency"
                  value={selectedRegency?.id || ""}
                  onChange={handleFilterChange}
                  disabled={!selectedProvince}
                  className="w-full h-[50px] pl-[50px] pr-[20px] border-[0px] bg-transparent text-[#0E172A] text-[16px] appearance-none outline-none"
                >
                  <option value="">Pilih Kota/Kabupaten</option>
                  {filteredRegencies.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-[20px]">
              <label htmlFor="district" className="block text-sm font-[700] text-[#65738C] mb-[10px]">KECAMATAN</label>
              <div className="relative border-[2px] border-[#757682] rounded-[15px]">
                <i className="text-[20px] text-[#9DA6B9] absolute top-[50%] left-[20px] translate-y-[-50%] fa-solid fa-location-dot"></i>
                <i className="text-[12px] text-[#9DA6B9] absolute top-[50%] right-[20px] translate-y-[-50%] fa-solid fa-chevron-down"></i>
                <select
                  id="district"
                  name="district"
                  value={selectedDistrict?.id || ""}
                  onChange={handleFilterChange}
                  disabled={!selectedRegency}
                  className="w-full h-[50px] pl-[50px] pr-[20px] border-[0px] bg-transparent text-[#0E172A] text-[16px] appearance-none outline-none"
                >
                  <option value="">Pilih Kecamatan</option>
                  {filteredDistricts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-[30px] pt-[30px] border-t-[2px] border-[#F1F2F4] filter-button-wrap">
              <button
                type="button"
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-[10px] py-[15px] bg-[#F1F5FB] text-[#0E172A] font-bold rounded-[10px] border-[#2B8CEC] hover:bg-[#E1F0F9] cursor-pointer"
              >
                <i className="fa-solid fa-filter-circle-xmark"></i>
                RESET
              </button>
            </div>
          </form>
        </div>

      </aside>

      <div className="w-4/5 p-8 flex flex-col">
        <nav className="breadcrumb flex items-center gap-x-[10px] bg-[#ffffff] border-b-[2px] border-[#F1F2F4] pl-[20px] pr-[20px] min-h-[80px]">
          <span className={!selectedProvince && !selectedRegency && !selectedDistrict ? "text-[14px] text-[#2B8CEC]" : "text-[14px] text-[#9DA6B9]"}>Indonesia</span>
          {selectedProvince && (
            <>
              <span className="mx-2 text-[14px] text-[#9DA6B9]">&gt;</span>
              <span className={!selectedRegency && !selectedDistrict ? "text-[14px] text-[#2B8CEC]" : "text-[14px] text-[#9DA6B9]"}>
                {selectedProvince.name}
              </span>
            </>
          )}
          {selectedRegency && (
            <>
              <span className="mx-2 text-[14px] text-[#9DA6B9]">&gt;</span>
              <span className={!selectedDistrict ? "text-[14px] text-[#2B8CEC]" : "text-[14px] text-[#9DA6B9]"}>
                {selectedRegency.name}
              </span>
            </>
          )}
          {selectedDistrict && (
            <>
              <span className="mx-2 text-[14px] text-[#9DA6B9]">&gt;</span>
              <span className="text-[14px] text-[#2B8CEC]">
                {selectedDistrict.name}
              </span>
            </>
          )}
        </nav>

        <main className="text-center m-auto">
          {selectedProvince ? (
            <>
              <div className="mb-[20px]">
                <p className="text-[14px] text-[#2B8CEC] tracking-[3.5px] mt-[0px] mb-[15px]">PROVINSI</p>
                <h2 className="text-[#0E172A] text-[60px] font-bold mt-[0px] mb-[0px]">{selectedProvince.name}</h2>
              </div>

              {selectedRegency && (
                <>
                  <div className="mb-[20px]">
                    <div className="arrow-icon mb-[20px]">
                      <i className="fa-solid fa-arrow-down text-[#9DA6B9]"></i>
                    </div>
                    <p className="text-[14px] text-[#2B8CEC] tracking-[3.5px] mt-[0px] mb-[15px]">KOTA / KABUPATEN</p>
                    <h2 className="text-[#0E172A] text-[60px] font-bold mt-[0px] mb-[0px]">{selectedRegency.name}</h2>
                  </div>

                  {selectedDistrict && (
                    <>
                      <div className="arrow-icon mb-[20px]">
                        <i className="fa-solid fa-arrow-down text-[#9DA6B9]"></i>
                      </div>
                      <p className="text-[14px] text-[#2B8CEC] tracking-[3.5px] mt-[0px] mb-[15px]">KECAMATAN</p>
                      <h2 className="text-[#0E172A] text-[60px] font-bold mt-[0px] mb-[0px]">{selectedDistrict.name}</h2>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <p className="text-[#0E172A] text-[60px] text-center">Silakan pilih wilayah dari <br /> filter di sebelah kiri.</p>
          )}
        </main>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: loader,
  },
]);

export default function Root() {
  return <RouterProvider router={router} />;
}
