class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：发射的子弹数量
    this.player = null;
    this.bullets = null;
    this.cursors = null;
    this.rotationSpeed = 3; // 旋转速度（度/帧）
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示方向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 前端（指向右侧）
    playerGraphics.lineTo(-10, -10); // 左后
    playerGraphics.lineTo(-10, 10);  // 右后
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.99);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 鼠标右键输入
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.fireBullet();
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 显示操作提示
    this.add.text(10, 550, '左右箭头键旋转，鼠标右键发射', {
      fontSize: '14px',
      fill: '#00ff00'
    });

    this.updateStatusText();
  }

  fireBullet() {
    // 获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹角度与玩家一致
      bullet.rotation = this.player.rotation;
      
      // 根据玩家角度计算速度向量
      // Phaser角度是弧度制，velocityFromAngle需要角度制
      const angleInDegrees = Phaser.Math.RadToDeg(this.player.rotation);
      const velocity = this.physics.velocityFromAngle(angleInDegrees, 240);
      
      bullet.body.setVelocity(velocity.x, velocity.y);
      
      // 子弹生命周期管理
      bullet.lifespan = 3000; // 3秒后销毁
      bullet.spawnTime = this.time.now;
      
      // 更新状态
      this.bulletsFired++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `子弹发射数: ${this.bulletsFired}\n` +
      `玩家角度: ${Math.round(Phaser.Math.RadToDeg(this.player.rotation))}°`
    );
  }

  update(time, delta) {
    // 玩家旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= this.rotationSpeed;
    } else if (this.cursors.right.isDown) {
      this.player.angle += this.rotationSpeed;
    }

    // 更新状态显示
    if (this.cursors.left.isDown || this.cursors.right.isDown) {
      this.updateStatusText();
    }

    // 清理超出边界或超时的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查是否超出世界边界
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.setVelocity(0, 0);
        }
        
        // 检查生命周期
        if (time - bullet.spawnTime > bullet.lifespan) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.setVelocity(0, 0);
        }
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);