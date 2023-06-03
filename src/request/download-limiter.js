class DownloadLimiter {
   constructor(maxBytes) {
      this.downloads = []
      this.lastBytes = 0
      this.maxBytes = maxBytes
      this.priorities = { a: 1, b: 2, c: 3, d: 4, e: 5 }
      this.intervalId = null;
   }

   startChecking(obj) {
      if(obj) this.downloads.push(obj)
      if (this.maxBytes === undefined || this.intervalId !== null) return;
      this.intervalId = setInterval(() => this.check(), 1000);
   }

   remove(obj) {if(obj) this.downloads = this.downloads.filter(o => o !== obj)}

   stopChecking() {
      if (this.intervalId !== null) {
         clearInterval(this.intervalId);
         this.intervalId = null;
      }
   }

   check() {
      if(this.downloads.length === 0) return this.stopChecking();
      const { currentSize, maxObjIndex } = this.getSizes()
      if (currentSize >= this.maxBytes) {
         this.downloads.sort((a, b) => { // sort downloads array by priority
            const ap = a.request.options.priority,bp = b.request.options.priority
            return this.priorities[bp] - this.priorities[ap]
         });
         this.downloads[maxObjIndex].pause()
      } else {
         this.downloads.sort((a, b) => { // sort downloads array by priority
            const ap = a.request.options.priority,bp = b.request.options.priority
            return this.priorities[ap] - this.priorities[bp]
         });
         for (let download of this.downloads) {
            if (download.paused) {
               download.resume()
               break
            }
         }
      }
   }

   getSizes() {
      let currentSize = 0, maxSize = 0, maxObjIndex
      this.downloads.forEach((obj, index) => {
         if (obj.paused) return
         const { lastBytes = 0, chunks=[] } = obj
         const chunksLength = chunks.length
         let size = chunksLength - lastBytes
         currentSize += size
         obj.lastBytes = chunksLength
         if (size > maxSize) {
            maxObjIndex = index
            maxSize = size
         }
      })
      return { currentSize, maxObjIndex }
   }
}

module.exports = DownloadLimiter