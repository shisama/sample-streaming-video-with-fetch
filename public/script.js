const video = document.querySelector("video");
const startButton = document.querySelector("#start");
const stopButton = document.querySelector("#stop");
const reloadButton = document.querySelector("#reload");
const filenameInput = document.querySelector("#filename");
const timesliceInput = document.querySelector("#timeslice");

const main = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  video.srcObject = stream;
  video.onloadedmetadata = function(e) {
    video.play();
  };

  var options = { mimeType: "video/webm; codecs=vp9" };
  recorder = new MediaRecorder(stream, options);

  const transformStream = new TransformStream({
    start() {},
    async transform(chunk, controller) {
      const data = await chunk;
      if (data === null) {
        controller.terminate();
      } else {
        controller.enqueue(new Uint8Array(data));
      }
      
    }
  });
  
  const readableStream = new ReadableStream({
    start(controller) {
      recorder.ondataavailable = (event) => controller.enqueue(event.data.arrayBuffer());
      recorder.onstop = () => controller.close();
      recorder.onerror = () => controller.error(new Error("The MediaRecorder errored!"));
    }
  }).pipeThrough(transformStream);

  startButton.addEventListener("click", () => {
    recorder.start(Number(timesliceInput.value));
    fetch(`/send?filename=${filenameInput.value}`, {
      method: 'POST',
      body: readableStream,
      allowHTTP1ForStreamingUpload: true,
    }).catch(e => console.error(e));
    timesliceInput.disabled = true;
    startButton.disabled = true;
  });
  stopButton.addEventListener("click", () => {
    if (recorder.state === "recording") recorder.stop();
  });
  reloadButton.addEventListener("click", () => {
    location.reload();
  });
};
main();