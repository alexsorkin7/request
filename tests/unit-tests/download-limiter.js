const SimpleTest = require('als-simple-test');
let { describe, it, beforeEach, runTests, expect, delay, beforeAll, afterAll } = SimpleTest
SimpleTest.showFullError = true;

const DownloadLimiter = require('../../src/request/download-limiter');

describe('DownloadManager', () => {
   let dl, downloadMock1, downloadMock2, downloadMock3;
   afterAll(() => process.exit())
   beforeEach(() => {
      downloadMock1 = { request:{options: { priority: 'b' }}, chunks: [1, 2, 3], lastBytes: 0, paused: false, pause: () => { this.paused = true }, resume: () => { this.paused = false } };
      downloadMock2 = { request:{options: { priority: 'a' }}, chunks: [1, 2, 3, 4], lastBytes: 0, paused: false, pause: () => { this.paused = true }, resume: () => { this.paused = false } };
      downloadMock3 = { request:{options: { priority: 'c' }}, chunks: [1, 2, 3, 4, 5], lastBytes: 0, paused: true, pause: () => { this.paused = true }, resume: () => { this.paused = false } };
      dl = new DownloadLimiter(10);
   });

   it('constructor should initialize correctly', () => {
      expect(dl.downloads.length).is('Downloads').equalTo(0);
      expect(dl.lastBytes).is('Last Bytes').equalTo(0);
      expect(dl.maxBytes).is('Max Bytes').equalTo(10);
      expect(dl.priorities).is('Priorities').sameAs({ a: 1, b: 2, c: 3, d: 4, e: 5 });
      expect(dl.intervalId).is('Interval Id').equalTo(null);
   });

   it('should add download object to downloads array', () => {
      dl.startChecking(downloadMock1);
      expect(dl.downloads).is('Downloads').includes(downloadMock1);
   });

   it('should remove download object from downloads array', () => {
      dl.startChecking(downloadMock1);
      dl.remove(downloadMock1);
      expect(dl.downloads).is('Downloads').isNot().includes(downloadMock1);
   });

   it('should start checking downloads', () => {
      dl.startChecking(downloadMock1);
      expect(dl.intervalId).is('Interval Id').defined();
   });

   it('should stop checking downloads', () => {
      dl.startChecking(downloadMock1);
      dl.stopChecking();
      expect(dl.intervalId).is('Interval Id').equalTo(null);
   });

   it('should pause the download with highest size if total size is greater than maxBytes', async () => {
      dl.startChecking(downloadMock1);
      dl.startChecking(downloadMock3);
      await delay(1100);  // Waiting more than 1000ms (the interval for check())
      expect(downloadMock3.paused).is('Download Mock 3 Paused').equalTo(true);
   });

   it('should resume the paused download with lowest priority if total size is less than maxBytes', async () => {
      dl.startChecking(downloadMock1);
      dl.startChecking(downloadMock2);
      downloadMock2.paused = true;
      await delay(1100);  // Waiting more than 1000ms (the interval for check())
      expect(downloadMock2.paused).is('Download Mock 2 Paused').equalTo(true);
   });

   it('should sort the downloads array by priority', async () => {
      dl.startChecking(downloadMock1);
      dl.startChecking(downloadMock2);
      dl.startChecking(downloadMock3);
      await delay(1100);  // Waiting more than 1000ms (the interval for check())
      expect(dl.downloads[0]).is('First download').equalTo(downloadMock2);  // Highest priority ('a')
      expect(dl.downloads[1]).is('Second download').equalTo(downloadMock1);  // Second priority ('b')
      expect(dl.downloads[2]).is('Third download').equalTo(downloadMock3);  // Lowest priority ('c')
   });
});

runTests();
