export const endpoint = 'https://minhhungcar.xyz';
export const apiAccount = {
    //method: get
    getProfile: `${endpoint}/profile`,
    getDrivingLicense: `${endpoint}/customer/driving_license`,

    //method: post
    registerCustomer: `${endpoint}/customer/register`,
    verifyOTP: `${endpoint}/user/otp`,
    login: `${endpoint}/login`,
    uploadProfileAvatar: `${endpoint}/user/avatar/upload`,
    uploadDrivingLicense: `${endpoint}/customer/driving_license`,

    //method: put
    updateProfile: `${endpoint}/profile`


};

export const apiCar = {
    // method: get
    filterCar: `${endpoint}/customer/cars`,
    fetchMetaData: `${endpoint}/register_car_metadata`,
    fetchSuggestCar: `${endpoint}/customer/suggested_cars`,

    //method: post
    rentCar: `${endpoint}/customer/rent`,

    //method: put
    agreeContract: `${endpoint}/customer/contract/agree`


}

export const apiPayment = {
    //method: get
    getPaymentInfo: `${endpoint}/payment_info`,
    getBankData: `${endpoint}/banks`,

    //method: post
    uploadQR: `${endpoint}/payment_info/qr`,

    //method: put
    updatePaymentInfo: `${endpoint}/payment_info`,
}

export const apiDocument = {
    //method: get
    getDrivingLicenseImage: `${endpoint}/customer/driving_license`,
}

export const apiChat = {
    chat: `wss://minhhungcar.xyz/chat`
}

export const apiExpoToken = {
    expoPushToken: `${endpoint}/customer/expo_push_token`,
}