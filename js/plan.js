let user;
let ethereum;
let plan;
$(document).ready(async () => {
  user = $("#variableJSON").text();
  $("#variableJSON").remove();
  ethereum = window.ethereum;
  try {
    return;
    await ethereum.enable();
  } catch (err) {
    window.location.href = "/dashboard";
  }
  $(".popup-overlay").hide();
});
const checkIfMetamask = () => {
  if (window.ethereum) return true;
  return false;
};

// const sendTransaction = () => {
//   const params = [
//     {
//       from: ethereum.selectedAddress,
//       data: plan.contract,
//       value: "0x0",
//       to: "0x3401906DB14e01D3ed34FF83506DBBDc42166A79",
//     },
//   ];
//   ethereum
//     .request({
//       method: "eth_sendTransaction",
//       params,
//     })
//     .then((result) => {
//       subscribeToPlan(result, ethereum.selectedAddress, plan);
//     });
// };

function planSelected(id) {
  if (!user) {
    window.location.href = "/dashboard";
    return;
  }
  $.ajax({
    url: `/getTransacionInfo/${id}`,
    type: "GET",
  }).done((res) => {
    $("html").append(res);
    $(".popup-overlay").click((e) => {
      $(".popup-overlay").hide();
    });
    $(".popup").click((e) => {
      e.stopPropagation();
    });
  });
  $.ajax({
    url: `/getplan/${id}`,
    type: "GET",
  }).done((res) => {
    console.log(res);
    plan = res;
  });
}
function subscribeToPlan(transactionId, wallet, plan) {
  $("html").append('<div class="overlay"></div>');
  const data = {
    transactionId,
    wallet,
    plan,
  };
  $.ajax({
    url: "/processPayment",
    type: "POST",
    data: data,
  })
    .done(() => {
      window.location.reload();
      $(".overlay").hide();
      console.log("ALL DONE");
    })
    .fail((err) => {
      $(".overlay").hide();
      alert(err);
    });
}
