class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseAttraction = 160; // 吸引速度基准
    this.averageDistance = 0; // 可验证状态：平均距离
    this.totalFrames = 0; // 可验证状态：总帧数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建小球纹理
    this.createBallTexture();
    
    // 创建中心点标记
    this.createCenterMarker();
    
    // 创建8个小球
    this.createBalls(8);
    
    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  createBallTexture() {
    // 使用 Graphics 创建小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('ball', 20, 20);
    graphics.destroy();
  }

  createCenterMarker() {
    // 创建中心点标记（红色十字）
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0xff0000, 1);
    graphics.beginPath();
    graphics.moveTo(this.centerX - 15, this.centerY);
    graphics.lineTo(this.centerX + 15, this.centerY);
    graphics.moveTo(this.centerX, this.centerY - 15);
    graphics.lineTo(this.centerX, this.centerY + 15);
    graphics.strokePath();
    
    // 添加中心圆
    graphics.lineStyle(2, 0xff0000, 0.5);
    graphics.strokeCircle(this.centerX, this.centerY, 30);
  }

  createBalls(count) {
    for (let i = 0; i < count; i++) {
      // 随机位置，但不要太靠近中心
      const angle = (Math.PI * 2 / count) * i;
      const distance = Phaser.Math.Between(150, 350);
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;
      
      // 创建物理小球
      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 设置初始随机速度
      const vx = Phaser.Math.Between(-50, 50);
      const vy = Phaser.Math.Between(-50, 50);
      ball.setVelocity(vx, vy);
      
      // 设置阻尼，模拟空气阻力
      ball.setDamping(true);
      ball.setDrag(0.1);
      
      this.balls.push(ball);
    }
  }

  update(time, delta) {
    this.totalFrames++;
    let totalDistance = 0;
    
    // 对每个小球应用引力
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );
      
      totalDistance += distance;
      
      // 避免除零和距离过小时力过大
      const safeDistance = Math.max(distance, 50);
      
      // 计算引力大小（与距离成反比）
      // F = baseAttraction / distance
      const forceMagnitude = this.baseAttraction / safeDistance;
      
      // 计算方向向量
      const dx = this.centerX - ball.x;
      const dy = this.centerY - ball.y;
      
      // 归一化方向向量
      const length = Math.sqrt(dx * dx + dy * dy);
      const normalizedDx = dx / length;
      const normalizedDy = dy / length;
      
      // 应用引力到速度
      const forceX = normalizedDx * forceMagnitude;
      const forceY = normalizedDy * forceMagnitude;
      
      // 获取当前速度并添加引力加速度
      const currentVelocityX = ball.body.velocity.x;
      const currentVelocityY = ball.body.velocity.y;
      
      // 使用 delta 时间调整力的应用（delta 通常是毫秒）
      const deltaSeconds = delta / 1000;
      ball.setVelocity(
        currentVelocityX + forceX * deltaSeconds,
        currentVelocityY + forceY * deltaSeconds
      );
      
      // 限制最大速度，避免速度过大
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
    
    // 计算平均距离（可验证状态）
    this.averageDistance = totalDistance / this.balls.length;
    
    // 更新状态显示
    this.updateStatusDisplay();
  }

  updateStatusDisplay() {
    const status = [
      `Frames: ${this.totalFrames}`,
      `Avg Distance: ${this.averageDistance.toFixed(2)}`,
      `Base Attraction: ${this.baseAttraction}`,
      `Balls Count: ${this.balls.length}`,
      `Center: (${this.centerX}, ${this.centerY})`
    ].join('\n');
    
    this.statusText.setText(status);
  }
}

// Phaser 游戏配置
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
  scene: GravityFieldScene
};

// 创建游戏实例
new Phaser.Game(config);