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
        clicks = 0;
        constructor(coords, distance, duration){
            
            this.coords = coords; // [lat, lng]
            this.distance = distance; // in km
            this.duration = duration; // in min
            
            
            
        }
        
        _setDescription(){
         
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
        }

        click(){
            this.clicks++;
        }
        
    }

    class Walking extends Workout{
        type = 'walking';
        constructor(coords, distance, duration){
            super(coords, distance, duration);
            this.calcPace();
            this._setDescription();
        }
        
        calcPace(){
            //min/km
            this.pace = this.duration / this.distance;
            return this.pace;
        }
    }
  
    class Running extends Workout{
        type = 'running';
        constructor(coords, distance, duration, cadence){
            super(coords, distance, duration);
            this.cadence = cadence;
            this.calcPace();
            this._setDescription();
        }

        calcPace(){
            //min/km
            this.pace = this.duration / this.distance;
            return this.pace;
        }
    }

    class Cycling extends Workout{
        type = 'cycling';

        constructor(coords, distance, duration, elevationGain){
            super(coords, distance, duration);
            this.elevationGain = elevationGain;
            this._setDescription();
            this.calcSpeed();
        }

        calcSpeed(){
            //km/h
            this.speed = this.distance / (this.duration / 60);
            return this.speed;
        }
    }

    // Testing the classes of Walking/Running/Cycling
    const walk1 = new Walking([34.0522, -118.2437], 5, 60); // 5 km in 60 minutes
    console.log(walk1.pace); // Output: 12 min/km
    const run1 = new Running([39, -12], 5.2, 24, 178);
    const cycle1 = new Cycling([39, -12], 27, 95, 529);

    console.log(run1 , cycle1);
    ////////////////////////
    //Architecture
    class App {
        #map;
        #mapZoomLevel = 13;
        #mapEvent;
        #workouts = [];

        constructor(){
          
            this._getPosition();
            
            //Get data from local storage
            this._getLocalStorage();
            //Event handlers
            form.addEventListener('submit', this._newWorkout.bind(this));
            inputType.addEventListener('change',this._toggleElevationField);
            containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
        
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
            this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

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
        _hideForm(){
            // Empty inputs
            inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
            form.style.display = 'none';
            form.classList.add('hidden');
            setTimeout(() => (form.style.display = 'grid'), 1000 );
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
            //Validate if input is positive
            const positiveValue = (...inputs) => inputs.every(inp => inp > 0);
            //Validate if input is finite
            const validateInput = (...inputs) => 
                inputs.every(inp => Number.isFinite(inp));
            e.preventDefault();
            console.log(this);


            
            //Get form data
            const type = inputType.value;
            const distance = +inputDistance.value;
            const duration = +inputDuration.value;
            const { lat, lng } = this.#mapEvent.latlng;
            let workout;
            //If walking, creating walking object
            if(type === 'walking'){
                //validate input
                if(!validateInput(distance, duration) 
                    || !positiveValue(distance, duration))
                    {
                        return alert('Input have to be positive numbers!');
                    }

                    workout = new Walking([lat, lng], distance, duration);
                    
                }
            //If running, create running object
            if(type === 'running'){
                 
                const cadence = +inputCadence.value;
                //Check if data is valid
                if(!validateInput(distance, duration,cadence) 
                    || !positiveValue(distance, duration,cadence)){
                        return alert('Input have to be positive numbers!');
                }

                workout = new Running([lat, lng], distance, duration, cadence);
                   
            }
            //If cycling, create cycling object
            if(type === 'cycling'){
                const elevation = +inputElevation.value;
                //Check if data is valid
                if(!validateInput(distance, duration, elevation) 
                || !positiveValue(distance, duration))
                    return alert('Input have to be positive numbers!');

                    workout = new Cycling([lat, lng], distance, duration, elevation);
                }

            //Add new workout object to workout array
            this.#workouts.push(workout);

            console.log(workout);
            //Render workout data on map as marker
             this._renderWorkoutMarker(workout);
            
             //Render workout on list
            this._renderWorkout(workout);

            //Hide form + Clear input fields
            this._hideForm();

            //Set local storage to store all workouts 
            this._setLocalStorage();

        }
        _renderWorkoutMarker(workout){
            L.marker(workout.coords).addTo(this.#map)
                 .bindPopup(
                     L.popup({
                         maxWidth: 250,
                         minWidth: 100,
                         autoClose: false,
                         closeOnClick: false,
                         className: `${workout.type}-popup`,
                     })
                 ).setPopupContent(`${{'walking': '🚶', 'running': '🏃‍♂️', 'cycling': '🚴‍♀️'}[workout.type] || ''} 
                                    ${workout.description}`).openPopup();
        }

        _renderWorkout(workout){
            let html = `<li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${{'walking': '🚶', 'running': '🏃‍♂️', 'cycling': '🚴‍♀️'}[workout.type] || ''}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          `;

          if(workout.type === 'walking' )
            html += ` <div class="workout__details">
                <span class="workout__icon">👣</span>
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
            </div>`;

            if(workout.type === 'running')
            html += `
                <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
            </div>

            <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
           
            </li>`;

            if(workout.type ==='cycling')
                html += `
                <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li> 
            `;
            form.insertAdjacentHTML('afterend', html);
            
        }


        _moveToPopup(e){
            const workoutEl = e.target.closest('.workout');
            console.log(workoutEl);

            if(!workoutEl) return;

            const workout = this.#workouts.find(
                work => work.id === workoutEl.dataset.id);
            console.log(workout);

            this.#map.setView(workout.coords, this.#mapZoomLevel, {
                animate: true,
                pan: {
                    duration: 1
                }
            });

            workout.click();
        }

        _setLocalStorage(){
            localStorage.setItem('workouts', JSON.stringify(this.#workouts));
        }

        _getLocalStorage(){
            const data = JSON.parse(localStorage.getItem('workouts'));
            console.log(data);

            if(!data) return;

            this.#workouts = data;
            this.#workouts.forEach(work => {
                this._renderWorkout(work);
                this._renderWorkoutMarker(work);
            });
        }
    }

    const app = new App();


    app._getPosition();

            
