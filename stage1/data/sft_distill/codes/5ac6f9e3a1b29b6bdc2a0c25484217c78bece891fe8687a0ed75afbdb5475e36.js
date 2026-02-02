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
let remainingTime = 15;
let timerEvent;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建倒计时文本，居中显示
  timeText = this.add.text(400, 300, remainingTime.toString(), {
    fontSize: '64px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  
  // 设置文本原点为中心，便于居中对齐
  timeText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件，每秒触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,                // 每 1000 毫秒（1 秒）触发一次
    callback: updateTimer,      // 回调函数
    callbackScope: this,        // 回调函数的作用域
    loop: true                  // 循环执行
  });
}

function updateTimer() {
  // 减少剩余时间
  remainingTime--;
  
  // 更新文本显示
  if (remainingTime > 0) {
    timeText.setText(remainingTime.toString());
  } else {
    // 时间到，显示提示信息
    timeText.setText('时间到');
    timeText.setColor('#ff0000'); // 变为红色
    
    // 停止定时器
    timerEvent.remove();
  }
}

// 启动游戏
new Phaser.Game(config);