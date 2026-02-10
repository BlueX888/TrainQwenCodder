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
let countdown = 5;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建标题文本
  const titleText = this.add.text(400, 200, '倒计时开始', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  titleText.setOrigin(0.5);

  // 创建倒计时显示文本
  timeText = this.add.text(400, 300, countdown.toString(), {
    fontSize: '96px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  timeText.setOrigin(0.5);

  // 创建定时器，每秒触发一次
  this.time.addEvent({
    delay: 1000,                // 每 1000 毫秒（1 秒）触发一次
    callback: updateCountdown,  // 回调函数
    callbackScope: this,        // 回调函数的作用域
    loop: true,                 // 循环执行
    repeat: 4                   // 重复 4 次（加上初始执行共 5 次）
  });

  // 倒计时结束后的定时器
  this.time.addEvent({
    delay: 5000,                // 5 秒后触发
    callback: onTimeUp,         // 回调函数
    callbackScope: this
  });
}

function updateCountdown() {
  countdown--;
  if (countdown > 0) {
    timeText.setText(countdown.toString());
    
    // 添加颜色变化效果
    if (countdown <= 3) {
      timeText.setColor('#ff0000');
    }
  }
}

function onTimeUp() {
  // 显示"时间到"
  timeText.setText('时间到！');
  timeText.setColor('#ffff00');
  timeText.setFontSize('72px');
  
  // 添加闪烁效果
  this.tweens.add({
    targets: timeText,
    alpha: 0.3,
    duration: 500,
    yoyo: true,
    repeat: -1
  });
}

new Phaser.Game(config);