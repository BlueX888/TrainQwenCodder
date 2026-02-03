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

// 全局状态信号
window.__signals__ = {
  centerX: 400,
  centerY: 300,
  ballCount: 15,
  baseAttraction: 160,
  balls: [],
  frameCount: 0
};

let balls = [];
let centerGraphics;
const CENTER_X = 400;
const CENTER_Y = 300;
const BASE_ATTRACTION = 160;

function preload() {
  // 创建小球纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1);
  graphics.fillCircle(10, 10, 10);
  graphics.generateTexture('ball', 20, 20);
  graphics.destroy();

  // 创建中心点纹理
  const centerGfx = this.add.graphics();
  centerGfx.fillStyle(0xff6b6b, 1);
  centerGfx.fillCircle(15, 15, 15);
  centerGfx.generateTexture('center', 30, 30);
  centerGfx.destroy();
}

function create() {
  // 绘制中心吸引点
  centerGraphics = this.add.sprite(CENTER_X, CENTER_Y, 'center');
  
  // 添加中心点光晕效果
  const glowGraphics = this.add.graphics();
  glowGraphics.lineStyle(2, 0xff6b6b, 0.3);
  glowGraphics.strokeCircle(CENTER_X, CENTER_Y, 50);
  glowGraphics.strokeCircle(CENTER_X, CENTER_Y, 80);
  glowGraphics.strokeCircle(CENTER_X, CENTER_Y, 110);

  // 创建15个小球
  for (let i = 0; i < 15; i++) {
    // 随机位置（避免太靠近中心）
    const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
    const distance = Phaser.Math.Between(150, 350);
    const x = CENTER_X + Math.cos(angle) * distance;
    const y = CENTER_Y + Math.sin(angle) * distance;

    const ball = this.physics.add.sprite(x, y, 'ball');
    
    // 设置初始随机速度
    ball.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    
    // 设置边界反弹
    ball.setBounce(1, 1);
    ball.setCollideWorldBounds(true);
    
    // 添加拖尾效果数据
    ball.trail = [];
    
    balls.push(ball);
  }

  // 添加说明文字
  this.add.text(10, 10, 'Gravity Field Demo', {
    fontSize: '20px',
    color: '#ffffff'
  });
  
  this.add.text(10, 40, 'Balls: 15 | Attraction: 160', {
    fontSize: '14px',
    color: '#aaaaaa'
  });
}

function update(time, delta) {
  window.__signals__.frameCount++;

  // 更新每个小球
  balls.forEach((ball, index) => {
    // 计算到中心点的距离
    const distance = Phaser.Math.Distance.Between(
      ball.x, ball.y,
      CENTER_X, CENTER_Y
    );

    // 避免除以零或距离过小
    if (distance < 10) {
      return;
    }

    // 计算吸引力方向（角度）
    const angle = Phaser.Math.Angle.Between(
      ball.x, ball.y,
      CENTER_X, CENTER_Y
    );

    // 计算吸引速度：基准速度 / 距离（距离越近，吸引力越大）
    const attractionSpeed = BASE_ATTRACTION / distance;

    // 计算速度增量
    const deltaVx = Math.cos(angle) * attractionSpeed;
    const deltaVy = Math.sin(angle) * attractionSpeed;

    // 应用吸引力（累加速度）
    ball.setVelocity(
      ball.body.velocity.x + deltaVx,
      ball.body.velocity.y + deltaVy
    );

    // 限制最大速度，避免小球飞得太快
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

    // 更新信号数据
    window.__signals__.balls[index] = {
      x: Math.round(ball.x),
      y: Math.round(ball.y),
      distance: Math.round(distance),
      velocityX: Math.round(ball.body.velocity.x),
      velocityY: Math.round(ball.body.velocity.y),
      attractionSpeed: attractionSpeed.toFixed(2)
    };
  });

  // 每60帧输出一次日志
  if (window.__signals__.frameCount % 60 === 0) {
    console.log(JSON.stringify({
      frame: window.__signals__.frameCount,
      avgDistance: Math.round(
        balls.reduce((sum, ball) => {
          return sum + Phaser.Math.Distance.Between(
            ball.x, ball.y, CENTER_X, CENTER_Y
          );
        }, 0) / balls.length
      ),
      ballCount: balls.length
    }));
  }
}

new Phaser.Game(config);