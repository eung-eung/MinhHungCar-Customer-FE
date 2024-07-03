import { View, Text, SafeAreaView, Alert } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { AuthConText } from '@/store/AuthContext';
import axios from 'axios';

interface Trip {
    id: number,
    car: {
        car_model: {
            brand: string,
            model: string,
            year: number
        },
        license_plate: string,
    },
    start_date: string;
    end_date: string;
    status: string,
    reason: string,
    rent_price: number,
    insurance_amount: number,
}



export default function detailTrip() {
    const router = useRouter()
    const authCtx = useContext(AuthConText);
    const token = authCtx.access_token;

    const params = useLocalSearchParams();
    const { contractID, tripStatus } = params;

    const contractIDNumber = contractID ? Number(contractID) : 0;

    const [trips, setTrips] = useState<Trip[]>([]);
    const [detailTrip, setDetailTrip] = useState<Trip | undefined>(undefined);

    useEffect(() => {
        getDetailTrip();
    }, [tripStatus, contractID]);

    const getDetailTrip = async () => {
        try {
            const response = await axios.get(`https://minhhungcar.xyz/customer/activities?status=${tripStatus}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.error_code === 100) {
                console.log('Fetch trip list success: ', response.data.message);
                const fetchedTrips: Trip[] = response.data.data;
                setTrips(fetchedTrips);
                const detail = fetchedTrips.find((trip) => trip.id === contractIDNumber);
                setDetailTrip(detail);
            }
        } catch (error: any) {
            if (error.response.data.error_code === 10066) {
                console.log('Error get activities: ', error.response.data.message);
                Alert.alert('', 'Không thể xem chi tiết chuyến đi lúc này');
            } else {
                Alert.alert('', 'Có vài lỗi xảy ra. Vui lòng thử lại sau!');
                console.log('Error get activities: ', error.response.data.message);
            }
        }
    };

    return (
        <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
            <Text>detailTrip</Text>
            {/* Status tab */}

            {/* Content */}

        </SafeAreaView>
    )
}