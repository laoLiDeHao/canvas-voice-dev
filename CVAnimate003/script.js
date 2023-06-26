window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1')
  const ctx = canvas.getContext('2d')
  const snail = this.document.getElementById('seahorse')
  console.log(this.window);
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  class Bar {
    constructor(x, y, width, height, color, index) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
      this.color = color
      this.index = index
    }
    update(micInput) {
      // this.height = micInput * 1000
      const sound = micInput * 1000
      if (sound > this.height) {
        this.height = sound
      } else {
        this.height -= this.height * 0.03
      }

    }

    draw(context, volume) {
      context.strokeStyle = this.color
      context.lineWidth = this.lineWidth

      context.save()

      context.rotate(this.index * -0.004)
      // context.fillRect(this.x, this.y, this.width, this.height)
      context.beginPath()
      context.moveTo(0, this.y)
      // context.moveTo(0, 0)
      // context.lineTo(this.x, this.y + this.height)
      context.bezierCurveTo(this.x - this.height * 0.8, this.y + this.height * 0.2, -this.height * 0.5, this.height * 0.5, -this.height * 2, this.y)
      context.stroke()

      // if (this.index > 100) {
      //   context.beginPath();
      //   context.arc(this.x, this.y + 10 + this.height / 2 + this.height * 0.1, this.height * 0.05, 0, Math.PI * 2)
      //   context.moveTo(this.x, this.y)
      //   context.lineTo(this.x, this.y + this.height / 2)
      //   context.stroke()
      // }
      context.beginPath()
      context.fillStyle = this.color
      context.arc(-this.height * 2, this.y, this.height * 0.1, 0, Math.PI*2)
      context.fill()
      context.restore()
    }
  }




  class Micorphone {
    constructor(fftSize) {
      this.initialized = false
      navigator.mediaDevices.getUserMedia({
          audio: true
        })
        .then((stream) => {
          this.audioContext = new AudioContext()
          this.microphone = this.audioContext.createMediaStreamSource(stream)
          this.analyser = this.audioContext.createAnalyser()
          this.analyser.fftSize = fftSize
          const bufferLength = this.analyser.frequencyBinCount;
          this.dataArray = new Uint8Array(bufferLength)
          this.microphone.connect(this.analyser)
          this.initialized = true
        }).catch(err => {
          alert(err)
        })
    }
    getSamples() {
      this.analyser.getByteTimeDomainData(this.dataArray); //fill dataArray by voice samples
      let normSamples = [...this.dataArray].map(e => e / 128 - 1)
      return normSamples
    }
    getVolume() {
      this.analyser.getByteTimeDomainData(this.dataArray);
      let normSamples = [...this.dataArray].map(e => e / 128 - 1)
      let sum = 0
      for (let i = 0; i < normSamples.length; i++) {
        sum += normSamples[i] * normSamples[i]
      }
      let volume = Math.sqrt(sum / normSamples.length)
      return volume
    }
  }

  let fftSize = 512
  const micorphone = new Micorphone(fftSize)
  let bars = []
  let barWidth = canvas.width / (fftSize / 2)

  function createBars() {
    for (let i = 1; i < (fftSize / 2); i++) {
      // bars.push(new Bar(barWidth * i, 300, .5, 250, 'blue', i)) //x, y, width, height, color, index
      let color = `hsl(${200+i*2},100%,50%)`
      bars.push(new Bar(0, i * 0.9, 1, 50, color, i)) //x, y, width, height, color, index
    }
  }
  createBars()
  console.log(bars);

  function animatte() {

    if (micorphone.initialized == true) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const samples = micorphone.getSamples()
      const volume = micorphone.getVolume()

      // snail.style.scale = 1 + 0.5 * volume

      ctx.save()
      ctx.translate(canvas.width / 2 + 180, canvas.height / 2 + 10)
      ctx.rotate(-2.25)

      bars.forEach(function (bar, i) {
        bar.update(samples[i])
        bar.draw(ctx, volume)
      })
      ctx.restore()
    }
    requestAnimationFrame(animatte)
  }
  animatte()


  window.addEventListener('resize', function () {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })
})