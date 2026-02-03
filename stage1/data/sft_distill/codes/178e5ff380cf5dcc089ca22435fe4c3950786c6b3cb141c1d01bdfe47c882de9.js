class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.ballCount = 8;
    this.baseSpeed = 300;
    this.centerX = 400;
    this.centerY = 300;
    this.averageDistance = 0; // 状态信号：平均距离
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建小球纹理
    this.createBallTexture();
    
    // 创建中心点标记
    this.createCenterMarker();
    
    // 创建小球数组
    this.balls = [];
    
    // 在随机位置创建8个小球
    for (let i = 0; i < this.ballCount; i++) {
      const angle = (Math.PI * 2 / this.ballCount) * i;
      const distance = Phaser.Math.Between(150, 250);
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;
      
      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球初始随机速度
      const vx = Phaser.Math.Between(-50, 50);
      const vy = Phaser.Math.Between(-50, 50);
      ball.setVelocity(vx, vy);
      
      this.balls.push(ball);
    }
    
    // 添加小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls);
    
    // 显示状态信息
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  createBallTexture() {
    const graphics = this.add.graphics();
    
    // 绘制渐变效果的小球
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillCircle(16, 16, 16);
    
    graphics.fillStyle(0x88ddff, 1);
    graphics.fillCircle(12, 12, 8);
    
    // 生成纹理
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();
  }

  createCenterMarker() {
    const graphics = this.add.graphics();
    
    // 绘制中心点标记（红色十字）
    graphics.lineStyle(3, 0xff0000, 1);
    graphics.beginPath();
    graphics.moveTo(this.centerX - 20, this.centerY);
    graphics.lineTo(this.centerX + 20, this.centerY);
    graphics.moveTo(this.centerX, this.centerY - 20);
    graphics.lineTo(this.centerX, this.centerY + 20);
    graphics.strokePath();
    
    // 绘制中心圆
    graphics.lineStyle(2, 0xff0000, 0.5);
    graphics.strokeCircle(this.centerX, this.centerY, 10);
  }

  update(time, delta) {
    let totalDistance = 0;
    
    // 对每个小球应用向心引力
    this.balls.forEach(ball => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );
      
      totalDistance += distance;
      
      // 防止除以零，设置最小距离
      const safeDistance = Math.max(distance, 10);
      
      // 计算吸引力大小（与距离成反比）
      const forceMagnitude = this.baseSpeed / safeDistance;
      
      // 计算从小球指向中心的方向向量
      const dx = this.centerX - ball.x;
      const dy = this.centerY - ball.y;
      
      // 归一化方向向量
      const angle = Math.atan2(dy, dx);
      
      // 计算吸引力的分量
      const forceX = Math.cos(angle) * forceMagnitude;
      const forceY = Math.sin(angle) * forceMagnitude;
      
      // 应用吸引力到速度（使用 delta 时间进行平滑）
      const deltaSeconds = delta / 1000;
      ball.body.velocity.x += forceX * deltaSeconds * 60;
      ball.body.velocity.y += forceY * deltaSeconds * 60;
      
      // 限制最大速度，防止速度过快
      const maxSpeed = 400;
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      
      if (currentSpeed > maxSpeed) {
        const scale = maxSpeed / currentSpeed;
        ball.body.velocity.x *= scale;
        ball.body.velocity.y *= scale;
      }
    });
    
    // 更新状态信号
    this.averageDistance = totalDistance / this.ballCount;
    
    // 更新显示信息
    this.infoText.setText([
      `小球数量: ${this.ballCount}`,
      `平均距离: ${this.averageDistance.toFixed(2)}`,
      `基准速度: ${this.baseSpeed}`,
      `中心点: (${this.centerX}, ${this.centerY})`
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