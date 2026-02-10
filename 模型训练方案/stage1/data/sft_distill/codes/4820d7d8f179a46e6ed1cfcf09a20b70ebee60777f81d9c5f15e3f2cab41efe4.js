const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 关闭全局重力
      debug: false
    }
  },
  scene: { preload, create, update }
};

// 全局状态信号
window.__signals__ = {
  ballCount: 20,
  centerX: 400,
  centerY: 300,
  attractionBase: 80,
  ballStates: [],
  frameCount: 0,
  averageDistance: 0
};

let balls = [];
let centerPoint;
let centerGraphics;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建中心吸引点的视觉表现
  centerGraphics = this.add.graphics();
  centerGraphics.fillStyle(0xffff00, 1);
  centerGraphics.fillCircle(400, 300, 10);
  
  // 绘制中心点的吸引范围提示圈
  centerGraphics.lineStyle(2, 0xffff00, 0.3);
  centerGraphics.strokeCircle(400, 300, 250);
  
  centerPoint = { x: 400, y: 300 };
  
  // 创建小球纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('ball', 16, 16);
  graphics.destroy();
  
  // 创建 20 个小球
  for (let i = 0; i < 20; i++) {
    // 随机位置，避免在中心点
    let x, y;
    do {
      x = Phaser.Math.Between(50, 750);
      y = Phaser.Math.Between(50, 550);
    } while (Phaser.Math.Distance.Between(x, y, centerPoint.x, centerPoint.y) < 50);
    
    const ball = this.physics.add.sprite(x, y, 'ball');
    ball.setCollideWorldBounds(true);
    ball.setBounce(0.8); // 碰撞边界时反弹
    
    // 给初始随机速度
    ball.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    
    // 添加颜色变化效果（根据距离）
    ball.tint = 0x00ffff;
    
    balls.push(ball);
  }
  
  // 添加说明文字
  const style = { font: '16px Arial', fill: '#ffffff' };
  this.add.text(10, 10, 'Gravity Field Simulation', style);
  this.add.text(10, 30, '20 balls attracted to center', style);
  this.add.text(10, 50, 'Force = 80 / distance', style);
  
  console.log('[INIT] Gravity field created with 20 balls');
}

function update(time, delta) {
  const deltaSeconds = delta / 1000;
  let totalDistance = 0;
  
  window.__signals__.ballStates = [];
  window.__signals__.frameCount++;
  
  balls.forEach((ball, index) => {
    // 计算到中心点的距离和角度
    const distance = Phaser.Math.Distance.Between(
      ball.x, ball.y,
      centerPoint.x, centerPoint.y
    );
    
    const angle = Phaser.Math.Angle.Between(
      ball.x, ball.y,
      centerPoint.x, centerPoint.y
    );
    
    // 计算吸引力：force = 基准速度 80 / 距离
    // 为避免距离过小时力过大，设置最小距离为 10
    const safeDistance = Math.max(distance, 10);
    const attractionForce = 80 / safeDistance;
    
    // 将吸引力分解为 x 和 y 方向的加速度
    const accelerationX = Math.cos(angle) * attractionForce;
    const accelerationY = Math.sin(angle) * attractionForce;
    
    // 应用加速度到速度（使用 deltaSeconds 保证帧率独立）
    ball.setVelocity(
      ball.body.velocity.x + accelerationX * deltaSeconds * 60,
      ball.body.velocity.y + accelerationY * deltaSeconds * 60
    );
    
    // 限制最大速度，避免过快
    const maxSpeed = 300;
    const currentSpeed = Math.sqrt(
      ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
    );
    if (currentSpeed > maxSpeed) {
      const scale = maxSpeed / currentSpeed;
      ball.setVelocity(
        ball.body.velocity.x * scale,
        ball.body.velocity.y * scale
      );
    }
    
    // 根据距离改变小球颜色（近：红色，远：青色）
    const colorRatio = Math.min(distance / 300, 1);
    const r = Math.floor((1 - colorRatio) * 255);
    const b = Math.floor(colorRatio * 255);
    ball.tint = (r << 16) | (0 << 8) | b;
    
    totalDistance += distance;
    
    // 记录状态
    window.__signals__.ballStates.push({
      id: index,
      x: Math.round(ball.x),
      y: Math.round(ball.y),
      velocityX: Math.round(ball.body.velocity.x),
      velocityY: Math.round(ball.body.velocity.y),
      distance: Math.round(distance),
      attractionForce: Math.round(attractionForce * 100) / 100,
      speed: Math.round(currentSpeed)
    });
  });
  
  // 计算平均距离
  window.__signals__.averageDistance = Math.round(totalDistance / balls.length);
  
  // 每 60 帧输出一次日志
  if (window.__signals__.frameCount % 60 === 0) {
    console.log(JSON.stringify({
      frame: window.__signals__.frameCount,
      averageDistance: window.__signals__.averageDistance,
      ballCount: balls.length,
      sampleBall: window.__signals__.ballStates[0]
    }));
  }
}

new Phaser.Game(config);