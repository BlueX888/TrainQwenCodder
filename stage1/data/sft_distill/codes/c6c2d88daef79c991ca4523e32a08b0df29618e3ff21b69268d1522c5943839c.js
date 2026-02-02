const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

// 倒计时初始值
let countdown = 8;
let timerText;
let timerEvent;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建倒计时文本，显示在屏幕中央
  timerText = this.add.text(
    config.width / 2,
    config.height / 2,
    countdown.toString(),
    {
      fontSize: '128px',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本锚点为中心
  timerText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件，每1000毫秒（1秒）触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,                // 每秒触发
    callback: updateTimer,      // 回调函数
    callbackScope: this,        // 回调函数的作用域
    loop: true                  // 循环执行
  });
}

function updateTimer() {
  // 减少倒计时
  countdown--;
  
  // 更新文本显示
  if (countdown > 0) {
    timerText.setText(countdown.toString());
  } else {
    // 倒计时结束
    timerText.setText('时间到');
    timerText.setFontSize('96px');
    
    // 停止计时器
    if (timerEvent) {
      timerEvent.remove();
    }
  }
}

// 启动游戏
new Phaser.Game(config);