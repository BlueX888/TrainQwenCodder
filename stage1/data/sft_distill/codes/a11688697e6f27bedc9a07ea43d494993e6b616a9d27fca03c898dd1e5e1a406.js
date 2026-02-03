class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.totalDistance = 0; // 可验证的状态信号
    this.attractionForce = 80; // 吸引速度基准
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建中心点纹理
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xffff00, 1);
    centerGraphics.fillCircle(16, 16, 16);
    centerGraphics.generateTexture('centerPoint', 32, 32);
    centerGraphics.destroy();

    // 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(12, 12, 12);
    ballGraphics.generateTexture('ball', 24, 24);
    ballGraphics.destroy();

    // 设置中心吸引点
    this.centerX = 400;
    this.centerY = 300;
    
    // 添加中心点显示
    this.centerPoint = this.add.sprite(this.centerX, this.centerY, 'centerPoint');

    // 创建3个小球
    this.balls = [];
    const positions = [
      { x: 200, y: 150 },
      { x: 600, y: 200 },
      { x: 300, y: 450 }
    ];

    positions.forEach((pos, index) => {
      const ball = this.physics.add.sprite(pos.x, pos.y, 'ball');
      ball.setDamping(true);
      ball.setDrag(0.98); // 轻微阻尼，让运动更自然
      ball.lastX = pos.x;
      ball.lastY = pos.y;
      this.balls.push(ball);
    });

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 560, '3个绿色小球受中心黄色点吸引\n吸引力 = 80 / 距离', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    let frameDistance = 0;

    this.balls.forEach((ball, index) => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      // 防止距离为0导致除法错误，设置最小距离
      const safeDistance = Math.max(distance, 10);

      // 计算吸引力（与距离成反比）
      const force = this.attractionForce / safeDistance;

      // 计算从小球指向中心点的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      // 将吸引力分解为x和y方向的速度分量
      const velocityX = Math.cos(angle) * force * 100;
      const velocityY = Math.sin(angle) * force * 100;

      // 应用速度
      ball.setVelocity(velocityX, velocityY);

      // 计算本帧移动距离
      const movedDistance = Phaser.Math.Distance.Between(
        ball.lastX,
        ball.lastY,
        ball.x,
        ball.y
      );
      frameDistance += movedDistance;

      // 更新上一帧位置
      ball.lastX = ball.x;
      ball.lastY = ball.y;
    });

    // 累计总移动距离
    this.totalDistance += frameDistance;

    // 更新信息显示
    this.infoText.setText([
      `总移动距离: ${Math.floor(this.totalDistance)}`,
      `小球1距离: ${Math.floor(Phaser.Math.Distance.Between(this.balls[0].x, this.balls[0].y, this.centerX, this.centerY))}`,
      `小球2距离: ${Math.floor(Phaser.Math.Distance.Between(this.balls[1].x, this.balls[1].y, this.centerX, this.centerY))}`,
      `小球3距离: ${Math.floor(Phaser.Math.Distance.Between(this.balls[2].x, this.balls[2].y, this.centerX, this.centerY))}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 不使用全局重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);