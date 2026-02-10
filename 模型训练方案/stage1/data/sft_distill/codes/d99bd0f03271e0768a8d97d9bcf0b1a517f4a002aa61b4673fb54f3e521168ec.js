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

let timeText;
let remainingTime = 8;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建倒计时文本，居中显示
  timeText = this.add.text(
    this.cameras.main.centerX,
    this.cameras.main.centerY,
    remainingTime.toString(),
    {
      fontSize: '128px',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本原点为中心，实现居中对齐
  timeText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件
  // delay: 1000ms（每秒触发一次）
  // repeat: 7（总共触发8次：初始1次 + repeat 7次）
  // callback: 每次触发时更新倒计时
  this.time.addEvent({
    delay: 1000,
    callback: updateTimer,
    callbackScope: this,
    repeat: 7
  });
}

function updateTimer() {
  // 递减剩余时间
  remainingTime--;
  
  if (remainingTime > 0) {
    // 更新显示的数字
    timeText.setText(remainingTime.toString());
  } else {
    // 倒计时结束，显示"时间到"
    timeText.setText('时间到');
    timeText.setFontSize('96px');
  }
}

new Phaser.Game(config);