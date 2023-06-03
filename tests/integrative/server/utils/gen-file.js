const { PassThrough } = require('stream');

module.exports = function (req, res) {
   let mb = req.params.size || 1
   mb = Number(mb)
   let total = mb * 1024 * 1024; // 5 MB
   let data = Buffer.alloc(1024, 'X'); // 1KB chunk filled with letter 'X'
   let size = 0;
   let stream = new PassThrough();
   //  res.setHeader('Content-Length', total);
   //  res.setHeader('Content-Type', 'application/octet-stream');
   //  res.setHeader('Accept-Ranges', 'bytes');
   //  res.setHeader('Content-Disposition', 'attachment; filename=largefile.txt');

   // Write data to the stream periodically
   let interval = setInterval(() => {
      // If the total size has been reached, stop writing data and end the stream
      if (size >= total) {
         clearInterval(interval);
         stream.end();
      } else {
         // Otherwise, write more data to the stream
         stream.write(data);
         size += data.length;
      }
   }, 10); // Adjust this value to control how quickly data is written to the stream

   stream.pipe(res);
};
