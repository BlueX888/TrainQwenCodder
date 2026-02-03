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

// 全局信号对象，用于验证
window.__signals__ = {
  ballCount: 3,
  collisionCount: 0,
  boundaryCollisions: 0,
  ballCollisions: 0,
  balls: []
};

let balls;
let collisionText;
let boundaryText;

function preload() {
  // 使用 Graphics 创建黄色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('yellowBall', 32, 32);
  graphics.destroy();
}

function create() {
  // 设置世界边界
  this.physics.world.setBoundsCollision(true, true, true, true);
  
  // 创建球体组
  balls = this.physics.add.group();
  
  // 创建 3 个黄色小球
  const ballPositions = [
    { x: 200, y: 200 },
    { x: 600, y: 200 },
    { x: 400, y: 400 }
  ];
  
  ballPositions.forEach((pos, index) => {
    const ball = balls.create(pos.x, pos.y, 'yellowBall');
    
    // 设置随机速度方向，保持总速度约为 80
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const speed = 80;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    ball.setVelocity(vx, vy);
    
    // 设置完全弹性碰撞（反弹系数为 1）
    ball.setBounce(1, 1);
    
    // 启用世界边界碰撞
    ball.setCollideWorldBounds(true);
    
    // 设置圆形碰撞体
    ball.body.setCircle(16);
    
    // 记录球体信息
    window.__signals__.balls.push({
      id: index,
      x: pos.x,
      y: pos.y,
      velocityX: vx,
      velocityY: vy
    });
  });
  
  // 设置球体之间的碰撞检测
  this.physics.add.collider(balls, balls, onBallCollision, null, this);
  
  // 监听世界边界碰撞
  balls.children.entries.forEach(ball => {
    ball.body.onWorldBounds = true;
  });
  
  this.physics.world.on('worldbounds', () => {
    window.__signals__.boundaryCollisions++;
  });
  
  // 显示碰撞统计信息
  collisionText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  boundaryText = this.add.text(10, 40, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 添加说明文本
  this.add.text(10, 570, '3个黄色小球以80速度弹性碰撞', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  // 更新显示信息
  collisionText.setText(`球体碰撞次数: ${window.__signals__.ballCollisions}`);
  boundaryText.setText(`边界碰撞次数: ${window.__signals__.boundaryCollisions}`);
  
  // 更新球体位置信息到 signals
  balls.children.entries.forEach((ball, index) => {
    if (window.__signals__.balls[index]) {
      window.__signals__.balls[index].x = Math.round(ball.x);
      window.__signals__.balls[index].y = Math.round(ball.y);
      window.__signals__.balls[index].velocityX = Math.round(ball.body.velocity.x);
      window.__signals__.balls[index].velocityY = Math.round(ball.body.velocity.y);
      window.__signals__.balls[index].speed = Math.round(
        Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2)
      );
    }
  });
  
  // 更新总碰撞次数
  window.__signals__.collisionCount = 
    window.__signals__.ballCollisions + window.__signals__.boundaryCollisions;
  
  // 输出验证日志（每秒一次）
  if (Math.floor(time / 1000) !== Math.floor((time - delta) / 1000)) {
    console.log(JSON.stringify({
      time: Math.floor(time / 1000),
      collisions: window.__signals__.collisionCount,
      ballCollisions: window.__signals__.ballCollisions,
      boundaryCollisions: window.__signals__.boundaryCollisions,
      balls: window.__signals__.balls.map(b => ({
        id: b.id,
        speed: b.speed
      }))
    }));
  }
}

function onBallCollision(ball1, ball2) {
  // 记录球体间碰撞
  window.__signals__.ballCollisions++;
  
  // 可选：添加碰撞效果（闪烁）
  ball1.setTint(0xffffff);
  ball2.setTint(0xffffff);
  
  setTimeout(() => {
    ball1.clearTint();
    ball2.clearTint();
  }, 100);
}

// 启动游戏
new Phaser.Game(config);