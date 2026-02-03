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
let remainingTime = 5;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建倒计时文本，居中显示
  countdownText = this.add.text(
    config.width / 2,
    config.height / 2,
    remainingTime.toString(),
    {
      fontSize: '128px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本锚点为中心
  countdownText.setOrigin(0.5, 0.5);

  // 创建定时器事件，每秒触发一次
  this.time.addEvent({
    delay: 1000,                // 每 1000 毫秒（1 秒）触发一次
    callback: updateCountdown,  // 回调函数
    callbackScope: this,        // 回调函数的作用域
    loop: true,                 // 循环执行
    repeat: 4                   // 重复 4 次（加上第一次共 5 次，从 5 倒数到 1）
  });
}

function updateCountdown() {
  remainingTime--;
  
  if (remainingTime > 0) {
    // 更新倒计时数字
    countdownText.setText(remainingTime.toString());
    
    // 添加缩放动画效果
    countdownText.setScale(1.2);
    this.tweens.add({
      targets: countdownText,
      scale: 1,
      duration: 200,
      ease: 'Bounce.easeOut'
    });
  } else {
    // 时间到，显示提示文字
    countdownText.setText('时间到！');
    countdownText.setFontSize('64px');
    countdownText.setColor('#ff0000');
    
    // 添加闪烁效果
    this.tweens.add({
      targets: countdownText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
}

new Phaser.Game(config);