const apiUrl = 'http://localhost:5000'
// const api = {
//     getTypesOfServices: () => {
//         axio
//     }
// }
const instance = axios.create({
    baseURL: apiUrl,
    timeout: 20000,
  });
  const api = {
    getTypesOfServices: async () => {
        const { data } = await instance.get('/type-of-service')
        
        return data
    },
    sendReservation: async (payload) => {
        const {data } = await instance.post('/service/signon', payload)
        return data
    },
    createReservation: async (payload) => {
        const {data } = await instance.post('/reservations/create', payload)
        return data
    },
    sendTokenSms: async (token) => {
        const { data } = await instance.post('/reservations/confirm', {
            pin: token
        })
        return data;
    },
    getNextAvailableDates: async (serviceStart, type) => {
        console.log(serviceStart)
        console.log(type)
        const { data } = await instance.post('service/find/availabledates', {
            serviceStart: serviceStart, 
            type: type
        })
        return data.availabaleDates
    }
  }
const app = new Vue({
    el: '#app',
    data: {
        typesOfServices: null,
        selectedDate: null,
        selectedTime: null,
        reservation: {
            serviceType: null,
        },
        confirmService: null,
        reservationId: null,
        client: null,
        type: null,
        service: null,
        nextDates: [],
        // Popups
        isTokenPopup: false,
        isConfirmPopup: false,
        isSummaryPopup: false,
        isCalendarPopup: false
    },
    async created() {
        const data = await api.getTypesOfServices();
        this.typesOfServices = data;
    },
    computed: {
        serviceStart() {
            return moment(`${this.selectedDate} ${this.selectedTime}`, 'YYYY-MM-DD HH:mm')
        },
        preparedReservation() {
            return {
                name: this.reservation.name ,
                surname: this.reservation.surname ,
                phoneNumber: this.reservation.phoneNumber ,
                serviceType: this.reservation.serviceType ,
                serviceStart: this.serviceStart
            }
        },
        createReservationData() {
            return {
                clientName: this.reservation.name,
                clientSurname: this.reservation.surname,
                clientPhone: this.reservation.phoneNumber,
                serviceId: this.confirmService.id
            }
        },
    },
    methods: {
        pickNextDate(date) {
            this.selectedDate = moment(date).format("YYYY-MM-DD")
            this.selectedTime = moment(date).format("HH:mm")
            this.$forceUpdate();
            console.log(this.reservation)
            console.log(this.preparedReservation)
        },
        async sendReservation() {
            try {
                const data = await api.sendReservation(this.preparedReservation)
                this.confirmService = data;
                const { id } = await api.createReservation(this.createReservationData)
                this.reservationId = id;
                this.isTokenPopup = true;
                this.isCalendarPopup = false
            } catch(e) {
                const dates = await api.getNextAvailableDates(this.preparedReservation.serviceStart, this.preparedReservation.serviceType)
                this.nextDates = dates;
                this.isCalendarPopup = true;
            }
        },
        getTokenInputValues() {
            let token = ''
            for(let i=1; i<=5; i++) {
                token += this.$refs[`token${i}`].value
            }
            return token
        },
        getVerboseDate(date) {
           return moment(date).format('DD/MM/YYYY HH:mm') 
        },
        async sendTokenSms() {
            const token = this.getTokenInputValues();
            try {
                const data = await api.sendTokenSms(token)
                this.client = data.client
                this.type = data.type
                this.service = data.service
                if(data.status === 'ok') {
                    this.isTokenPopup = false
                    this.positiveAuth();
                }
            }catch(e) {
                console.log(e)
            }
        },
        positiveAuth() {
            this.isConfirmPopup = true
            setTimeout(() => {
                this.isSummaryPopup = true
                this.isConfirmPopup = false
              }, 3000);
      
        }
    },
    // watch: {
    //     reservation: {
    //         deep: true,
    //         handler() {
    //         }
    //     }
    // }
})
