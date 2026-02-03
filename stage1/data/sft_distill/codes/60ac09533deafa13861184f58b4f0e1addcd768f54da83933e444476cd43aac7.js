const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

let timeText;
let remainingTime = 12;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建倒计时文本，居中显示
  timeText = this.add.text(400, 300, remainingTime.toString(), {
    fontSize: '64px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  timeText.setOrigin(0.5, 0.5);

  // 创建计时器事件，每1000毫秒（1秒）触发一次
  this.time.addEvent({
    delay: 1000,              // 延迟1秒
    callback: updateTimer,    // 回调函数
    callbackScope: this,      // 回调作用域
    loop: true,               // 循环执行
    repeat: 11                // 重复11次（共12次：初始+11次重复）
  });
}

function updateTimer() {
  // 减少剩余时间
  remainingTime--;

  // 更新文本显示
  if (remainingTime > 0) {
    timeText.setText(remainingTime.toString());
  } else {
    // 时间到，显示提示文字
    timeText.setText('时间到');
    timeText.setColor('#ff0000'); // 变为红色
  }
}

new Phaser.Game(config);