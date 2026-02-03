class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.activeBalls = 0;
    this.totalAttractionForce = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 定义中心点
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.attractionBase = 80; // 吸引速度基准值
    
    // 绘制中心点
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xffff00, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);
    centerGraphics.lineStyle(2, 0xffff00, 0.3);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 150);
    
    // 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ffff, 1);
    ballGraphics.fillCircle(12, 12, 12);
    ballGraphics.lineStyle(2, 0xffffff, 0.8);
    ballGraphics.strokeCircle(12, 12, 12);
    ballGraphics.generateTexture('ball', 24, 24);
    ballGraphics.destroy();
    
    // 创建12个小球
    this.balls = this.physics.add.group();
    
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 200 + Math.random() * 100;
      const x = this.centerX + Math.cos(angle) * radius;
      const y = this.centerY + Math.sin(angle) * radius;
      
      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      ball.setDamping(true);
      ball.setDrag(0.1);
      
      // 给小球初始速度（切向速度）
      const tangentAngle = angle + Math.PI / 2;
      ball.setVelocity(
        Math.cos(tangentAngle) * 50,
        Math.sin(tangentAngle) * 50
      );
      
      this.balls.add(ball);
    }
    
    this.activeBalls = 12;
    
    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 添加说明文本
    this.add.text(10, height - 60, 
      'Gravity Field Simulation\n12 balls attracted to center\nAttraction force ∝ 1/distance', 
      {
        fontSize: '14px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
  }

  update(time, delta) {
    this.totalAttractionForce = 0;
    
    // 遍历所有小球，应用向心吸引力
    this.balls.children.entries.forEach(ball => {
      // 计算小球到中心点的距离
      const dx = this.centerX - ball.x;
      const dy = this.centerY - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 防止除零错误
      if (distance < 1) return;
      
      // 计算吸引力大小（与距离成反比）
      const attractionMagnitude = this.attractionBase / distance;
      
      // 计算单位方向向量
      const directionX = dx / distance;
      const directionY = dy / distance;
      
      // 计算吸引力向量
      const forceX = directionX * attractionMagnitude;
      const forceY = directionY * attractionMagnitude;
      
      // 应用吸引力到速度（累加而不是替换）
      ball.setVelocity(
        ball.body.velocity.x + forceX,
        ball.body.velocity.y + forceY
      );
      
      // 限制最大速度，防止小球速度过快
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
      
      // 累计总吸引力（用于状态显示）
      this.totalAttractionForce += attractionMagnitude;
    });
    
    // 更新信息显示
    this.infoText.setText([
      `Active Balls: ${this.activeBalls}`,
      `Total Attraction Force: ${this.totalAttractionForce.toFixed(2)}`,
      `Attraction Base: ${this.attractionBase}`,
      `Time: ${(time / 1000).toFixed(1)}s`
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