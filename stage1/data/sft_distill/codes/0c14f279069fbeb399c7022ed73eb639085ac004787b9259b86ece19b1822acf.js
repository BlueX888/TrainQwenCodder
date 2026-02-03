// 自动加分系统 - 每秒加5分
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

// 全局验证信号
window.__signals__ = {
  score: 0,
  updates: []
};

let score = 0;
let scoreText = null;
let timerEvent = null;

function preload() {
  // 无需预加载资源
}

function create() {
  // 初始化分数
  score = 0;
  window.__signals__.score = score;
  
  // 创建分数文本，显示在右上角
  scoreText = this.add.text(
    780, // x 坐标，靠近右边界
    20,  // y 坐标，距离顶部 20 像素
    'Score: 0',
    {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本原点为右上角，使其右对齐
  scoreText.setOrigin(1, 0);
  
  // 创建定时器事件，每 1000ms (1秒) 触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,           // 延迟 1000 毫秒
    callback: updateScore, // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true             // 循环执行
  });
  
  // 添加提示文本
  const hintText = this.add.text(
    400,
    300,
    'Auto-scoring system\n+5 points per second',
    {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00',
      align: 'center'
    }
  );
  hintText.setOrigin(0.5);
  
  console.log('Game started - Auto-scoring system initialized');
  console.log(JSON.stringify({
    event: 'game_start',
    score: score,
    timestamp: Date.now()
  }));
}

// 更新分数的回调函数
function updateScore() {
  // 每次调用增加 5 分
  score += 5;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 更新验证信号
  window.__signals__.score = score;
  window.__signals__.updates.push({
    score: score,
    timestamp: Date.now()
  });
  
  // 输出日志 JSON
  console.log(JSON.stringify({
    event: 'score_update',
    score: score,
    increment: 5,
    timestamp: Date.now()
  }));
  
  // 每达到 50 分的倍数时，添加视觉反馈
  if (score % 50 === 0) {
    // 文本闪烁效果
    scoreText.setColor('#ffff00');
    setTimeout(() => {
      scoreText.setColor('#ffffff');
    }, 200);
    
    console.log(JSON.stringify({
      event: 'milestone',
      score: score,
      message: 'Milestone reached!',
      timestamp: Date.now()
    }));
  }
}

// 启动游戏
const game = new Phaser.Game(config);