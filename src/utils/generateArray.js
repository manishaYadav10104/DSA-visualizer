export function generateArray(size) {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * 300) + 20
  );
}
