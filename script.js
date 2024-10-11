    'use strict';

    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const form = document.querySelector('.form');
    const containerWorkouts = document.querySelector('.workouts');
    const inputType = document.querySelector('.form__input--type');
    const inputDistance = document.querySelector('.form__input--distance');
    const inputDuration = document.querySelector('.form__input--duration');
    const inputCadence = document.querySelector('.form__input--cadence');
    const inputElevation = document.querySelector('.form__input--elevation');

    let map, mapEvent;


    class Workout{
        date = new Date();
        id = (new Date() + ''.slice(-10));

        constructor(coords, distance, duration){
            
            this.coords = coords; // [lat, lng]
            this.distance = distance; // in km
            this.duration = duration; // in min
            
            
        }
        
    }

    class Walking extends Workout{
        constructor(coords, distance, duration){
            super(coords, distance, duration);
            this.calcPace();

        }
        
        calcPace(){
            //min/km
            this.pace = this.duration / this.distance;
            return this.pace;
        }
    }
  
    class Running extends Workout{
        constructor(coords, distance, duration, cadence){
            super(coords, distance, duration);
            this.cadence = cadence;
            this.calcPace();
        }

        calcPace(){
            //min/km
            this.pace = this.duration / this.distance;
            return this.pace;
        }
    }

    class Cycling extends Workout{
        constructor(coords, distance, duration, elevationGain){
            super(coords, distance, duration);
            this.elevationGain = elevationGain;
            this.calcSpeed();
        }

        calcSpeed(){
            //km/h
            this.speed = this.distance / (this.duration / 60);
            return this.speed;
        }
    }

    // Testing the classes of Walking/Running/Cycling
    // const walk1 = new Walking([34.0522, -118.2437], 5, 60); // 5 km in 60 minutes
    // console.log(walk1.pace); // Output: 12 min/km
    // const run1 = new Running([39, -12], 5.2, 24, 178);
    // const cycle1 = new Cycling([39, -12], 27, 95, 529);

    // console.log(run1 , cycle1);
    ////////////////////////
    //Architecture
    class App {
        #map;
        #mapEvent;

        constructor(){
            this._getPosition();
        
            form.addEventListener('submit', this._newWorkout.bind(this));
            inputType.addEventListener('change',this._toggleElevationField);
        }

        _getPosition(){
            if(navigator.geolocation)
                navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
                    alert('Could not get your position');
                });
        }

        _loadMap(position){
            const {latitude} = position.coords;
            const {longitude} = position.coords;
            console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
            
            const coords = [latitude, longitude];
          
            console.log(this);
            this.#map = L.map('map').setView(coords, 13);

            L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(this.#map);

            //Handling map clicks
            this.#map.on('click', this._showForm.bind(this));
        }

        _showForm(mapE){
            this.#mapEvent = mapE;
            form.classList.remove('hidden');
            inputDistance.focus();
        }

        _toggleElevationField(){
            // Check the selected workout type
            if(inputType.value === 'walking'){
                inputElevation.closest('.form__row').classList.add('form__row--hidden');
                inputCadence.closest('.form__row').classList.add('form__row--hidden');

            }else if (inputType.value === 'running') {
                inputCadence.closest('.form__row').classList.remove('form__row--hidden');
                inputElevation.closest('.form__row').classList.add('form__row--hidden');
            } else if (inputType.value === 'cycling') {
                inputCadence.closest('.form__row').classList.add('form__row--hidden');
                inputElevation.closest('.form__row').classList.remove('form__row--hidden');
            }
        }
       

        _newWorkout(e){
            const validateInput = (...inputs) => 
                inputs.every(inp => Number.isFinite(inp));
            e.preventDefault();
            console.log(this);

            //Get form data
            const type = inputType.value;
            const distance = +inputDistance.value;
            const duration = +inputDuration.value;

            //If walking, creating walking object
            if(type === 'walking'){
                //validate input
                if(!validateInput(distance, duration))
                    return alert('Input have to be positive numbers!');
            }
            //If running, create running object
            if(type === 'running'){
                 
                const cadence = +inputCadence.value;
                //Check if data is valid
                if(!validateInput(distance, duration,cadence))
                    return alert('Input have to be positive numbers!');
            }
            //If cycling, create cycling object
            if(type === 'cycling'){
                const elevation = +inputElevation.value;
                //Check if data is valid
                if(!validateInput(distance, duration, elevation))
                    return alert('Input have to be positive numbers!');
            }
            //Add new workout object to workout array
            //Render workout data on map as marker
             const { lat, lng } = this.#mapEvent.latlng;
             L.marker([lat, lng]).addTo(this.#map)
                 .bindPopup(
                     L.popup({
                         maxWidth: 250,
                         minWidth: 100,
                         autoClose: false,
                         closeOnClick: false,
                         className: 'running-popup',
                     })
                 ).setPopupContent('Workout').openPopup();
            //Render workout on list

            //Hide form + Clear input fields
            inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

           
        }
    }

    const app = new App();


    app._getPosition();

            
