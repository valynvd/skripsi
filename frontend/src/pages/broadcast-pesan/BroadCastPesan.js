import React from "react";
import { useCheckRole } from '../../hooks/useCheckRole';
// import { useQueryClient } from 'react-query';
import BroadcastPesanTable from "./components/BroadcastPesanTable";

const BroadCastPesan = () => {
    const userRole = useCheckRole();
    // const [selectedItem, setSelectedItem] = useState(null);

    return(
        <section id="konsol-chatbot" className="section-container">
            <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
                <p className="font-semibold text-lg">
                    BroadCast Pesan
                    {!userRole.admin}
                </p>
            </div>
            <div className="mt-8 w-full rounded-t-lg">
                {userRole.admin(
                    <BroadcastPesanTable
                        // loading={isLoadingData}
                        // data={responseData?.data ?? []}
                        // setSelectedItem={setSelectedItem}
                        // setOpenModalDelete={setOpenModalDelete}
                    />
                )}
            </div>
        </section>
    );
}

export default BroadCastPesan;