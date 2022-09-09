function showPrice(event) {
  if (event.target.value === "free") {
    $(".price-block").css("display", "none");
    $(".discount-block").css("display", "none");
  } else {
    $(".price-block").css("display", "block");
    $(".discount-block").css("display", "block");
  }
}

function changeToLoading() {
  $(".close").attr("disabled", true);
  $(".cancel-btn").attr("disabled", true);
  $("#addlesson-btn").empty();
  $("#addlesson-btn").append(`
    <div class="text-center">
      <div class="spinner-border spinner-border-sm" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  `);
}

$().ready(() => {
  $(".autoshow").trigger("click");
});
