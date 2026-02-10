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
let countdown = 12;
let timerText;
let timerEvent;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建倒计时文本，居中显示
  timerText = this.add.text(
    this.cameras.main.centerX,
    this.cameras.main.centerY,
    countdown.toString(),
    {
      fontSize: '72px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本锚点为中心
  timerText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件，每1000毫秒（1秒）触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,           // 延迟1秒
    callback: updateTimer, // 回调函数
    callbackScope: this,   // 回调作用域
    repeat: countdown - 1, // 重复次数（12次总共需要重复11次）
    loop: false            // 不循环
  });
}

function updateTimer() {
  // 减少倒计时
  countdown--;
  
  // 更新文本显示
  if (countdown > 0) {
    timerText.setText(countdown.toString());
  } else {
    // 倒计时结束，显示"时间到"
    timerText.setText('时间到');
    timerText.setColor('#ff0000'); // 改变颜色为红色以示警告
  }
}

// 启动游戏
new Phaser.Game(config);