import { Component, NgZone } from '@angular/core';
import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationResponse,
  BackgroundGeolocationEvents
} from "@ionic-native/background-geolocation/ngx";
import { HTTP } from "@ionic-native/http/ngx";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  logs: string[] = [];
  gps_update_link: string = "http://appseguimiento.syspotec.co/api/values";
  state: boolean = false;

  constructor(
    private backgroundGeolocation: BackgroundGeolocation,
    private http: HTTP,
    private zone: NgZone
    ) {}

  ngOnInit(){
  }

  prueba(){
    this.state = !this.state;
    console.log(this.state);
    if (this.state) {
      this.startBackgroundGeolocation();
    } else {
      this.stopBackgroundGeolocation();
    }
  }

  /**
   * Empieza startBackgroundGeolocation
   */
  startBackgroundGeolocation(){
    console.log("Ingreso a startbackground...");
    this.backgroundGeolocation.checkStatus()
    .then( rta =>{
      if(rta){
        this.start();
      }else {
        this.backgroundGeolocation.showLocationSettings();
      }
    })
  }

  /**
   * Empieza el proceso Background Geolocation
   */
  start() {
    console.log("Ingreso a start...")
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10, // Es valor posible de [0, 10, 100, 1000] entre más bajo la precisión en metros obtenida por el plugin será mejor.
      stationaryRadius: 20, // Es un valor en un radio en metros donde el plugin se activará o enviara una respuesta.
      distanceFilter: 1, // Es un valor en la distancia (horizontales) en metros donde el plugin se activará o enviara una respuesta.
      debug: true, // Esta opción permite tener más información acerca de la respuesta y agrega un sonido cada vez que detecta un nuevo registro.
      stopOnTerminate: false, // Si está en true la tarea de background-geolocation se detendrá si la aplicación es cerrada o sacada de segundo plano. Recordemos que el plugin funciona en modo background y foreground.
      maxLocations: 1000000, // Limit maximum number of locations stored into db
       // Android only section
      locationProvider: 1, // Es la técnica usada para detectar los cambios de posición la técnica que usaremos será ACTIVITY_PROVIDER = 1, puedes ver qué provider escoger aquí: PROVIDERS
      startForeground: true, // Habilita la detección de cambio de posición cuando la app está en segundo plano.
      interval: 5000, // Será el mínimo de tiempo que el plugin estará solicitando la posición al dispositivo. Debemos tener en cuenta que los valores de tiempo van condicionados con los de distancia. Es decir si el dispositivo no detecta el movimiento x metros en x tiempo no solicitá la posición.
      fastestInterval: 5000,
      activitiesInterval: 10000,
      url: 'http://appseguimiento.syspotec.co/api/values',
      syncThreshold: '100',
      syncUrl: 'http://appseguimiento.syspotec.co/api/values',
      httpHeaders: { 'X-FOO': 'bar' },
      notificationTitle: 'Background tracking',
      notificationText: 'Share your location',
      postTemplate: {
        id: '@id',
        lat: '@latitude',
        lon: '@longitude',
        time: '@time'
      },
      notificationsEnabled: true // Enable/disable local notifications when tracking and syncing locations
    };

    // this.backgroundGeolocation
    //   .on(BackgroundGeolocationEvents.stationary)
    //   .subscribe((location: BackgroundGeolocationResponse) => {
    //     // handle stationary locations here
    //   });

    // this.backgroundGeolocation.start();
    // this.backgroundGeolocation.onStationary().then().catch();
    // this.backgroundGeolocation.stop();
    // this.backgroundGeolocation
    //   .on(BackgroundGeolocationEvents.background)
    //   .subscribe((location: BackgroundGeolocationResponse) => {
    //     console.log('[INFO] App is in background');
    //   });
    // this.backgroundGeolocation.checkStatus()
    //   .then(status => {
    //     console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
    //     console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
    //     console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);
    //   })
    //   .catch();

    this.backgroundGeolocation
      .configure(config)
      .then(()=> {
        this.backgroundGeolocation
          .on(BackgroundGeolocationEvents.location)
          .subscribe((location: BackgroundGeolocationResponse) => {
            //this.sendGPS(location);
            // Run update inside of Angular's zone
            this.zone.run(() => {
              this.logs.push(`${location.latitude}, ${location.longitude}`);
              console.log(location)
            });
            
            // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
            // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
            // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
            //this.backgroundGeolocation.finish(); // FOR IOS ONLY
        })
      });

    // start recording location
    this.backgroundGeolocation.start();
  }

  /**
   * If you wish to turn OFF background-tracking, call the #stop method.
   */
  stopBackgroundGeolocation(){
    console.log("Ingreso a stop...");
    this.backgroundGeolocation.stop();
  }

  sendGPS(location: BackgroundGeolocationResponse) {
    
    //alert(`Metodo sendGps: ${location.latitude}, ${location.longitude}`)
    // if (location.speed == undefined) {
    //   location.speed = 0;
    // }
    // let timestamp = new Date(location.time);

    // this.http
    //   .post(
    //     this.gps_update_link, // backend api to post
    //     {
    //       lat: location.latitude,
    //       lng: location.longitude,
    //       speed: location.speed,
    //       timestamp: timestamp
    //     },
    //     {}
    //   )
    //   .then(data => {
    //     console.log(data.status);
    //     console.log(data.data); // data received by server
    //     console.log(data.headers);
    //     this.backgroundGeolocation.finish(); // FOR IOS ONLY
    //   })
    //   .catch(error => {
    //     console.log(error.status);
    //     console.log(error.error); // error message as string
    //     console.log(error.headers);
    //     this.backgroundGeolocation.finish(); // FOR IOS ONLY
    //   });
  }

  Toogle(){
    console.log("Evento toogle")
  }
}
