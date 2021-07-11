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
        console.log(data)
        return data
    },
    createReservation: async (payload) => {
        const {data } = await instance.post('/reservations/create', payload)
        console.log(data)
        return data

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
        }
    },
    methods: {
        async sendReservation() {
            try {
                const data = await api.sendReservation(this.preparedReservation)
                console.log(data)
                this.confirmService = data;
                const reservation = await api.createReservation(this.createReservationData)
                console.log(reservation)
            } catch(e) {
                console.log(e)
            }
        }
    },
    watch: {
        reservation: {
            deep: true,
            handler() {
                console.log(this.reservation)
                console.log(this.serviceStart)
            }
        }
    }
})
