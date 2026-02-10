class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.attractionCount = 0; // 状态信号：吸引力应用次数
    this.averageDistance = 0; // 状态信号：小球到中心的平均距离
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const centerX = 400;
    const centerY = 300;
    const baseSpeed = 160;
    
    // 创建中心引力源标记（红色圆形）
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(centerX, centerY, 15);
    
    // 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00aaff, 1);
    ballGraphics.fillCircle(10, 10, 10);
    ballGraphics.generateTexture('ball', 20, 20);
    ballGraphics.destroy();
    
    // 创建小球组
    this.balls = this.physics.add.group();
    
    // 随机生成20个小球
    for (let i = 0; i < 20; i++) {
      // 随机位置（避免太靠近中心）
      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * 150;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      const ball = this.balls.create(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球一些初始随机速度
      ball.setVelocity(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
    }
    
    // 存储中心点坐标和基准速度
    this.centerX = centerX;
    this.centerY = centerY;
    this.baseSpeed = baseSpeed;
    
    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 添加说明文字
    this.add.text(10, 560, '20个小球受中心红点引力吸引（引力∝1/距离）', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    let totalDistance = 0;
    const deltaSeconds = delta / 1000;
    
    // 遍历所有小球，应用引力
    this.balls.getChildren().forEach(ball => {
      // 计算到中心的距离
      const dx = this.centerX - ball.x;
      const dy = this.centerY - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      totalDistance += distance;
      
      // 避免除零和距离太近时引力过大
      if (distance > 20) {
        // 计算引力大小：基准速度 / 距离
        const forceMagnitude = this.baseSpeed / distance;
        
        // 计算单位方向向量
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // 计算引力加速度（像素/秒²）
        const accelX = dirX * forceMagnitude * 60; // 乘以60使效果更明显
        const accelY = dirY * forceMagnitude * 60;
        
        // 应用加速度到速度
        ball.setVelocity(
          ball.body.velocity.x + accelX * deltaSeconds,
          ball.body.velocity.y + accelY * deltaSeconds
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
        
        this.attractionCount++;
      }
    });
    
    // 计算平均距离
    this.averageDistance = totalDistance / this.balls.getChildren().length;
    
    // 更新状态显示
    this.statusText.setText([
      `吸引次数: ${this.attractionCount}`,
      `平均距离: ${this.averageDistance.toFixed(1)} px`,
      `小球数量: ${this.balls.getChildren().length}`
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
      gravity: { y: 0 }, // 禁用默认重力
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);