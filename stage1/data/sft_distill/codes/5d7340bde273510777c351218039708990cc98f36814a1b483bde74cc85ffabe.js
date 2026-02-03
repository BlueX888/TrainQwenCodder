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
  
  // 创建分数文本显示在右上角
  scoreText = this.add.text(
    780, // x坐标（右侧）
    20,  // y坐标（顶部）
    'Score: 0', // 初始文本
    {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'right'
    }
  );
  
  // 设置文本原点为右上角，方便对齐
  scoreText.setOrigin(1, 0);
  
  // 创建定时器：每2秒（2000毫秒）加15分
  this.time.addEvent({
    delay: 2000,           // 延迟时间（毫秒）
    callback: updateScore, // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true             // 循环执行
  });
  
  // 添加说明文本
  this.add.text(400, 300, 'Score increases by 15 every 2 seconds', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#aaaaaa',
    align: 'center'
  }).setOrigin(0.5);
  
  console.log('[Game Started] Initial score:', score);
}

// 更新分数的回调函数
function updateScore() {
  score += 15;
  scoreText.setText('Score: ' + score);
  
  // 验证信号：输出当前分数到控制台
  console.log('[Score Updated] Current score:', score);
}

// 创建游戏实例
new Phaser.Game(config);