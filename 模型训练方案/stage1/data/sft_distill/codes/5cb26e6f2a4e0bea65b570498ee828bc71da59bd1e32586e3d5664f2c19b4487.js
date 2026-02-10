const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 禁用默认重力
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局变量
let balls = [];
const centerX = 400;
const centerY = 300;
const attractionBase = 80; // 吸引速度基准
let frameCount = 0;

// 验证信号
window.__signals__ = {
  ballCount: 0,
  averageDistance: 0,
  averageSpeed: 0,
  frameCount: 0,
  ballsData: []
};

function preload() {
  // 创建小球纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1);
  graphics.fillCircle(10, 10, 10);
  graphics.generateTexture('ball', 20, 20);
  graphics.destroy();

  // 创建中心点纹理
  const centerGraphics = this.add.graphics();
  centerGraphics.fillStyle(0xff6b6b, 1);
  centerGraphics.fillCircle(15, 15, 15);
  centerGraphics.lineStyle(2, 0xffffff, 1);
  centerGraphics.strokeCircle(15, 15, 15);
  centerGraphics.generateTexture('center', 30, 30);
  centerGraphics.destroy();
}

function create() {
  // 绘制中心点
  const center = this.add.image(centerX, centerY, 'center');
  
  // 添加中心点标记文本
  this.add.text(centerX, centerY - 40, 'Gravity Center', {
    fontSize: '14px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);

  // 创建15个小球
  for (let i = 0; i < 15; i++) {
    // 随机位置（避免太靠近中心）
    const angle = Math.random() * Math.PI * 2;
    const distance = 150 + Math.random() * 200;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    const ball = this.physics.add.sprite(x, y, 'ball');
    
    // 设置小球属性
    ball.setCollideWorldBounds(true);
    ball.setBounce(0.8);
    ball.setDamping(true);
    ball.setDrag(0.1);
    
    // 给予初始随机速度
    const initialVelX = (Math.random() - 0.5) * 100;
    const initialVelY = (Math.random() - 0.5) * 100;
    ball.setVelocity(initialVelX, initialVelY);
    
    balls.push(ball);
  }

  // 添加信息显示
  this.infoText = this.add.text(10, 10, '', {
    fontSize: '12px',
    color: '#ffffff',
    backgroundColor: '#00000088',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(400, 550, 'Gravity Field: 15 balls attracted to center | Force ∝ 1/distance', {
    fontSize: '14px',
    color: '#aaaaaa',
    align: 'center'
  }).setOrigin(0.5);

  console.log('Game initialized: 15 balls created with gravity field');
}

function update(time, delta) {
  frameCount++;
  
  let totalDistance = 0;
  let totalSpeed = 0;
  const ballsData = [];

  // 对每个小球应用重力场效果
  balls.forEach((ball, index) => {
    // 计算到中心点的距离
    const dx = centerX - ball.x;
    const dy = centerY - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 避免除零和过强的吸引力
    const safeDist = Math.max(distance, 50);
    
    // 计算吸引力（与距离成反比）
    // 力 = 基准速度 / 距离
    const attractionForce = attractionBase / safeDist;
    
    // 计算方向角度
    const angle = Math.atan2(dy, dx);
    
    // 应用吸引力到速度
    const attractionVelX = Math.cos(angle) * attractionForce * 60 * (delta / 1000);
    const attractionVelY = Math.sin(angle) * attractionForce * 60 * (delta / 1000);
    
    // 累加速度（不直接设置，而是添加加速度）
    ball.setVelocity(
      ball.body.velocity.x + attractionVelX,
      ball.body.velocity.y + attractionVelY
    );
    
    // 限制最大速度，避免过快
    const currentSpeed = Math.sqrt(
      ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
    );
    
    if (currentSpeed > 300) {
      const ratio = 300 / currentSpeed;
      ball.setVelocity(
        ball.body.velocity.x * ratio,
        ball.body.velocity.y * ratio
      );
    }
    
    // 统计数据
    totalDistance += distance;
    totalSpeed += currentSpeed;
    
    ballsData.push({
      id: index,
      x: Math.round(ball.x),
      y: Math.round(ball.y),
      distance: Math.round(distance),
      speed: Math.round(currentSpeed),
      velocityX: Math.round(ball.body.velocity.x),
      velocityY: Math.round(ball.body.velocity.y)
    });
  });

  // 更新信息显示（每10帧更新一次以提高性能）
  if (frameCount % 10 === 0) {
    const avgDistance = Math.round(totalDistance / balls.length);
    const avgSpeed = Math.round(totalSpeed / balls.length);
    
    this.infoText.setText([
      `Balls: ${balls.length}`,
      `Avg Distance: ${avgDistance}px`,
      `Avg Speed: ${avgSpeed}px/s`,
      `Attraction Base: ${attractionBase}`,
      `Frame: ${frameCount}`
    ]);

    // 更新验证信号
    window.__signals__ = {
      ballCount: balls.length,
      averageDistance: avgDistance,
      averageSpeed: avgSpeed,
      frameCount: frameCount,
      ballsData: ballsData,
      attractionBase: attractionBase,
      centerPoint: { x: centerX, y: centerY }
    };

    // 每100帧输出一次日志
    if (frameCount % 100 === 0) {
      console.log(JSON.stringify({
        timestamp: time,
        frame: frameCount,
        avgDistance: avgDistance,
        avgSpeed: avgSpeed,
        ballCount: balls.length
      }));
    }
  }
}

// 启动游戏
new Phaser.Game(config);