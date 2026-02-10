const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态变量
let collisionCount = 0;
let ballGroup;
let collisionText;

function preload() {
  // 创建绿色圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('ball', 32, 32);
  graphics.destroy();
}

function create() {
  // 设置世界边界
  this.physics.world.setBounds(0, 0, 800, 600);
  
  // 创建物理精灵组
  ballGroup = this.physics.add.group({
    key: 'ball',
    repeat: 4, // 创建5个小球（0-4）
    setXY: {
      x: 100,
      y: 100,
      stepX: 150,
      stepY: 100
    }
  });
  
  // 配置每个小球
  ballGroup.children.iterate((ball) => {
    // 设置边界碰撞
    ball.setCollideWorldBounds(true);
    
    // 设置弹性系数（完全弹性碰撞）
    ball.setBounce(1, 1);
    
    // 设置随机速度方向，速度大小为360像素/秒
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * 360;
    const velocityY = Math.sin(angle) * 360;
    ball.setVelocity(velocityX, velocityY);
    
    // 设置圆形碰撞体
    ball.body.setCircle(16);
  });
  
  // 添加小球之间的碰撞检测
  this.physics.add.collider(ballGroup, ballGroup, handleBallCollision, null, this);
  
  // 显示碰撞计数
  collisionText = this.add.text(16, 16, 'Collisions: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });
  
  // 添加边界线（可视化）
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(2, 0xffffff, 0.5);
  borderGraphics.strokeRect(1, 1, 798, 598);
  
  // 添加说明文字
  this.add.text(16, 560, 'Green balls bounce off walls and each other', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  // 更新碰撞计数显示
  collisionText.setText('Collisions: ' + collisionCount);
}

// 碰撞处理函数
function handleBallCollision(ball1, ball2) {
  collisionCount++;
  
  // 可选：添加碰撞视觉反馈
  ball1.setTint(0xffff00);
  ball2.setTint(0xffff00);
  
  // 延迟恢复颜色
  setTimeout(() => {
    ball1.clearTint();
    ball2.clearTint();
  }, 100);
}

// 启动游戏
new Phaser.Game(config);