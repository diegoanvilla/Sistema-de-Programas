$(document).ready(function () {
  return;
  refUser = $("#variableJSON").text();
  if (refUser) {
    refUser = JSON.parse(refUser);
  }
  $("#variableJSON").remove();
  let accounts;
  const checkIfMetamask = () => {
    if (window.ethereum) return true;
    return false;
  };
  const checkWallet = async () => {
    let ethereum = window.ethereum;
    try {
      await ethereum.enable();
      accounts = await ethereum.request({ method: "eth_accounts" });
      return accounts;
    } catch (err) {
      console.log(err);
    }
  };
  $(document).on("submit", "form#registerForm", function (e) {
    e.preventDefault();
    $("html").append("<div class='overlay'></div>");
    let url = "/register";
    if (refUser) {
      url += `?referred=${refUser.refUser}`;
    }
    let loginInfo = $("#registerForm").serializeArray();
    let response = {};
    loginInfo.map((field) => {
      response[`${field.name}`] = field.value;
    });
    if (checkIfMetamask()) {
      checkWallet().then(() => {
        response.wallet = accounts;
      });
    }
    $.ajax({
      url: url,
      type: "POST",
      data: response,
    })
      .done((res) => {
        $("html").html(res);

        console.log(res);
      })
      .fail((err) => {
        console.log(err);
      });
  });
});
