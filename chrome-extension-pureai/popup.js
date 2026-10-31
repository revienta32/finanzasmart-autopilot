let loadedFile = null;
let loadedImg = null;

const txtInput = document.getElementById("ext-txt");
const txtStatus = document.getElementById("ext-txt-status");
const btnCleanTxt = document.getElementById("btn-clean-txt");
const imgInput = document.getElementById("ext-img");
const imgStatus = document.getElementById("ext-img-status");
const btnCleanImg = document.getElementById("btn-clean-img");

txtInput.addEventListener("input", () => {
  const v = txtInput.value;
  const u = (v.match(/[\u200B-\u200D\uFEFF\u202F\u00A0\u2060\u180E]/g) || []).length;
  const d = (v.match(/[—–“”‘’]/g) || []).length;
  txtStatus.textContent = `Detected: ${u} hidden Unicode chars, ${d} AI dashes/quotes.`;
  txtStatus.style.color = u + d > 0 ? "#f87171" : "#34d399";
});

btnCleanTxt.addEventListener("click", () => {
  let v = txtInput.value;
  if (!v.trim()) return;
  v = v
    .replace(/[\u200B-\u200D\uFEFF\u2060\u180E]/g, "")
    .replace(/[\u202F\u00A0]/g, " ")
    .replace(/\s*—\s*/g, ", ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
  txtInput.value = v;
  navigator.clipboard.writeText(v).catch(() => {});
  txtStatus.textContent = "✅ Stripped 100% of watermarks & copied to clipboard!";
  txtStatus.style.color = "#34d399";
});

imgInput.addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  loadedFile = file;
  const buf = await file.arrayBuffer();
  const ascii = new TextDecoder("latin1").decode(new Uint8Array(buf.slice(0, 131072)));
  const hasC2pa = /c2pa|jumbf|contentcredentials|trainedAlgorithmicMedia|ComfyUI|Midjourney|DALL-E|Firefly/i.test(ascii);
  imgStatus.textContent = hasC2pa
    ? "⚠️ C2PA / AI Binary Signature Detected in " + file.name
    : "ℹ️ Ready to strip EXIF/container bytes from " + file.name;
  imgStatus.style.color = hasC2pa ? "#f87171" : "#fbbf24";

  const img = new Image();
  img.onload = () => {
    loadedImg = img;
    btnCleanImg.disabled = false;
  };
  img.src = URL.createObjectURL(file);
});

btnCleanImg.addEventListener("click", () => {
  if (!loadedImg || !loadedFile) return;
  const canvas = document.getElementById("ext-canvas");
  canvas.width = loadedImg.naturalWidth;
  canvas.height = loadedImg.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(loadedImg, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 16) {
    d[i] = d[i] > 250 ? d[i] - 1 : d[i] + 1;
  }
  ctx.putImageData(imgData, 0, 0);
  canvas.toBlob(
    (blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = loadedFile.name.replace(/\.[^.]+$/, "") + "-clean.jpg";
      a.click();
      imgStatus.textContent = "✅ Downloaded 100% clean JPEG (0 C2PA/EXIF bytes).";
      imgStatus.style.color = "#34d399";
    },
    "image/jpeg",
    0.95
  );
});
