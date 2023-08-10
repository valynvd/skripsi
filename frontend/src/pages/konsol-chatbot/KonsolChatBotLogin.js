/* eslint-disable no-unused-vars */
import React, {useState , useEffect} from 'react'
import { socket } from '../../socket';
import BreadCrumbs from '../../components/BreadCrumbs';
import { PrimaryButton } from '../../components/PrimaryButton';
import QRCode from "react-qr-code";

const KonsolChatbotLogin = () => {
    const [nomorhp, setPhone] = useState('');
    const [qrstring, setQrs] = useState("");
    const [connected, setConnect] = useState("")

    useEffect(() => {
        socket.on('qr', (qrstring) => {
            console.log(qrstring)
            setQrs((qrstring.qrstring));
        });
        socket.on('status', (connected) => {
            setConnect((connected.connected))
        })
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (nomorhp) {
            socket.emit('login', {nomorhp});
            setPhone('');
        }
    };

    const logout = () => {
        // Handle the button click event here
        socket.emit('signout');
        alert('Logout');
      };

    return (
        <>
            <section id="konsol-chatbotlogin-form" className="section-container">
                <BreadCrumbs
                    links={[
                        {
                            name: 'List Broadcast Pesan',
                            link: '/stem-chatbot/broadcast-pesan',
                        },
                        { 
                            name: 'Login Whatsapp Chatbot'
                        },
                    ]}
                />
                <p className="text-lg font-semibold">
                    Login Whatsapp Chatbot
                </p>

                
                {qrstring ? (
                    <div style={{ height: "auto", margin: "0 auto", maxWidth: 256, width: "100%" }}>
                        <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        
                        value={qrstring}
                        viewBox={`0 0 1920 1920`}
                        />
                    </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                            <input type="text" value={nomorhp} placeholder="Your phone number" onChange={(event) => setPhone(event.target.value)} />

                            <PrimaryButton type='submit'>
                                Masuk
                            </PrimaryButton>
                        </form>
                        
                    )
                }
                
                <div>
                    <PrimaryButton onClick={logout}>
                        Logout from Whatsapp
                    </PrimaryButton>
                    
                </div>
                
            </section>
            
        </>
    )
}

export default KonsolChatbotLogin 