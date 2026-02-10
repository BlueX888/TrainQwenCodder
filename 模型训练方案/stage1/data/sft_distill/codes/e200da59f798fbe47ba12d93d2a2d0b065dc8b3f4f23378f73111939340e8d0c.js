class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 120;
    this.attractedCount = 0; // 状态信号：被吸引的小球数量
    this.averageDistance = 0; // 状态信号：平均距离
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 生成小球纹理
    this.createBallTexture();

    // 创建中心点（引力源）
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xffff00, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 15);
    centerGraphics.lineStyle(2, 0xffffff, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 15);

    // 创建20个小球
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给予初始随机速度
      const vx = Phaser.Math.Between(-50, 50);
      const vy = Phaser.Math.Between(-50, 50);
      ball.setVelocity(vx, vy);
      
      this.balls.push(ball);
    }

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 560, '中心黄点产生引力，吸引力 = 120 / 距离', {
      fontSize: '14px',
      fill: '#aaaaaa'
    });
  }

  createBallTexture() {
    const graphics = this.add.graphics();
    
    // 绘制渐变球体效果
    graphics.fillGradientStyle(0x00d4ff, 0x00d4ff, 0x0066ff, 0x0066ff, 1, 1, 0.8, 0.8);
    graphics.fillCircle(12, 12, 10);
    
    // 添加高光
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillCircle(9, 9, 3);
    
    // 生成纹理
    graphics.generateTexture('ball', 24, 24);
    graphics.destroy();
  }

  update(time, delta) {
    let totalDistance = 0;
    let closeCount = 0;

    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      totalDistance += distance;

      // 如果距离小于100，认为被有效吸引
      if (distance < 100) {
        closeCount++;
      }

      // 避免除以零和过强的力
      const safeDistance = Math.max(distance, 20);

      // 计算引力强度（反比关系）
      const forceMagnitude = this.attractionBase / safeDistance;

      // 计算方向向量（归一化）
      const dx = this.centerX - ball.x;
      const dy = this.centerY - ball.y;
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      
      if (magnitude > 0) {
        const normalizedDx = dx / magnitude;
        const normalizedDy = dy / magnitude;

        // 应用引力加速度
        const forceX = normalizedDx * forceMagnitude;
        const forceY = normalizedDy * forceMagnitude;

        // 使用加速度方式（更平滑）
        ball.setAcceleration(forceX * 10, forceY * 10);

        // 限制最大速度，避免小球飞得太快
        const maxSpeed = 300;
        if (ball.body.velocity.length() > maxSpeed) {
          ball.body.velocity.normalize().scale(maxSpeed);
        }
      }
    });

    // 更新状态信号
    this.attractedCount = closeCount;
    this.averageDistance = Math.round(totalDistance / this.balls.length);

    // 更新状态显示
    this.statusText.setText(
      `被吸引小球: ${this.attractedCount}/20\n` +
      `平均距离: ${this.averageDistance}px\n` +
      `引力基准: ${this.attractionBase}`
    );

    // 可视化引力场（可选）
    if (time % 100 < 16) { // 每100ms更新一次
      this.drawGravityField();
    }
  }

  drawGravityField() {
    // 清除之前的引力场可视化
    if (this.fieldGraphics) {
      this.fieldGraphics.destroy();
    }

    this.fieldGraphics = this.add.graphics();
    this.fieldGraphics.lineStyle(1, 0xffff00, 0.1);

    // 绘制引力场范围圈
    const circles = [50, 100, 150, 200, 250];
    circles.forEach(radius => {
      this.fieldGraphics.strokeCircle(this.centerX, this.centerY, radius);
    });
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
  scene: GravityFieldScene
};

new Phaser.Game(config);