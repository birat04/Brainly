export function random(len: number): string {
    if (len <= 0 || !Number.isInteger(len)) {
        throw new Error("Length must be a positive integer.");
    }

    const options = "qwertyuioasdfghjklzxcvbnm12345678";
    const length = options.length;

    let ans = "";

    for (let i = 0; i < len; i++) {
        ans += options[Math.floor(Math.random() * length)];
    }

    return ans;
}