const Ledgerium = require('./components/Ledgerium')
const ledgerium = new Ledgerium()

setInterval(() => {
  // process.stdout.write("\u001b[2J\u001b[0;0H")
  ledgerium.getNewStats()
},5000)