var scoa_io = io.connect("http://" + location.host.split(":")[0] + ":8081");

// サーバーからデータの取得
scoa_io.on("aaaaaaaa", function(data) {

   // Rescue line
   if (data["field"] == "line") {

      $(".lineData").append("<td>" + data["合計"] + "</td>");
      $(".lineData").append("<td>" + data["チーム名"] + "</td>");
      $(".lineData").append("<td>" + data["field"] + "</td>");
      $(".lineData").append("<td>" + data["ドロップタイル1"] + "</td>");
      $(".lineData").append("<td>" + data["ドロップタイル2"] + "</td>");
      $(".lineData").append("<td>" + data["ドロップタイル3"] + "</td>");
      $(".lineData").append("<td>" + data["坂登り"] + "</td>");
      $(".lineData").append("<td>" + data["ギャップ"] + "</td>");
      $(".lineData").append("<td>" + data["バンプ"] + "</td>");
      $(".lineData").append("<td>" + data["障害物"] + "</td>");
      $(".lineData").append("<td>" + data["交差点"]["scoa"] + "</td>");
      $(".lineData").append("<td>" + data["交差点"]["count"] + "</td>");
      $(".lineData").append("<td>" + data["被災者救出"]["scoa"] + "</td>");
      $(".lineData").append("<td>" + data["被災者救出"]["count"] + "</td>");
      $(".lineData").append("<td>" + data["競技進行の停止"]["scoa"] + "</td>");
      $(".lineData").append("<td>" + data["競技進行の停止"]["count"] + "</td>");
      $(".lineData").append("<td>" + data["競技時間"] + "</td></tr>");
      $(".lineData").append("<tr>");

   }

   // Rescue meiz
   else if (data["field"] == "meiz") {

      $(".meizData").append("<td>" + data["合計"] + "</td>");
      $(".meizData").append("<td>" + data["チーム名"] + "</td>");
      $(".meizData").append("<td>" + data["field"] + "</td>");
      $(".meizData").append("<td>" + data["被災者"] + "</td>");
      $(".meizData").append("<td>" + data["坂登り"] + "</td>");
      $(".meizData").append("<td>" + data["坂下り"] + "</td>");
      $(".meizData").append("<td>" + data["チェックポイント"] + "</td>");
      $(".meizData").append("<td>" + data["バンプ"] + "</td>");
      $(".meizData").append("<td>" + data["被災者数"]["scoa"] + "</td>");
      $(".meizData").append("<td>" + data["被災者数"]["count"] + "</td>");
      $(".meizData").append("<td>" + data["レスキューキット数"]["scoa"] + "</td>");
      $(".meizData").append("<td>" + data["レスキューキット数"]["count"] + "</td>");
      $(".meizData").append("<td>" + data["競技進行の停止"]["scoa"] + "</td>");
      $(".meizData").append("<td>" + data["競技進行の停止"]["count"] + "</td>");
      $(".meizData").append("<td>" + data["競技時間"] + "</td></tr>");
      $(".meizData").append("<tr>");

   }

});
