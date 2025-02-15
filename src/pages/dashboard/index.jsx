/* eslint-disable react/react-in-jsx-scope */
import { Fragment, useContext, useEffect, useState } from 'react';
import Classes from "./dashboard.module.css"
import Button from './Button/Button';
import Router from 'next/router';
import getConfig from 'next/config';
import Loader from "../loading"
import jwt_decode from 'jwt-decode';
import Image from 'next/image';
import Header from '../landingpage/Header';
import Footer from '../landingpage/Footer';
import ContestCard from './contestCard/ContestCard';
import WorkshopCard from './workshopCard/WorkshopCard';
import Link from 'next/link';
import { useAuth } from '../../context/auth';
const DashBoard = () => {
    const {state} = useAuth();
    const { isAuthenticated, user } = state;
    const { publicRuntimeConfig } = getConfig();
    const [profileImage, setProfileImage] = useState('');
    const NEXT_PUBLIC_REACT_APP_BACKEND_URI = publicRuntimeConfig.NEXT_PUBLIC_REACT_APP_BACKEND_URI;
    const [isLoading, setIsLoading] = useState(false);
    const [contests, setContests] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [userData, setUserData] = useState({
        name: 'John Doe',
        email: 'foo@foo.com',
        college: 'Foo',
        phone: 'XXXXXXXXXX',
        year: '0',
        instaHandle: '_blah_',
        userType: '-1'
    });
    useEffect(() => {
        const storedImage = sessionStorage.getItem('img');
        if (storedImage) {
            setProfileImage(storedImage);
        }
    }, []);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            Router.push('/');
            return;
        }
        const decodedToken = jwt_decode(token);
        const storedEmail = decodedToken.email;
        setIsLoading(true);

        const fetchUserData = async () => {
            const storedUserData = sessionStorage.getItem('userData');
            if (storedUserData) {
                const parsedUserData = JSON.parse(storedUserData);
                const user = parsedUserData.user.userID || parsedUserData.user; // Adjust this based on your API response structure

                setUserData({
                    name: user.name,
                    email: user.email,
                    college: user.college,
                    phone: user.number,
                    year: user.yearOfStudy,
                    instaHandle: user.instaHandle,
                    userType: user.role,
                    refCode: user.ref_code,
                    timesReferred: user.norefcode,
                });
                setIsLoading(false);
                return;
            }
            try {
                const res = await fetch(NEXT_PUBLIC_REACT_APP_BACKEND_URI + '/api/user', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        email: storedEmail,
                    },
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await res.json();
                console.log(data)
                sessionStorage.setItem('userData', JSON.stringify(data));
                if (data && typeof data === 'object' &&
                    data.user && typeof data.user === 'object' &&
                    data.user.userID && typeof data.user.userID === 'object' &&
                    data.user.userID.userCart !== null) {
                    let cartItems=[];
                    try{
                        cartItems = data.user.userID.userCart.cartItems;
                    }catch(error){
                        console.log("no cart items");
                    }
                    const contestItems = new Set();
                    const workshopItems = new Set();

                    cartItems.forEach((item) => {
                        if (item.Type === 'Contest' && item.payment.status === -1) {
                            const { title, img, id } = item;
                            contestItems.add({ title, img, id });
                        } else if (item.Type === 'Workshop' && item.payment.status === -1) {
                            const { title, img, id } = item;
                            workshopItems.add({ title, img, id });
                        }
                    });
                    setContests([...contests, ...contestItems]);
                    setWorkshops([...workshops, ...workshopItems]);
                    console.log(contests, workshops)
                    sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
                    console.log("cartItems", cartItems);
                } else {

                    console.log("Data or userCart is missing or null.");
                }

                const user = data.user.userID || data.user; // Adjust this based on your API response structure

                setUserData({
                    name: user.name,
                    email: user.email,
                    college: user.college,
                    phone: user.number,
                    year: user.yearOfStudy,
                    instaHandle: user.instaHandle,
                    userType: user.role,
                    refCode: user.ref_code,
                    timesReferred: user.norefcode,
                });

                setIsLoading(false);
            } catch (error) {
                console.error(error);
                alert('Error with authentication, please login again');
                Router.push('/');
            }
        };

        fetchUserData();
    }, []);

    const logOutHandler = () => {
        sessionStorage.clear();
        Router.push('/');
    };
    const reset = () => {
        Router.push("/register");
    }

    if(!isAuthenticated){
        return <h1>Not authenticated. Please log in</h1>
    }

    console.log("state", state);

    return (
        <div>
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <div>
                        <Header />


                        <div className={`${Classes.main} ${Classes.column_2}`}>

                            <div class=" mt-28 w-[80vw] h-auto p-6 justify-center my-6 border mr-5 border-white bg-gradient-to-t from-white/10 to-white/30 text-white rounded-[14px] bg-opacity-10 backdrop-blur-lg  shadow-xl drop-shadow-xl bg-blend-normal z-10 ">
                                <div class="flex flex-col md:flex-row">
                                    <div className=' md:w-1/2 text-center'>

                                        <Image
                                            src={profileImage}
                                            width={100}
                                            height={100}
                                            className=" rounded-full mx-auto mt-14 h-48 w-48 "
                                            alt="signup"
                                        />

                                        <div className='flex items-center mx-auto m'>
                                            <div className='mx-auto mt-14'>
                                                <button className=' text-white font-bold py-1 px-4 rounded-lg text-lg bg-lime-500/20 mx-4' onClick={reset}  >Edit Info</button>
                                                <button className='bg-red-500 hover:bg-red-700 text-white  text-lg rounded-lg font-bold py-1 px-4 ' onClick={logOutHandler}>Logout</button>
                                            </div>
                                        </div>

                                    </div>
                                    <div class="flex items-center justify-center p-6 sm:p-12 md:w-1/2">

                                        <div class="w-full">

                                            <h1 class="mb-12 text-6xl font-bold text-center text-white tracking-normal font-mono">
                                                {userData.name}
                                            </h1>
                                            <form className=''>

                                                <div className='mt-3'>
                                                    <label className="block text-sm">
                                                        Email
                                                    </label>
                                                    <div

                                                        className="w-full  py-2 text-sm font-extrabold"
                                                    >{userData.email}</div>

                                                </div>

                                                <div className='mt-3'>

                                                    <label htmlFor="college" className="block text-sm">
                                                        University / College Name
                                                    </label>
                                                    <div

                                                        className="w-full  py-2 text-sm font-extrabold"
                                                    >{userData.college}</div>

                                                </div>
                                                <div className='mt-3'>
                                                    <label htmlFor="insta" class="block text-sm">
                                                        Phone
                                                    </label>
                                                    <div

                                                        className="w-full  py-2 text-sm font-extrabold"
                                                    >{userData.phone}</div>
                                                </div>

                                                <div className='mt-3'>
                                                    <label htmlFor="insta" class="block text-sm">
                                                        Instagram Handle
                                                    </label>
                                                    <div

                                                        className="w-full  py-2 text-sm font-extrabold"
                                                    >{userData.instaHandle}</div>
                                                </div>
                                                <div className='mt-3'>
                                                    <label htmlFor="insta" class="block text-sm">
                                                        User Type
                                                    </label>
                                                    <div

                                                        className="w-full  py-2 text-sm font-extrabold"
                                                    >{userData.userType == 2 ? 'Campus Ambassador' : 'Participant'}</div>
                                                </div>



                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className=' text-3xl text-white font-mono font-semibold mt-4'>Registered Contests</div>
                            <div className="flex flex-col flex-wrap md:flex-row justify-between p-10  text-[14px]">


                                {
                                    contests.map((contest) => (
                                        <ContestCard
                                            title={contest.title}
                                            imageSrc={'/icon_photo.png'}
                                            key={contest.id}
                                        />
                                    ))
                                }


                                <ContestCard title={'Contest name'} imageSrc={'/icon_photo.png'} />
                                <div class="w-[392px] h-[267px] justify-center my-6 border mx-2 border-white bg-gradient-to-t from-white/10 to-white/30 text-white rounded-[14px] bg-opacity-10 backdrop-blur-lg  shadow-xl drop-shadow-xl bg-blend-normal z-10 ">
                                    <div class="flex flex-col text-center justify-center align-middle px-6 py-4">
                                        <div class=" flex flex-rows justify-around font-bold text-7xl text-black mb-2 my-5"><div>+</div></div>
                                      <Link href="/cart">  
                                        <p class=" my-3.5 h-[180px] text-2xl text-center">
                                            Add more contests
                                        </p>
                                        </Link>

                                    </div>
                                </div>
                            </div>
                            <div className=' text-3xl text-white font-bold  font-mono'>Registered Workshops</div>
                            <div className="flex flex-col flex-wrap md:flex-row justify-between p-10  text-[14px]">
                                {
                                    workshops.map((workshop) => (
                                        <WorkshopCard
                                            title={workshop.title}
                                            imageSrc={'/workshop.png'}
                                            key={workshop.id}
                                        />
                                    ))

                                }

                                <WorkshopCard title={'Workshop name'} imageSrc={'/workshop.png'} />

                                <div class="w-[392px] h-[267px] justify-center my-6 border mx-2 border-white bg-gradient-to-t from-white/10 to-white/30 text-white rounded-[14px] bg-opacity-10 backdrop-blur-lg  shadow-xl drop-shadow-xl bg-blend-normal z-10 ">
                                    <div class="flex flex-col text-center justify-center align-middle px-6 py-4">
                                        <div class=" flex flex-rows justify-around font-bold text-7xl text-black mb-2 my-5"><div>+</div></div>
                                        <Link href="/cart">
                                        <p class=" my-3.5 h-[180px] text-2xl text-center">
                                            Add more workshops
                                        </p>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Footer />
                    </div>

                </>
            )}

        </div>
    );
}

export default DashBoard;

