export class Sha256Service {
  static hash(ascii: string): string {
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const lengthProperty = 'length';
    let i, j; // Used as a counter across the whole file
    let result = '';

    const words: number[] = [];
    const asciiBitLength = ascii[lengthProperty] * 8;

    let hash = (Sha256Service as any)._h;
    let k = (Sha256Service as any)._k;
    if (!hash) {
      hash = (Sha256Service as any)._h = [];
      k = (Sha256Service as any)._k = [];
      let primeCounter = k[lengthProperty];
      const isPrime = (n: number) => {
        for (let factor = 2; factor * factor <= n; factor++) {
          if (n % factor === 0) return false;
        }
        return true;
      };
      let candidate = 2;
      while (primeCounter < 64) {
        if (isPrime(candidate)) {
          if (primeCounter < 8) {
            hash[primeCounter] = (mathPow(candidate, 1 / 2) * maxWord) | 0;
          }
          k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
          primeCounter++;
        }
        candidate++;
      }
    }

    const initialHash = hash.slice(0);

    for (i = 0; i < ascii[lengthProperty]; i++) {
      words[i >> 2] |= (ascii.charCodeAt(i) & 0xff) << ((3 - i % 4) * 8);
    }
    words[i >> 2] |= 0x80 << ((3 - i % 4) * 8);
    words[(((ascii[lengthProperty] + 8) >> 6) + 1) * 16 - 1] = asciiBitLength;

    const w = new Array(64);
    for (j = 0; j < words[lengthProperty]; j += 16) {
      const h = initialHash.slice(0);

      for (i = 0; i < 64; i++) {
        let w15, w2, a, e, temp1, temp2;
        if (i < 16) {
          w[i] = words[j + i] | 0;
        } else {
          w15 = w[i - 15];
          w2 = w[i - 2];
          w[i] = (
            ((w15 >>> 7) | (w15 << 25)) ^ ((w15 >>> 18) | (w15 << 14)) ^ (w15 >>> 3) +
            w[i - 7] +
            (((w2 >>> 17) | (w2 << 15)) ^ ((w2 >>> 19) | (w2 << 13)) ^ (w2 >>> 10)) +
            w[i - 16]
          ) | 0;
        }

        a = h[0];
        e = h[4];

        temp1 = (
          h[7] +
          (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) +
          ((e & h[5]) ^ (~e & h[6])) +
          k[i] +
          w[i]
        ) | 0;

        temp2 = (
          (((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) +
          ((a & h[1]) ^ (a & h[2]) ^ (h[1] & h[2]))
        ) | 0;

        h.pop();
        h.unshift((temp1 + temp2) | 0);
        h[4] = (h[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) {
        initialHash[i] = (initialHash[i] + h[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j >= 0; j--) {
        const b = (initialHash[i] >> (8 * j)) & 255;
        result += (b < 16 ? '0' : '') + b.toString(16);
      }
    }
    return result;
  }
}
