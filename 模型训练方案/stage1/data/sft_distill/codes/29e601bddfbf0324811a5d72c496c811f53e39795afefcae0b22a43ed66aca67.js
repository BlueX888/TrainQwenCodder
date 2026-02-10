class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.totalDistance = 0; // 状态信号：记录所有小球累计移动距离
    this.balls = [];
    this.centerPoint = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建小球纹理
    this.createBallTexture();
    
    // 创建中心点纹理
    this.createCenterTexture();
    
    // 创建中心吸引点
    this.centerPoint = this.physics.add.sprite(width / 2, height / 2, 'centerTex');
    this.centerPoint.setImmovable(true);
    this.centerPoint.body.setAllowGravity(false);
    
    // 创建3个小球，随机分布
    const positions = [
      { x: 150, y: 150 },
      { x: width - 150, y: 150 },
      { x: width / 2, y: height - 150 }
    ];
    
    for (let i = 0; i < 3; i++) {
      const ball = this.physics.add.sprite(
        positions[i].x,
        positions[i].y,
        'ballTex'
      );
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      ball.body.setAllowGravity(false);
      ball.setDamping(true);
      ball.setDrag(0.95); // 添加轻微阻力
      
      // 记录初始位置用于计算移动距离
      ball.lastX = ball.x;
      ball.lastY = ball.y;
      
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
    this.add.text(10, height - 40, '重力场效果：小球被中心点吸引', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
  }

  update(time, delta) {
    const centerX = this.centerPoint.x;
    const centerY = this.centerPoint.y;
    const baseSpeed = 160; // 吸引速度基准
    
    // 对每个小球应用重力场效果
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x,
        ball.y,
        centerX,
        centerY
      );
      
      // 计算角度
      const angle = Phaser.Math.Angle.Between(
        ball.x,
        ball.y,
        centerX,
        centerY
      );
      
      // 计算吸引力（与距离成反比）
      // 使用最小距离限制避免除零和过大的力
      const minDistance = 50;
      const effectiveDistance = Math.max(distance, minDistance);
      
      // 吸引力强度 = 基准速度 / 距离
      const attractionForce = baseSpeed / effectiveDistance * 100;
      
      // 计算速度分量
      const velocityX = Math.cos(angle) * attractionForce;
      const velocityY = Math.sin(angle) * attractionForce;
      
      // 应用速度（累加而不是直接设置，产生加速效果）
      ball.setVelocity(
        ball.body.velocity.x + velocityX * (delta / 1000),
        ball.body.velocity.y + velocityY * (delta / 1000)
      );
      
      // 限制最大速度
      const maxSpeed = 400;
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      if (currentSpeed > maxSpeed) {
        const ratio = maxSpeed / currentSpeed;
        ball.setVelocity(
          ball.body.velocity.x * ratio,
          ball.body.velocity.y * ratio
        );
      }
      
      // 计算移动距离
      const movedDistance = Phaser.Math.Distance.Between(
        ball.lastX,
        ball.lastY,
        ball.x,
        ball.y
      );
      this.totalDistance += movedDistance;
      
      // 更新上一帧位置
      ball.lastX = ball.x;
      ball.lastY = ball.y;
    });
    
    // 更新状态显示
    this.statusText.setText([
      `总移动距离: ${Math.floor(this.totalDistance)}px`,
      `小球1位置: (${Math.floor(this.balls[0].x)}, ${Math.floor(this.balls[0].y)})`,
      `小球1速度: ${Math.floor(this.balls[0].body.speed)}px/s`
    ]);
  }

  createBallTexture() {
    const graphics = this.add.graphics();
    
    // 绘制渐变球体效果
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillCircle(16, 16, 16);
    
    graphics.fillStyle(0x66ccff, 1);
    graphics.fillCircle(12, 12, 10);
    
    graphics.fillStyle(0xaaddff, 0.8);
    graphics.fillCircle(10, 10, 6);
    
    graphics.generateTexture('ballTex', 32, 32);
    graphics.destroy();
  }

  createCenterTexture() {
    const graphics = this.add.graphics();
    
    // 绘制中心吸引点（发光效果）
    graphics.fillStyle(0xff0000, 0.3);
    graphics.fillCircle(20, 20, 20);
    
    graphics.fillStyle(0xff3333, 0.6);
    graphics.fillCircle(20, 20, 15);
    
    graphics.fillStyle(0xff6666, 1);
    graphics.fillCircle(20, 20, 10);
    
    graphics.fillStyle(0xffaaaa, 1);
    graphics.fillCircle(20, 20, 5);
    
    graphics.generateTexture('centerTex', 40, 40);
    graphics.destroy();
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
      gravity: { y: 0 }, // 关闭全局重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);