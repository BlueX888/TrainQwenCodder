const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

let score = 0;
let scoreText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 在右上角创建分数文本
  // 使用 originX: 1 让文本右对齐，便于固定在右上角
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '80px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建定时器，每2.5秒（2500毫秒）加15分
  this.time.addEvent({
    delay: 2500,           // 延迟时间：2.5秒
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true            // 循环执行
  });
  
  // 添加提示文本
  this.add.text(400, 300, 'Auto Score System\n+15 every 2.5 seconds', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  }).setOrigin(0.5);
}

function addScore() {
  // 每次调用增加15分
  score += 15;
  
  // 更新分数显示
  scoreText.setText('Score: ' + score);
  
  // 添加简单的缩放动画效果
  this.tweens.add({
    targets: scoreText,
    scaleX: 1.1,
    scaleY: 1.1,
    duration: 100,
    yoyo: true,
    ease: 'Power1'
  });
}

// 启动游戏
new Phaser.Game(config);