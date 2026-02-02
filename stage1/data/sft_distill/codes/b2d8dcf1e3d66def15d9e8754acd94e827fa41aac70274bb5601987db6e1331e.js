const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

let timeText;
let remainingTime = 8;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建倒计时文本，居中显示
  timeText = this.add.text(400, 300, remainingTime.toString(), {
    fontSize: '96px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  timeText.setOrigin(0.5, 0.5);

  // 创建定时器事件，每1000毫秒（1秒）触发一次
  this.time.addEvent({
    delay: 1000,              // 延迟1秒
    callback: updateTimer,    // 回调函数
    callbackScope: this,      // 回调函数的作用域
    loop: true,               // 循环执行
    repeat: 7                 // 重复7次（总共执行8次：初始 + 7次重复）
  });
}

function updateTimer() {
  // 减少剩余时间
  remainingTime--;

  if (remainingTime > 0) {
    // 更新显示的数字
    timeText.setText(remainingTime.toString());
  } else {
    // 时间到，显示提示信息
    timeText.setText('时间到');
    timeText.setFontSize('72px');
    timeText.setColor('#ff6b6b');
  }
}

new Phaser.Game(config);