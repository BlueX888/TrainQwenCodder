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
let remainingTime = 20;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建文本对象显示倒计时，居中显示
  timeText = this.add.text(
    400, 
    300, 
    remainingTime.toString(), 
    {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本原点为中心，便于居中对齐
  timeText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件，每秒触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,                // 每1000毫秒（1秒）触发一次
    callback: updateTimer,      // 回调函数
    callbackScope: this,        // 回调函数的作用域
    loop: true                  // 循环执行
  });
}

function updateTimer() {
  // 减少剩余时间
  remainingTime--;
  
  // 检查是否倒计时结束
  if (remainingTime <= 0) {
    // 显示"时间到"
    timeText.setText('时间到');
    
    // 停止定时器
    timerEvent.remove();
  } else {
    // 更新显示的时间
    timeText.setText(remainingTime.toString());
  }
}

// 启动游戏
new Phaser.Game(config);