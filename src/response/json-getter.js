module.exports = function(obj) {
   Object.defineProperty(obj, 'json', {
      get() {
         try { return JSON.parse(this.data); }
         catch (error) { return error }
      }
   });
}
