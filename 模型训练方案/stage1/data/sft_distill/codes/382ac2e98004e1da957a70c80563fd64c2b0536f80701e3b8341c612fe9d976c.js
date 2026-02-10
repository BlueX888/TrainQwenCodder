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
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 游戏状态变量
let balls = [];
let centerX = 400;
let centerY = 300;
let gravityStrength = 80; // 吸引速度基准
let averageDistance = 0; // 状态信号：平均距离
let centerGraphics;
let statusText;

function preload() {
  // 创建小球纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('ball', 32, 32);
  graphics.destroy();

  // 创建中心点纹理
  const centerGfx = this.add.graphics();
  centerGfx.fillStyle(0xff0000, 1);
  centerGfx.fillCircle(12, 12, 12);
  centerGfx.lineStyle(2, 0xff6666, 1);
  centerGfx.strokeCircle(12, 12, 12);
  centerGfx.generateTexture('center', 24, 24);
  centerGfx.destroy();
}

function create() {
  // 创建中心引力点
  const center = this.add.image(centerX, centerY, 'center');
  
  // 添加中心点脉冲效果
  centerGraphics = this.add.graphics();
  
  // 创建8个小球，随机分布在场景中
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 / 8) * i;
    const radius = 200 + Math.random() * 100;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const ball = this.physics.add.sprite(x, y, 'ball');
    
    // 设置初始随机速度
    const randomVelX = (Math.random() - 0.5) * 100;
    const randomVelY = (Math.random() - 0.5) * 100;
    ball.setVelocity(randomVelX, randomVelY);
    
    // 设置阻尼，避免速度无限增长
    ball.setDamping(true);
    ball.setDrag(0.01);
    
    // 设置碰撞边界
    ball.setCollideWorldBounds(true);
    ball.setBounce(0.8);
    
    balls.push(ball);
  }
  
  // 创建状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 添加说明文本
  this.add.text(10, 560, '8个小球受中心红点引力吸引 | 吸引力与距离成反比', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  // 清除之前的引力线
  centerGraphics.clear();
  
  let totalDistance = 0;
  
  // 对每个小球应用引力
  balls.forEach((ball, index) => {
    // 计算小球到中心点的距离
    const distance = Phaser.Math.Distance.Between(
      ball.x, ball.y,
      centerX, centerY
    );
    
    totalDistance += distance;
    
    // 计算角度
    const angle = Phaser.Math.Angle.Between(
      ball.x, ball.y,
      centerX, centerY
    );
    
    // 计算引力加速度：基准速度 / 距离
    // 防止距离过小导致加速度过大
    const safeDist = Math.max(distance, 50);
    const acceleration = gravityStrength / safeDist;
    
    // 将加速度分解为 x 和 y 分量
    const accelX = Math.cos(angle) * acceleration;
    const accelY = Math.sin(angle) * acceleration;
    
    // 应用加速度到速度（delta是毫秒，转换为秒）
    const deltaSeconds = delta / 1000;
    ball.setVelocity(
      ball.body.velocity.x + accelX * deltaSeconds * 60,
      ball.body.velocity.y + accelY * deltaSeconds * 60
    );
    
    // 限制最大速度，避免过快
    const maxSpeed = 400;
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
    
    // 绘制引力线（每隔一个小球绘制，避免过于密集）
    if (index % 2 === 0) {
      const alpha = Math.max(0.1, 1 - distance / 400);
      centerGraphics.lineStyle(1, 0xff6666, alpha);
      centerGraphics.lineBetween(centerX, centerY, ball.x, ball.y);
    }
  });
  
  // 计算平均距离（状态信号）
  averageDistance = totalDistance / balls.length;
  
  // 更新状态文本
  statusText.setText([
    `小球数量: ${balls.length}`,
    `平均距离: ${averageDistance.toFixed(1)} px`,
    `引力强度: ${gravityStrength}`,
    `帧时间: ${delta.toFixed(1)} ms`
  ]);
  
  // 绘制中心点脉冲圈
  const pulseRadius = 20 + Math.sin(time / 300) * 5;
  centerGraphics.lineStyle(2, 0xff0000, 0.3);
  centerGraphics.strokeCircle(centerX, centerY, pulseRadius);
}

new Phaser.Game(config);