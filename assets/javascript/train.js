$(document).ready(function () {

    var index = 0;

    //  Running clock with seconds displayed
    setInterval(function () {
        $("#current-time").text(moment().format("h:mm:ss a"));
    }, 1000);


    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCMh2TjNiEUjKHoHMEgPCIhE_gWvGjRZ1M",
        authDomain: "train-scheduler-70a76.firebaseapp.com",
        databaseURL: "https://train-scheduler-70a76.firebaseio.com",
        projectId: "train-scheduler-70a76",
        storageBucket: "train-scheduler-70a76.appspot.com",
        messagingSenderId: "996419425459"
    };

    firebase.initializeApp(config);

    // Variable to reference the database
    var database = firebase.database();

    var name;
    var destination;
    var firstTrain;
    var frequency;

    //  Submit form function to add new train
    $("#add-train").on("click", function () {
        event.preventDefault();

        //  Storing and retrieving new train data
        name = $("#train-name-input").val().trim();
        destination = $("#destination-input").val().trim();
        firstTrain = $("#train-time-input").val().trim();
        frequency = $("#frequency-input").val().trim();

        item = {}
        // This prevents an empty text box from being submitted...
        if (!name || !destination || !firstTrain || !frequency) {
            item.name = "";
            item.destination = "";
            item.firstTrain = "";
            item.frequency = "";

            swal({
                type: 'error',
                title: 'Oops...',
                text: 'Form must be completely filled out before submitting!',
                background: '#faebd7',
                imageUrl: 'assets/images/locogif1.gif',
                imageWidth: 300,
                customClass: 'animated flash',
            });
            return false;
        }

        //  Push new train data to database
        database.ref().push({
            name: name,
            destination: destination,
            firstTrain: firstTrain,
            frequency: frequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP

        }); //  end of push to database

        //  This resets the form after submit button pressed
        $("form")[0].reset();

    }); //  end of submit form function

    //  Firebase watcher and initial loader
    database.ref().on("child_added", function (childSnapshot) {

        var nextArrival;
        var minutesAway;
        var removeTrain = $("<button>").html("<span class='far fa-trash-alt'></span>").addClass("removeTrain").attr("data-index", index)
            .attr("data-key", childSnapshot.key).css("color", "#860303");

        //  Log everything coming out of snapshot
        console.log(childSnapshot.val());

        //  First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(childSnapshot.val().firstTrain, "HH:mm").subtract(1, "years");

        //  Difference between current time and firstTrain
        var timeDifference = moment().diff(moment(firstTimeConverted), "minutes");
        var remainder = timeDifference % childSnapshot.val().frequency;

        //  Calculate minutes until next train
        var minutesAway = childSnapshot.val().frequency - remainder;

        //  Calculate next train time
        var nextArrival = moment().add(minutesAway, "minutes");
        nextArrival = moment(nextArrival).format("h:mm A");

        console.log(firstTimeConverted);
        console.log(timeDifference + " calculated in minutes");
        console.log(remainder + " minutes remaining");
        console.log(minutesAway + " minutes away");
        console.log(nextArrival + " is the next arrival time");

        //  Add calculated data to html train table         
        var newRow = $("<tr>");
        newRow.addClass("row-" + index);
        var data1 = $("<td>").text(childSnapshot.val().name);
        var data2 = $("<td>").text(childSnapshot.val().destination);
        var data3 = $("<td>").text(childSnapshot.val().frequency);
        var data4 = $("<td>").text(nextArrival);
        var data5 = $("<td>").text(minutesAway);
        var data6 = $("<td>").append(removeTrain);

        newRow
            .append(data1)
            .append(data2)
            .append(data3)
            .append(data4)
            .append(data5)
            .append(data6);

        $("#add-row").append(newRow);

        index++;

        //  Handle the errors
    }, function (errorObject) {
        console.log("Errors handled: " + errorObject.code);

    }); //  end of database.ref function(childSnapshot)  


    // Remove Train button function
    $(document).on("click", ".removeTrain", function () {

        //  Alert before removing train
        swal({
            title: 'Are you sure?',
            text: "You will permanently delete this train from the board!",
            type: 'warning',
            background: '#faebd7',
            imageUrl: 'assets/images/locogif2.gif',
            width: 500,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'

        }).then((result) => {
            if (result.value) {
                Swal(
                    'Deleted!',
                    'Your train has been deleted.',
                    'success'
                ) 
            } 

            $(".row-" + $(this).attr("data-index")).remove();
            database.ref().child($(this).attr("data-key")).remove();
          
        }); //  end of alert  

    }); //  end of remove train function

}); //  end of document ready