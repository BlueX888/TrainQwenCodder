class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.activeCount = 0; // 状态信号：活跃小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 中心点坐标
    this.centerX = width / 2;
    this.centerY = height / 2;
    
    // 吸引速度基准
    this.attractionBase = 80;
    
    // 创建中心点标记（使用Graphics绘制）
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xffff00, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);
    centerGraphics.lineStyle(2, 0xffffff, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);
    
    // 程序化生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(15, 15, 15);
    ballGraphics.lineStyle(2, 0xffffff, 0.8);
    ballGraphics.strokeCircle(15, 15, 15);
    ballGraphics.generateTexture('ball', 30, 30);
    ballGraphics.destroy();
    
    // 创建12个小球
    this.balls = [];
    const colors = [
      0xff0000, 0x00ff00, 0x0000ff, 0xffff00,
      0xff00ff, 0x00ffff, 0xff8800, 0x8800ff,
      0x00ff88, 0xff0088, 0x88ff00, 0x0088ff
    ];
    
    for (let i = 0; i < 12; i++) {
      // 随机位置（避免太靠近中心）
      let x, y, distance;
      do {
        x = Phaser.Math.Between(50, width - 50);
        y = Phaser.Math.Between(50, height - 50);
        distance = Phaser.Math.Distance.Between(x, y, this.centerX, this.centerY);
      } while (distance < 100); // 确保初始距离不太近
      
      // 为每个小球生成不同颜色的纹理
      const colorGraphics = this.add.graphics();
      colorGraphics.fillStyle(colors[i], 1);
      colorGraphics.fillCircle(15, 15, 15);
      colorGraphics.lineStyle(2, 0xffffff, 0.6);
      colorGraphics.strokeCircle(15, 15, 15);
      colorGraphics.generateTexture(`ball_${i}`, 30, 30);
      colorGraphics.destroy();
      
      // 创建物理精灵
      const ball = this.physics.add.sprite(x, y, `ball_${i}`);
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      ball.setDamping(true);
      ball.setDrag(0.1);
      
      // 给予初始随机速度
      const initialVelX = Phaser.Math.Between(-50, 50);
      const initialVelY = Phaser.Math.Between(-50, 50);
      ball.setVelocity(initialVelX, initialVelY);
      
      this.balls.push(ball);
    }
    
    this.activeCount = this.balls.length;
    
    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 添加说明文本
    this.add.text(10, height - 40, 'Gravity Field: 12 balls attracted to center', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;
    let nearestDistance = Infinity;
    
    // 对每个小球应用重力场效果
    this.balls.forEach((ball) => {
      // 计算小球到中心点的距离
      const dx = this.centerX - ball.x;
      const dy = this.centerY - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      totalDistance += distance;
      nearestDistance = Math.min(nearestDistance, distance);
      
      // 避免除零错误
      if (distance < 1) return;
      
      // 计算吸引力（与距离成反比）
      // 吸引速度 = 基准速度 / 距离
      const attractionStrength = this.attractionBase / distance;
      
      // 计算单位方向向量
      const dirX = dx / distance;
      const dirY = dy / distance;
      
      // 计算吸引加速度
      const accelX = dirX * attractionStrength;
      const accelY = dirY * attractionStrength;
      
      // 应用加速度到速度（使用delta时间进行平滑）
      const currentVelX = ball.body.velocity.x;
      const currentVelY = ball.body.velocity.y;
      
      ball.setVelocity(
        currentVelX + accelX * (delta / 16),
        currentVelY + accelY * (delta / 16)
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
    });
    
    // 更新信息显示
    const avgDistance = (totalDistance / this.balls.length).toFixed(1);
    this.infoText.setText([
      `Active Balls: ${this.activeCount}`,
      `Avg Distance: ${avgDistance}`,
      `Nearest: ${nearestDistance.toFixed(1)}`,
      `Attraction Base: ${this.attractionBase}`
    ]);
  }
}

// 游戏配置
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

// 创建游戏实例
new Phaser.Game(config);