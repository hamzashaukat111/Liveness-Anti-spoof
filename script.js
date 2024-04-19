$(document).ready(function () {
  var video = document.getElementById("videoElement");
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  var captureButton = document.getElementById("captureButton");

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;
    })
    .catch(function (error) {
      console.error("Could not access the camera: " + error);
    });

  captureButton.addEventListener("click", function () {
    var firstImageFormData = captureImageAndProcess();
    setTimeout(function () {
      var secondImageFormData = captureImageAndProcess();
      processImages(firstImageFormData, secondImageFormData);
    }, 2000); // Capture another image after 2 seconds
  });

  function captureImageAndProcess() {
    context.drawImage(video, 0, 0, 600, 380);
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        var formData = new FormData();
        formData.append("image", blob);
        resolve(blob);
      });
    });
  }

  function processImages(firstImageFormData, secondImageFormData) {
    Promise.all([
      processImage(firstImageFormData),
      processImage(secondImageFormData),
    ])
      .then(function (results) {
        var aliveProbability1 = results[0].aliveProbability;
        var aliveProbability2 = results[1].aliveProbability;
        var notAliveProbability1 = results[0].notAliveProbability;
        var notAliveProbability2 = results[1].notAliveProbability;

        console.log("Alive probability 1: " + aliveProbability1);
        console.log("Alive probability 2: " + aliveProbability2);
        console.log("Not alive probability 1: " + notAliveProbability1);
        console.log("Not alive probability 2: " + notAliveProbability2);

        var resultContainer = document.getElementById("resultContainer");
        var resultHeading = document.getElementById("resultHeading");
        resultContainer.innerHTML = "";
        resultHeading.innerHTML = "";

        if (
          aliveProbability1 !== aliveProbability2 &&
          aliveProbability1 > notAliveProbability1
        ) {
          resultHeading.innerHTML =
            '<h2 class="result-heading">Liveness check passed</h2>';
        } else {
          resultHeading.innerHTML =
            '<h2 class="result-heading">Liveness check failed</h2>';
        }

        // if (
        //   (aliveProbability1 === aliveProbability2 && aliveProbability1 > 0) ||
        //   aliveProbability1 < notAliveProbability1 ||
        //   aliveProbability2 < notAliveProbability2
        // ) {
        //   resultHeading.innerHTML =
        //     '<h2 class="result-heading">Liveness check failed</h2>';
        // } else {
        //   resultHeading.innerHTML =
        //     '<h2 class="result-heading">Liveness check passed</h2>';
        // }
      })
      .catch(function (error) {
        console.error("Error processing images:", error);
      });
  }

  function processImage(blob) {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: "https://cvscanfood-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/6ed5e91e-7c3c-44db-bcba-651a7bbb76f6/classify/iterations/Iteration1/image",
        type: "POST",
        data: blob,
        processData: false,
        contentType: false,
        headers: {
          "Prediction-Key": "6d9918f13de44cdbb32081baaf81387c",
        },
        success: function (response) {
          console.log(response);
          var aliveProbability = 0;
          var notAliveProbability = 0;
          var predictions = response.predictions;
          if (predictions.length > 0) {
            for (var i = 0; i < predictions.length; i++) {
              var prediction = predictions[i];
              if (prediction.tagName === "Alive") {
                aliveProbability = prediction.probability;
              } else if (prediction.tagName === "notAlive") {
                notAliveProbability = prediction.probability;
              }
            }
          }
          resolve({
            aliveProbability: aliveProbability,
            notAliveProbability: notAliveProbability,
          });
        },
        error: function (xhr, status, error) {
          reject(error);
        },
      });
    });
  }
});

// $(document).ready(function () {
//   var video = document.getElementById("videoElement");
//   var canvas = document.getElementById("canvas");
//   var context = canvas.getContext("2d");
//   var captureButton = document.getElementById("captureButton");

//   navigator.mediaDevices
//     .getUserMedia({ video: true })
//     .then(function (stream) {
//       video.srcObject = stream;
//     })
//     .catch(function (error) {
//       console.error("Could not access the camera: " + error);
//     });

//   $("#uploadForm").submit(function (event) {
//     event.preventDefault();
//     var fileInput = document.getElementById("imageInput");
//     var formData = new FormData();
//     formData.append("image", fileInput.files[0]);
//     processImage(formData);
//   });

//   captureButton.addEventListener("click", function () {
//     // context.drawImage(video, 0, 0, 400, 300);
//     context.drawImage(video, 0, 0, 270, 150);
//     canvas.toBlob(function (blob) {
//       var formData = new FormData();
//       formData.append("image", blob);
//       processImage(formData);
//     });
//   });

//   function processImage(formData) {
//     $.ajax({
//       url: "https://cvscanfood-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/6ed5e91e-7c3c-44db-bcba-651a7bbb76f6/classify/iterations/Iteration1/image",
//       type: "POST",
//       data: formData,
//       processData: false,
//       contentType: false,
//       headers: {
//         "Prediction-Key": "6d9918f13de44cdbb32081baaf81387c",
//       },
//       success: function (response) {
//         var predictions = response.predictions;
//         var resultContainer = document.getElementById("resultContainer");
//         var resultHeading = document.getElementById("resultHeading");
//         resultContainer.innerHTML = "";
//         resultHeading.innerHTML = "";

//         if (predictions.length > 0) {
//           var aliveProbability = 0;
//           var notAliveProbability = 0;
//           for (var i = 0; i < predictions.length; i++) {
//             var prediction = predictions[i];
//             if (prediction.tagName === "Alive") {
//               aliveProbability = prediction.probability;
//             } else if (prediction.tagName === "notalive") {
//               notAliveProbability = prediction.probability;
//             }
//           }

//           var result = '<div class="result-container">';
//           result += '<div class="prediction">';
//           result += '<p class="tag-name">Alive</p>';
//           result += '<div class="percentage-bar">';
//           result +=
//             '<div class="percentage" style="width: ' +
//             aliveProbability * 100 +
//             '%;"></div>';
//           result += "</div>";
//           result +=
//             '<p class="probability">' +
//             (aliveProbability * 100).toFixed(2) +
//             "%</p>";
//           result += "</div>";

//           result += '<div class="prediction">';
//           result += '<p class="tag-name">Not Alive</p>';
//           result += '<div class="percentage-bar">';
//           result +=
//             '<div class="percentage" style="width: ' +
//             notAliveProbability * 100 +
//             '%;"></div>';
//           result += "</div>";
//           result +=
//             '<p class="probability">' +
//             (notAliveProbability * 100).toFixed(2) +
//             "%</p>";
//           result += "</div>";
//           result += "</div>";

//           resultContainer.innerHTML = result;

//           if (aliveProbability > notAliveProbability) {
//             resultHeading.innerHTML =
//               '<h2 class="result-heading">This Video contains live person</h2>';
//           } else {
//             resultHeading.innerHTML =
//               '<h2 class="result-heading">This Video fails liveness check</h2>';
//           }
//         } else {
//           resultContainer.innerHTML = "<p>No predictions found.</p>";
//         }
//       },

//       error: function () {
//         var resultContainer = document.getElementById("resultContainer");
//         var resultHeading = document.getElementById("resultHeading");
//         resultContainer.innerHTML =
//           "<p>An error occurred while processing the image.</p>";
//         resultHeading.innerHTML = "";
//       },
//     });
//   }
// });
