const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

let countdownText;
let timeLeft = 3;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建倒计时文本，居中显示
  countdownText = this.add.text(
    400, 
    300, 
    timeLeft.toString(), 
    {
      fontSize: '128px',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本原点为中心，使其居中对齐
  countdownText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件，每秒触发一次
  this.time.addEvent({
    delay: 1000,                // 每 1000 毫秒（1 秒）触发一次
    callback: updateCountdown,  // 回调函数
    callbackScope: this,        // 回调函数的作用域
    loop: true                  // 循环执行
  });
}

function updateCountdown() {
  // 递减时间
  timeLeft--;
  
  if (timeLeft > 0) {
    // 更新显示的数字
    countdownText.setText(timeLeft.toString());
  } else {
    // 时间到，显示提示文本
    countdownText.setText('时间到');
    countdownText.setFontSize('64px');
    
    // 停止计时器（通过移除所有事件）
    this.time.removeAllEvents();
  }
}

new Phaser.Game(config);