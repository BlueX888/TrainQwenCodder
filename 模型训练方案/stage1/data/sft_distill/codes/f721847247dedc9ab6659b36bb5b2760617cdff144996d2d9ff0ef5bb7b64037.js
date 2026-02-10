const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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

// 全局变量
let balls = [];
const centerX = 400;
const centerY = 300;
const baseAttractionSpeed = 160;
let centerGraphics;

// 用于验证的信号
window.__signals__ = {
  ballCount: 0,
  centerX: centerX,
  centerY: centerY,
  baseSpeed: baseAttractionSpeed,
  balls: [],
  averageDistance: 0,
  totalFrames: 0
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建小球纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff88, 1);
  graphics.fillCircle(10, 10, 10);
  graphics.generateTexture('ball', 20, 20);
  graphics.destroy();

  // 创建中心点标记
  centerGraphics = this.add.graphics();
  centerGraphics.fillStyle(0xff0000, 0.8);
  centerGraphics.fillCircle(centerX, centerY, 15);
  centerGraphics.lineStyle(2, 0xffffff, 0.5);
  centerGraphics.strokeCircle(centerX, centerY, 50);
  centerGraphics.strokeCircle(centerX, centerY, 100);
  centerGraphics.strokeCircle(centerX, centerY, 150);

  // 创建15个小球，随机分布在场景中
  for (let i = 0; i < 15; i++) {
    // 随机位置，但不要太靠近中心
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const distance = Phaser.Math.FloatBetween(150, 280);
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    const ball = this.physics.add.sprite(x, y, 'ball');
    ball.setCollideWorldBounds(true);
    ball.setBounce(0.8);
    
    // 给小球一个初始随机速度
    ball.setVelocity(
      Phaser.Math.FloatBetween(-50, 50),
      Phaser.Math.FloatBetween(-50, 50)
    );

    // 设置阻尼，模拟空气阻力
    ball.setDamping(true);
    ball.setDrag(0.1);

    balls.push(ball);
  }

  // 添加小球之间的碰撞
  this.physics.add.collider(balls, balls);

  // 更新信号
  window.__signals__.ballCount = balls.length;

  // 添加文本显示
  this.infoText = this.add.text(10, 10, '', {
    fontSize: '14px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update(time, delta) {
  let totalDistance = 0;

  // 对每个小球应用吸引力
  balls.forEach((ball, index) => {
    // 计算小球到中心点的距离
    const distance = Phaser.Math.Distance.Between(
      ball.x, ball.y,
      centerX, centerY
    );

    // 计算角度
    const angle = Phaser.Math.Angle.Between(
      ball.x, ball.y,
      centerX, centerY
    );

    // 计算吸引力速度（与距离成反比）
    // 避免除以零，设置最小距离
    const minDistance = 20;
    const effectiveDistance = Math.max(distance, minDistance);
    const attractionSpeed = baseAttractionSpeed / effectiveDistance;

    // 应用吸引力到速度（叠加而非替换）
    const attractionVelocityX = Math.cos(angle) * attractionSpeed * 60;
    const attractionVelocityY = Math.sin(angle) * attractionSpeed * 60;

    ball.setAcceleration(attractionVelocityX, attractionVelocityY);

    // 限制最大速度，防止过快
    const currentSpeed = Math.sqrt(
      ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
    );
    const maxSpeed = 400;
    if (currentSpeed > maxSpeed) {
      ball.setVelocity(
        (ball.body.velocity.x / currentSpeed) * maxSpeed,
        (ball.body.velocity.y / currentSpeed) * maxSpeed
      );
    }

    totalDistance += distance;

    // 更新单个小球的信号数据
    if (window.__signals__.balls[index]) {
      window.__signals__.balls[index].x = Math.round(ball.x);
      window.__signals__.balls[index].y = Math.round(ball.y);
      window.__signals__.balls[index].distance = Math.round(distance);
      window.__signals__.balls[index].speed = Math.round(currentSpeed);
    } else {
      window.__signals__.balls[index] = {
        x: Math.round(ball.x),
        y: Math.round(ball.y),
        distance: Math.round(distance),
        speed: Math.round(currentSpeed)
      };
    }
  });

  // 更新平均距离
  window.__signals__.averageDistance = Math.round(totalDistance / balls.length);
  window.__signals__.totalFrames++;

  // 更新显示文本
  if (this.infoText) {
    this.infoText.setText([
      `Balls: ${balls.length}`,
      `Avg Distance: ${window.__signals__.averageDistance}`,
      `Base Attraction: ${baseAttractionSpeed}`,
      `Frames: ${window.__signals__.totalFrames}`,
      `Center: (${centerX}, ${centerY})`
    ]);
  }

  // 每60帧输出一次日志用于验证
  if (window.__signals__.totalFrames % 60 === 0) {
    console.log(JSON.stringify({
      frame: window.__signals__.totalFrames,
      averageDistance: window.__signals__.averageDistance,
      ballCount: window.__signals__.ballCount,
      sampleBall: window.__signals__.balls[0]
    }));
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);