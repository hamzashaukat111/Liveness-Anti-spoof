$(document).ready(function () {
  var video = document.getElementById("videoElement");
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  var captureButton = document.getElementById("captureButton");
  var responses = []; // Array to store responses from API

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;
    })
    .catch(function (error) {
      console.error("Could not access the camera: " + error);
    });

  function captureImageAndProcess() {
    // Capture an image
    context.drawImage(video, 0, 0, 270, 150);
    canvas.toBlob(function (blob) {
      var formData = new FormData();
      formData.append("image", blob);

      // Send image to the API
      $.ajax({
        url: "https://cvscanfood-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/6ed5e91e-7c3c-44db-bcba-651a7bbb76f6/classify/iterations/Iteration1/image",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        headers: {
          "Prediction-Key": "6d9918f13de44cdbb32081baaf81387c",
        },
        success: function (response) {
          responses.push(response); // Store the response

          if (responses.length === 2) {
            // Both images processed, compare responses
            compareResponses();
          }
        },
      });
    });
  }

  function compareResponses() {
    var response1 = responses[0];
    var response2 = responses[1];

    // Compare Alive probabilities
    var aliveProbability1 = response1.predictions.find(
      (prediction) => prediction.tagName === "Alive"
    ).probability;
    var aliveProbability2 = response2.predictions.find(
      (prediction) => prediction.tagName === "Alive"
    ).probability;

    if (aliveProbability1 === aliveProbability2) {
      // Liveness check failed: Still images
      displayResult("Liveness check failed: Still images");
    } else {
      // Compare Alive probability of the first response with Not Alive probability of the first response
      var notAliveProbability1 = response1.predictions.find(
        (prediction) => prediction.tagName === "notalive"
      ).probability;

      if (aliveProbability1 < notAliveProbability1) {
        // Liveness check failed: No person detected
        console.log("aliveProbability1: ", aliveProbability1);
        console.log("aliveProbability2: ", aliveProbability2);
        console.log("notAliveProbability1: ", notAliveProbability1);
        displayResult("Liveness check failed: No person detected");
      } else {
        // Liveness check passed
        console.log("aliveProbability1: ", aliveProbability1);
        console.log("notAliveProbability1: ", notAliveProbability1);
        displayResult("Liveness check passed");
      }
    }

    // Clear responses array for the next capture
    responses = [];
  }

  function displayResult(message) {
    var resultHeading = document.getElementById("resultHeading");
    resultHeading.innerHTML = '<h2 class="result-heading">' + message + "</h2>";
  }

  captureButton.addEventListener("click", function () {
    // Clear previous responses
    responses = [];

    // Capture the first image
    captureImageAndProcess();

    // Capture the second image after 2 seconds
    setTimeout(function () {
      captureImageAndProcess();
    }, 2000);
  });
});
