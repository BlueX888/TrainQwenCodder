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

// 全局分数变量，用于验证状态
let score = 0;
let scoreText = null;

function preload() {
  // 无需预加载资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 在右上角创建分数文本
  // 使用 originX: 1 使文本右对齐，便于固定在右上角
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建定时器事件，每3秒（3000毫秒）触发一次
  this.time.addEvent({
    delay: 3000,           // 3秒间隔
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true             // 循环执行
  });
  
  // 添加提示文本（可选，用于说明功能）
  this.add.text(400, 300, 'Score increases by 20 every 3 seconds', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 添加当前时间显示（可选，用于验证定时器运行）
  const timerText = this.add.text(20, 20, 'Time: 0s', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#00ff00'
  });
  
  // 更新时间显示
  this.time.addEvent({
    delay: 1000,
    callback: function() {
      const seconds = Math.floor(this.time.now / 1000);
      timerText.setText('Time: ' + seconds + 's');
    },
    callbackScope: this,
    loop: true
  });
}

// 加分函数
function addScore() {
  score += 20;
  scoreText.setText('Score: ' + score);
  
  // 添加视觉反馈：分数增加时文本短暂放大
  this.tweens.add({
    targets: scoreText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true,
    ease: 'Power1'
  });
  
  // 输出到控制台，便于验证
  console.log('Score increased! Current score:', score);
}

// 创建游戏实例
new Phaser.Game(config);