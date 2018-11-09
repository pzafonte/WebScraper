$(".saveNote").on("click", function() {
  var thisId = $(this).attr("data-id");
  if (!$("#noteText" + thisId).val()) {
      alert("please enter a note to save")
  }else {
    $.ajax({
          method: "POST",
          url: "/notes/save/" + thisId,
          data: {
            text: $("#noteText" + thisId).val()
          }
        }).done(function(data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#noteText" + thisId).val("");
            $(".modalNote").modal("hide");
            //window.location = "/"
        });
  }
});

//Handle Delete Note button
$(".deleteNote").on("click", function() {
  var noteId = $(this).attr("data-note-id");
  var articleId = $(this).attr("data-article-id");
  $.ajax({
      method: "DELETE",
      url: "/notes/delete/" + articleId + "/" + noteId
  }).done(function(data) {
      console.log(data)
      $(".modalNote").modal("hide");
      //window.location = "/"
  })
});