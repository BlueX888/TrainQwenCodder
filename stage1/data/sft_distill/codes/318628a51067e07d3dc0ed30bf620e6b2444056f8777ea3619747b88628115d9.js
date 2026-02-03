class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证的状态信号
    this.player = null;
    this.bullets = null;
    this.cursors = null;
    this.rotationSpeed = 3; // 旋转速度（度/帧）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形，指向右侧表示初始朝向）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.beginPath();
    graphics.moveTo(20, 0);    // 尖端（右侧）
    graphics.lineTo(-10, -10); // 左上
    graphics.lineTo(-10, 10);  // 左下
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture('player', 30, 20);
    graphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

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
        this.shootBullet();
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    this.updateStatusText();

    // 添加说明文字
    this.add.text(10, 550, '左右方向键旋转 | 鼠标右键射击', {
      fontSize: '16px',
      fill: '#aaaaaa'
    });
  }

  update(time, delta) {
    // 旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= this.rotationSpeed;
    } else if (this.cursors.right.isDown) {
      this.player.angle += this.rotationSpeed;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });
  }

  shootBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹角度与玩家一致
      bullet.rotation = this.player.rotation;
      
      // 根据玩家角度计算速度向量
      // Phaser 的角度是顺时针的，0度朝右
      const velocity = this.physics.velocityFromAngle(
        this.player.angle, 
        160
      );
      
      bullet.body.setVelocity(velocity.x, velocity.y);
      
      // 更新状态
      this.bulletsFired++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `子弹发射数: ${this.bulletsFired}\n` +
      `玩家角度: ${Math.round(this.player.angle)}°`
    );
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);