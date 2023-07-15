import React from "react";
import { useCheckRole } from '../../hooks/useCheckRole';
// import { useQueryClient } from 'react-query';
// import ModalDelete from '../../components/ModalDelete';
// import useAuth from '../../hooks/useAuth';
import KonsolChatbotTable from "./components/KonsolChatbotTable";

const KonsolChatbot = () => {
    const userRole = useCheckRole();
    // const [selectedItem, setSelectedItem] = useState(null);
    // const queryClient = useQueryClient();
    // const userData = useAuth();

    return(
        <section id="konsol-chatbot" className="section-container">
            <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
                <p className="font-semibold text-lg">
                    Konsol ChatBot
                    {!userRole.admin}
                </p>
            </div>
            <div className="mt-8 w-full rounded-t-lg">
                {userRole.admin(
                    <KonsolChatbotTable
                        // loading={isLoadingData}
                        // data={responseData?.data ?? []}
                        // setSelectedItem={setSelectedItem}
                        // setOpenModalDelete={setOpenModalDelete}
                    />
                )}
            </div>
        </section>
    );
};

export default KonsolChatbot;