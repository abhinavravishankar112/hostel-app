try {
  process.kill(3987, 9);
  console.log('Killed');
} catch (e) {
  console.error(e);
}
