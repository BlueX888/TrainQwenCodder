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
let countdown = 20;
let timerText;
let timerEvent;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建倒计时文本，居中显示
  timerText = this.add.text(400, 300, countdown.toString(), {
    fontSize: '64px',
    color: '#ffffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  
  // 设置文本锚点为中心
  timerText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件，每 1000 毫秒（1 秒）触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,                // 延迟 1 秒
    callback: updateTimer,      // 回调函数
    callbackScope: this,        // 回调作用域
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
    timerText.setFontSize('48px');
    
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
    }
  }
}

new Phaser.Game(config);