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
let remainingTime = 3;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 在屏幕中央创建倒计时文本
  countdownText = this.add.text(
    400, 
    300, 
    remainingTime.toString(), 
    {
      fontSize: '128px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本锚点为中心
  countdownText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件，每1000毫秒（1秒）触发一次
  this.time.addEvent({
    delay: 1000,                // 每秒触发
    callback: updateCountdown,  // 回调函数
    callbackScope: this,        // 回调函数的作用域
    loop: true,                 // 循环执行
    repeat: 2                   // 重复2次（加上首次共3次，倒计时3秒）
  });
}

function updateCountdown() {
  // 减少剩余时间
  remainingTime--;
  
  // 更新文本显示
  if (remainingTime > 0) {
    countdownText.setText(remainingTime.toString());
  } else {
    // 倒计时结束，显示"时间到"
    countdownText.setText('时间到');
    countdownText.setFontSize('96px');
  }
}

new Phaser.Game(config);