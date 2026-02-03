class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseAttraction = 120; // 吸引速度基准
    
    // 状态信号
    this.averageDistance = 0;
    this.frameCount = 0;
    this.totalDistance = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建小球纹理
    this.createBallTexture();
    
    // 创建中心点标记
    this.createCenterMarker();
    
    // 创建8个小球
    this.createBalls();
    
    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 创建说明文本
    this.add.text(10, 560, '8个小球受中心点吸引，吸引力与距离成反比', {
      fontSize: '14px',
      fill: '#cccccc'
    });
  }

  createBallTexture() {
    // 使用Graphics创建小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();
  }

  createCenterMarker() {
    // 创建中心点标记
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(this.centerX, this.centerY, 8);
    
    // 添加十字标记
    graphics.lineStyle(2, 0xff0000, 1);
    graphics.beginPath();
    graphics.moveTo(this.centerX - 20, this.centerY);
    graphics.lineTo(this.centerX + 20, this.centerY);
    graphics.moveTo(this.centerX, this.centerY - 20);
    graphics.lineTo(this.centerX, this.centerY + 20);
    graphics.strokePath();
  }

  createBalls() {
    const colors = [
      0x00ff00, 0x0000ff, 0xffff00, 0xff00ff,
      0x00ffff, 0xff8800, 0x8800ff, 0x00ff88
    ];
    
    for (let i = 0; i < 8; i++) {
      // 随机位置（避开中心区域）
      let x, y;
      do {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
      } while (Phaser.Math.Distance.Between(x, y, this.centerX, this.centerY) < 100);
      
      // 创建物理精灵
      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setTint(colors[i]);
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      ball.setDamping(true);
      ball.setDrag(0.99); // 添加轻微阻力
      
      // 给小球一个初始随机速度
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.Between(50, 100);
      ball.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
      
      this.balls.push(ball);
    }
  }

  update(time, delta) {
    this.frameCount++;
    this.totalDistance = 0;
    
    // 对每个小球应用重力场吸引力
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );
      
      this.totalDistance += distance;
      
      // 避免除以零和距离过小时的极端加速
      const safeDistance = Math.max(distance, 50);
      
      // 计算吸引力大小：F = baseAttraction / distance
      const attractionForce = this.baseAttraction / safeDistance;
      
      // 计算从小球指向中心的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );
      
      // 计算吸引力的速度分量
      const vx = Math.cos(angle) * attractionForce;
      const vy = Math.sin(angle) * attractionForce;
      
      // 应用加速度（通过调整速度）
      // delta是毫秒，转换为秒
      const deltaSeconds = delta / 1000;
      ball.setVelocity(
        ball.body.velocity.x + vx * deltaSeconds * 60, // 乘以60使效果更明显
        ball.body.velocity.y + vy * deltaSeconds * 60
      );
      
      // 限制最大速度，避免小球过快
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
    });
    
    // 计算平均距离
    this.averageDistance = this.totalDistance / this.balls.length;
    
    // 更新状态显示
    this.statusText.setText([
      `帧数: ${this.frameCount}`,
      `平均距离: ${this.averageDistance.toFixed(2)}`,
      `吸引基准: ${this.baseAttraction}`,
      `小球数量: ${this.balls.length}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 关闭默认重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);