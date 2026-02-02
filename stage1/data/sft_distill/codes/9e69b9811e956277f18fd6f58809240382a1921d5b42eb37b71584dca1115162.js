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

// 倒计时秒数
let countdown = 15;
// 文本对象
let timerText;
// 定时器事件
let timerEvent;

function preload() {
  // 本示例不需要加载外部资源
}

function create() {
  // 创建居中显示的文本对象
  timerText = this.add.text(
    config.width / 2,
    config.height / 2,
    countdown.toString(),
    {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本锚点为中心，使其真正居中
  timerText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件，每1000毫秒（1秒）触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,                // 延迟1秒
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
    
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
    }
  }
}

// 创建游戏实例
new Phaser.Game(config);