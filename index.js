const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./db");
const axios = require("axios");
const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  console.log("Testing counter");
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

app.get("/login", async (req, res) => {
  var params = req.body;
  var { code, type } = params;
  const APP_ID = "wxa796ef0e22200d18";
  console.log("环境秘密:" + process.env.APP_SECRET);
  console.log(params);
  console.log("1type is :" + type);
  if (type === "wxapp") {
    console.log("2type is :" + type);
    console.log("环境秘密:" + process.env.APP_SECRET);
    console.log(params);
    let options = {
      method: "POST",
      url: "https://api.weixin.qq.com/sns/jscode2session?",
      formData: {
        appid: APP_ID,
        secret: process.env.APP_SECRET,
        js_code: code,
        grant_type: "authorization_code",
      },
    };
    axios
      .get("https://api.weixin.qq.com/sns/jscode2session", {
        params: {
          appid: APP_ID,
          secret: process.env.APP_SECRET,
          js_code: code,
          grant_type: "authorization_code",
        },
      })
      .then((res) => {
        console.log("~~~");
        console.log(res);
        var openId = res.data.openid;
        var user = {
          openId,
          sessionKey: data.session_key,
        };
        req.session.openId = user.openId;
        req.user = user;
      })
      .then(() => {
        res.send({
          code: 0,
          data: {
            user_name: "test",
          },
        });
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    throw new Error("未知的授权类型");
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
