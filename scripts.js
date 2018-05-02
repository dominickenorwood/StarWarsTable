class StarWarsTable {
  constructor(config) {
    this.config = config;

    // Reach out to endpoint and build table when a response is returned.
    this.setData(this.config.url)
      .then(this.setHumans.bind(this))
      .then(this.render.bind(this));
  }

  // Convert inches to meters
  getMeters(inches) {
    return inches === 'unknown' ? '---' : `${Math.round((parseInt(inches) * .0254) * 100) / 100}<i>m</i>`;
  }

  // Return kg text
  getKilograms(mass) {
    return mass === 'unknown' ? '---' : `${mass}<i>kg</i>`;
  }

  // Reach out and fetch endpoint.
  fetchData(url) {
    return fetch(url).then((resp) => resp.json());
  }

  // If fetch is successful move on to fetch and resolve endpoints for
  // the list of humans.
  async setData(url) {
    try {
      const _fetchedData = await this.fetchData(url);
      this.data = _fetchedData;
      const _fetchHumans = await this.data.people.map(person => this.fetchData(person));
      const _resolveHumans = await Promise.all(_fetchHumans)
      return _resolveHumans;

    } catch (error){
      console.log(error);
      return error;
    }
  }

  // Set this components human property.
  setHumans(data) {
    this.humans = this.buildHumans(data);
  }

  // Map out a human object with each key being a humans name (last name first).
  // Each property is the object with all the humans attributes.
  buildHumans(array) {
    const _map = {};
    for(let person of array){
      const _key = person.name.split(' ').reverse().join('_').toLowerCase();
      _map[_key] = person;
    }
      return _map;
  }

  // Loops through list of human objects and builds an array of table rows
  // with the humans name, height, mass and hair color.
  // Returns a string of HTML.
  buildHumanList(humans) {
    const _sorted = Object.keys(humans).sort();
    const _list = _sorted.map(human => {
      return (
        `<tr class="swTable__row">
          <td class="swTable__cell"><span>${humans[human].name}</span></td>
          <td class="swTable__cell"><span>${this.getMeters(humans[human].height)}</span></td>
          <td class="swTable__cell"><span>${this.getKilograms(humans[human].mass)}</span></td>
          <td class="swTable__cell"><span>${humans[human].hair_color}</span></td>
        </tr>`
      )
    })
    return _list.join('');
  }

  // Dashboard contains a summary of tallest human, common hair color
  // and average mass.
  get dashboard(){
    return (
      `<div class="swTable__dashbox">
        <div class="swTable__dash-heading">Tallest Human</div>
        <div class="swTable__dash-result">${this.findTallestHuman(this.humans).name} @ ${this.getMeters(this.findTallestHuman(this.humans).height)}</div>
      </div>
      <div class="swTable__dashbox">
        <div class="swTable__dash-heading">Most Common Hair Color</div>
        <div class="swTable__dash-result">${this.findCommonHairColor(this.humans)}</div>
      </div>
      <div class="swTable__dashbox">
        <div class="swTable__dash-heading">Average Mass</div>
        <div class="swTable__dash-result">${this.findAverageMass(this.humans)}<i>kg</i></div>
      </div>`
    )
  }

  // Template for to hold table rows and dashboard.
  get humanTable() {
    return (
      `<h1 class="swTable__heading">The Humans of Star Wars</h1>
      <div class="swTable__dashboard">
        ${this.dashboard}
      </div>
      <table class="swTable__table">
        <thead class="swTable__head">
           <tr class="swTable__row">
             <td class="swTable__cell">Name</td>
             <td class="swTable__cell">Height</td>
             <td class="swTable__cell">Mass</td>
             <td class="swTable__cell">Hair Color</td>
           <tr>
        </thead>
        <tbody class="swTable__body">
          ${this.buildHumanList(this.humans)}
        </tbody>
      </table>`
    )
  }

  // Create a map object of how many times a hair color appears.
  // Example : {brown: 7, black: 3}
  // Cycle through the map and compare which property has the largest
  // count then return the properties key.
  findCommonHairColor(humans) {
    const _map = {};
    let _max = 0;
    let _commonColor = '';
    for(let human in humans){
      const _key = humans[human].hair_color.replace(/[^\w]/g, '').toLowerCase();
      if(_map[_key]) _map[_key]++;
      else _map[_key] = 1;
    }
    for(let color in _map){
      if(_map[color] > _max){
        _max = _map[color];
        _commonColor = color;
      }
    }
    return _commonColor;
  }

  // Add all the mass properties together that ARE NOT 'unknon'.
  // Divide the total mass by the total number of human objects.
  findAverageMass(humans) {
    const _humans = Object.keys(humans);
    let _total = 0;
    for(let human of _humans){
      if(humans[human].mass !== 'unknown') _total += parseInt(humans[human].mass);
    }
    return Math.floor(_total / _humans.length)
  }

  // Find tallest human by comparing each objects height.
  // If height is greater than previous recorded then set human
  // object as _tallest object.
  findTallestHuman(humans) {
    let _height = 0;
    let _tallest = {};
    for(let human in humans){
      const _humanHeight = humans[human].height
      if(_humanHeight !== 'unknown' && parseInt(_humanHeight) > _height) {
        _height = parseInt(_humanHeight);
        _tallest = humans[human];
      }
    }
    return _tallest;
  }

  // Render table on DOM and remove preloader
  render() {
    this.config.element.innerHTML = this.humanTable;
    this.config.preloader.classList.remove(this.config.loading_class);
  }
}

// Set config settings
const swTable = new StarWarsTable({
  url: 'https://swapi.co/api/species/1/',
  element: document.getElementById('swTable__root'),
  preloader: document.getElementsByClassName('loading')[0],
  loading_class: 'loading'
});
