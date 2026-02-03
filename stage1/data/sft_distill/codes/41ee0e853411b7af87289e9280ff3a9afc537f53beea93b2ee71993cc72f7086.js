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
let remainingTime = 8;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建倒计时文本，显示在屏幕中央
  countdownText = this.add.text(400, 300, remainingTime.toString(), {
    fontSize: '128px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  
  // 设置文本原点为中心，方便居中显示
  countdownText.setOrigin(0.5, 0.5);
  
  // 创建计时器事件，每1000毫秒（1秒）触发一次
  this.time.addEvent({
    delay: 1000,           // 延迟1秒
    callback: updateCountdown,  // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true,            // 循环执行
    repeat: 7              // 重复7次（总共8次：初始+7次）
  });
}

function updateCountdown() {
  // 减少剩余时间
  remainingTime--;
  
  // 检查是否归零
  if (remainingTime <= 0) {
    // 显示"时间到"
    countdownText.setText('时间到');
    countdownText.setFontSize('96px');
    // 注意：由于repeat设置为7，计时器会自动停止
  } else {
    // 更新显示的数字
    countdownText.setText(remainingTime.toString());
  }
}

new Phaser.Game(config);