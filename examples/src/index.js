console.log("hello world");

document.getElementsByTagName("body")[0].innerHTML = "环境启动成功！";

(function () {
  setInterval(() => {
    fetch("/simple")
      .then((res) => {
        return res.json();
      })
      .then((item) => {
        document.getElementsByTagName("body")[0].innerHTML +=
          item.message + "<br>";
      })
      .catch(() => {
        document.getElementsByTagName("body")[0].innerHTML +=
          "error /simple <br>";
      });
    fetch("/two")
      .then((res) => {
        return res.json();
      })
      .then((item) => {
        document.getElementsByTagName("body")[0].innerHTML +=
          item.message + "<br>";
      })
      .catch(() => {
        document.getElementsByTagName("body")[0].innerHTML += "error /two <br>";
      });
  }, 5000);
})();
