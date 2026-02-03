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

let countdownText;
let timeLeft = 5;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建倒计时文本，居中显示
  countdownText = this.add.text(
    config.width / 2,
    config.height / 2,
    timeLeft.toString(),
    {
      fontSize: '128px',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本原点为中心，使其居中对齐
  countdownText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件，每 1000 毫秒（1秒）触发一次
  this.time.addEvent({
    delay: 1000,                // 每秒触发一次
    callback: updateCountdown,  // 回调函数
    callbackScope: this,        // 回调函数的作用域
    loop: true                  // 循环执行
  });
}

function updateCountdown() {
  // 递减剩余时间
  timeLeft--;
  
  // 检查是否归零
  if (timeLeft > 0) {
    // 更新显示的数字
    countdownText.setText(timeLeft.toString());
  } else {
    // 时间到，显示提示文字
    countdownText.setText('时间到');
    countdownText.setFontSize('72px');
    
    // 停止定时器（通过移除事件）
    this.time.removeAllEvents();
  }
}

new Phaser.Game(config);