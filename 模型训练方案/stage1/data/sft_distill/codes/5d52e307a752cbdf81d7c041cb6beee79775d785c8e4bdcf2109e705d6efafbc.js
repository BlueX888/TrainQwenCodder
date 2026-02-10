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
const attractionBase = 80; // 基准吸引速度
let centerGraphics;

// 状态信号
window.__signals__ = {
  ballCount: 15,
  centerPoint: { x: centerX, y: centerY },
  attractionBase: attractionBase,
  balls: [],
  frameCount: 0
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建中心点标记
  centerGraphics = this.add.graphics();
  centerGraphics.fillStyle(0xffff00, 1);
  centerGraphics.fillCircle(centerX, centerY, 8);
  centerGraphics.lineStyle(2, 0xffff00, 0.5);
  centerGraphics.strokeCircle(centerX, centerY, 20);

  // 生成小球纹理
  const ballGraphics = this.add.graphics();
  ballGraphics.fillStyle(0x00ffff, 1);
  ballGraphics.fillCircle(10, 10, 10);
  ballGraphics.generateTexture('ball', 20, 20);
  ballGraphics.destroy();

  // 创建15个小球
  for (let i = 0; i < 15; i++) {
    // 随机位置，避开中心区域
    let x, y, distance;
    do {
      x = Phaser.Math.Between(50, 750);
      y = Phaser.Math.Between(50, 550);
      distance = Phaser.Math.Distance.Between(x, y, centerX, centerY);
    } while (distance < 100); // 确保初始距离不太近

    const ball = this.physics.add.sprite(x, y, 'ball');
    
    // 设置随机初始速度
    const randomVelX = Phaser.Math.Between(-50, 50);
    const randomVelY = Phaser.Math.Between(-50, 50);
    ball.setVelocity(randomVelX, randomVelY);
    
    // 设置弹跳和阻尼
    ball.setBounce(0.8);
    ball.setCollideWorldBounds(true);
    ball.setDamping(false);
    
    // 添加颜色变化
    ball.setTint(Phaser.Display.Color.GetColor(
      Phaser.Math.Between(100, 255),
      Phaser.Math.Between(100, 255),
      Phaser.Math.Between(100, 255)
    ));
    
    balls.push(ball);
  }

  // 添加说明文字
  this.add.text(10, 10, 'Gravity Field Demo', {
    fontSize: '20px',
    color: '#ffffff'
  });
  
  this.add.text(10, 35, '15 balls attracted to center', {
    fontSize: '14px',
    color: '#cccccc'
  });
  
  this.add.text(10, 55, 'Attraction force = 80 / distance', {
    fontSize: '14px',
    color: '#cccccc'
  });
}

function update(time, delta) {
  window.__signals__.frameCount++;
  window.__signals__.balls = [];

  balls.forEach((ball, index) => {
    // 计算到中心点的距离
    const distance = Phaser.Math.Distance.Between(
      ball.x, 
      ball.y, 
      centerX, 
      centerY
    );
    
    // 防止除零和过强的吸引力
    const safeDist = Math.max(distance, 20);
    
    // 计算吸引力大小：速度 = 基准速度 / 距离
    const attractionStrength = attractionBase / safeDist;
    
    // 计算从小球指向中心点的角度
    const angle = Phaser.Math.Angle.Between(
      ball.x, 
      ball.y, 
      centerX, 
      centerY
    );
    
    // 计算吸引力的速度分量
    const attractionVelX = Math.cos(angle) * attractionStrength;
    const attractionVelY = Math.sin(angle) * attractionStrength;
    
    // 应用吸引力到当前速度
    ball.setVelocity(
      ball.body.velocity.x + attractionVelX,
      ball.body.velocity.y + attractionVelY
    );
    
    // 限制最大速度，避免小球过快
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
    
    // 记录状态到signals
    window.__signals__.balls.push({
      id: index,
      position: { x: Math.round(ball.x), y: Math.round(ball.y) },
      velocity: { 
        x: Math.round(ball.body.velocity.x), 
        y: Math.round(ball.body.velocity.y) 
      },
      distanceToCenter: Math.round(distance),
      attractionStrength: attractionStrength.toFixed(2)
    });
  });
  
  // 每60帧输出一次日志
  if (window.__signals__.frameCount % 60 === 0) {
    console.log(JSON.stringify({
      frame: window.__signals__.frameCount,
      avgDistance: (window.__signals__.balls.reduce((sum, b) => 
        sum + b.distanceToCenter, 0) / 15).toFixed(2),
      ballCount: window.__signals__.ballCount
    }));
  }
}

new Phaser.Game(config);